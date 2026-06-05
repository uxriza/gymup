import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useGymStore } from "@/store/gym-store";
import { defaultExercises, defaultWorkouts } from "@/data";
import type { Exercise, Session, Workout } from "@/types";

type SyncState = {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
};

const mergeById = <T extends { id: string }>(remoteItems: T[], localItems: T[]) => {
  const itemsById = new Map<string, T>();
  remoteItems.forEach((item) => itemsById.set(item.id, item));
  localItems.forEach((item) => itemsById.set(item.id, item));
  return Array.from(itemsById.values());
};

const getSnapshot = (): SyncState => {
  const state = useGymStore.getState();
  return {
    exercises: state.exercises,
    workouts: state.workouts,
    sessions: state.sessions,
  };
};

const normalizeRemoteState = (remoteState: Partial<SyncState> | null | undefined): SyncState => ({
  exercises: mergeById(remoteState?.exercises ?? [], defaultExercises),
  workouts: mergeById(remoteState?.workouts ?? [], defaultWorkouts),
  sessions: (remoteState?.sessions ?? []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
});

const getEmptyAccountState = (): SyncState => ({
  exercises: defaultExercises,
  workouts: defaultWorkouts,
  sessions: [],
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const { authEnabled, loading, user } = useAuth();

  useEffect(() => {
    if (!supabase || !authEnabled || loading || !user?.id) return;

    const supabaseClient = supabase;
    let syncTimer: number | undefined;
    let isApplyingRemoteState = false;

    const saveState = async (userId: string, state: SyncState) => {
      await supabaseClient.from("gymup_sync_states").upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      });
    };

    const startSync = async () => {
      isApplyingRemoteState = true;
      useGymStore.getState().replaceSyncedState(getEmptyAccountState());
      isApplyingRemoteState = false;

      const remoteResult = await supabaseClient
        .from("gymup_sync_states")
        .select("state")
        .eq("user_id", user.id)
        .maybeSingle();

      if (remoteResult.data?.state) {
        const mergedState = normalizeRemoteState(remoteResult.data.state as Partial<SyncState>);
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(mergedState);
        isApplyingRemoteState = false;
        await saveState(user.id, mergedState);
      } else {
        const emptyAccountState = getEmptyAccountState();
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(emptyAccountState);
        isApplyingRemoteState = false;
        await saveState(user.id, emptyAccountState);
      }

      return useGymStore.subscribe((state) => {
        if (isApplyingRemoteState) return;
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => {
          void saveState(user.id, {
            exercises: state.exercises,
            workouts: state.workouts,
            sessions: state.sessions,
          });
        }, 800);
      });
    };

    let unsubscribe: (() => void) | undefined;
    void startSync().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      window.clearTimeout(syncTimer);
      unsubscribe?.();
    };
  }, [authEnabled, loading, user?.id]);

  return children;
}
