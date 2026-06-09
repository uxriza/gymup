import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !authEnabled || loading || !user?.id) return;

    const supabaseClient = supabase;
    let syncTimer: number | undefined;
    let isApplyingRemoteState = false;
    let syncErrorShown = false;

    const notifySyncError = () => {
      if (syncErrorShown) return;
      syncErrorShown = true;
      toast({
        title: "Sinkronisasi tertunda",
        description: "Data tetap tersimpan di perangkat ini. Coba cek koneksi nanti",
        variant: "destructive",
      });
    };

    const saveState = async (userId: string, state: SyncState) => {
      const { error } = await supabaseClient.from("gymup_sync_states").upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      syncErrorShown = false;
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

      if (remoteResult.error) {
        notifySyncError();
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(getEmptyAccountState());
        isApplyingRemoteState = false;
        return useGymStore.subscribe((state) => {
          if (isApplyingRemoteState) return;
          window.clearTimeout(syncTimer);
          syncTimer = window.setTimeout(() => {
            void saveState(user.id, {
              exercises: state.exercises,
              workouts: state.workouts,
              sessions: state.sessions,
            }).catch(notifySyncError);
          }, 800);
        });
      }

      if (remoteResult.data?.state) {
        const mergedState = normalizeRemoteState(remoteResult.data.state as Partial<SyncState>);
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(mergedState);
        isApplyingRemoteState = false;
        await saveState(user.id, mergedState).catch(notifySyncError);
      } else {
        const emptyAccountState = getEmptyAccountState();
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(emptyAccountState);
        isApplyingRemoteState = false;
        await saveState(user.id, emptyAccountState).catch(notifySyncError);
      }

      return useGymStore.subscribe((state) => {
        if (isApplyingRemoteState) return;
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => {
          void saveState(user.id, {
            exercises: state.exercises,
            workouts: state.workouts,
            sessions: state.sessions,
          }).catch(notifySyncError);
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
  }, [authEnabled, loading, toast, user?.id]);

  return children;
}
