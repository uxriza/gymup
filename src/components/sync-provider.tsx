import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { useGymStore } from "@/store/gym-store";
import { defaultExercises, defaultWorkouts } from "@/data";
import { syncAnalyticsState, upsertAnalyticsProfile } from "@/lib/analytics-sync";
import type { Exercise, Session, Workout } from "@/types";

type SyncState = {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
};

const mergeRemoteFirstById = <T extends { id: string }>(remoteItems: T[], localItems: T[]) => {
  const itemsById = new Map<string, T>();
  remoteItems.forEach((item) => itemsById.set(item.id, item));
  localItems.forEach((item) => {
    if (!itemsById.has(item.id)) {
      itemsById.set(item.id, item);
    }
  });
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

const mergeSessions = (remoteSessions: Session[], localSessions: Session[]) => {
  const sessionsById = new Map<string, Session>();
  remoteSessions.forEach((session) => sessionsById.set(session.id, session));
  localSessions.forEach((session) => sessionsById.set(session.id, session));
  return Array.from(sessionsById.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

const normalizeRemoteState = (remoteState: Partial<SyncState> | null | undefined): SyncState => ({
  exercises: mergeRemoteFirstById(remoteState?.exercises ?? [], defaultExercises),
  workouts: mergeRemoteFirstById(remoteState?.workouts ?? [], defaultWorkouts),
  sessions: (remoteState?.sessions ?? []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
});

const mergeRemoteWithLocalState = (remoteState: Partial<SyncState> | null | undefined, localState: SyncState): SyncState => {
  const normalizedRemoteState = normalizeRemoteState(remoteState);
  return {
    exercises: mergeRemoteFirstById(normalizedRemoteState.exercises, localState.exercises),
    workouts: mergeRemoteFirstById(normalizedRemoteState.workouts, localState.workouts),
    sessions: mergeSessions(normalizedRemoteState.sessions, localState.sessions),
  };
};

export function SyncProvider({ children }: { children: ReactNode }) {
  const { authEnabled, loading, signingOut, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !authEnabled || loading || signingOut || !user?.id) return;

    const supabaseClient = supabase;
    let syncTimer: number | undefined;
    let isApplyingRemoteState = false;
    let syncErrorShown = false;
    let isDisposed = false;

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
      if (isDisposed) return;
      const { error } = await supabaseClient.from("gymup_sync_states").upsert({
        user_id: userId,
        state,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      await syncAnalyticsState(userId, state);
      syncErrorShown = false;
    };

    const startSync = async () => {
      await upsertAnalyticsProfile(user).catch(notifySyncError);
      if (isDisposed) return undefined;
      const localSnapshot = getSnapshot();

      const remoteResult = await supabaseClient
        .from("gymup_sync_states")
        .select("state")
        .eq("user_id", user.id)
        .maybeSingle();

      if (remoteResult.error) {
        notifySyncError();
        return undefined;
      }

      if (remoteResult.data?.state) {
        const mergedState = mergeRemoteWithLocalState(remoteResult.data.state as Partial<SyncState>, localSnapshot);
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(mergedState);
        isApplyingRemoteState = false;
        await saveState(user.id, mergedState).catch(notifySyncError);
      } else {
        const initialState = localSnapshot;
        isApplyingRemoteState = true;
        useGymStore.getState().replaceSyncedState(initialState);
        isApplyingRemoteState = false;
        await saveState(user.id, initialState).catch(notifySyncError);
      }

      return useGymStore.subscribe((state) => {
        if (isDisposed || isApplyingRemoteState) return;
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => {
          if (isDisposed) return;
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
      isDisposed = true;
      window.clearTimeout(syncTimer);
      unsubscribe?.();
    };
  }, [authEnabled, loading, signingOut, toast, user?.id]);

  return children;
}
