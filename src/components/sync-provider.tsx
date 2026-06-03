import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useGymStore } from "@/store/gym-store";
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

const mergeState = (remoteState: Partial<SyncState> | null | undefined, localState: SyncState): SyncState => ({
  exercises: mergeById(remoteState?.exercises ?? [], localState.exercises),
  workouts: mergeById(remoteState?.workouts ?? [], localState.workouts),
  sessions: mergeById(remoteState?.sessions ?? [], localState.sessions).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
});

export function SyncProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!supabase) return;

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
      const sessionResult = await supabaseClient.auth.getSession();
      let user = sessionResult.data.session?.user;

      if (!user) {
        const anonymousResult = await supabaseClient.auth.signInAnonymously();
        user = anonymousResult.data.user ?? undefined;
      }

      if (!user) return;

      const remoteResult = await supabaseClient
        .from("gymup_sync_states")
        .select("state")
        .eq("user_id", user.id)
        .maybeSingle();

      if (remoteResult.data?.state) {
        const mergedState = mergeState(remoteResult.data.state as Partial<SyncState>, getSnapshot());
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(mergedState);
        isApplyingRemoteState = false;
        await saveState(user.id, mergedState);
      } else {
        await saveState(user.id, getSnapshot());
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
  }, []);

  return children;
}
