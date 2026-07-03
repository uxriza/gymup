import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultExercises, defaultWorkouts } from "@/data";
import { captureSentryMessage } from "@/lib/sentry";
import type { ActiveWorkout, CompletedExercise, Exercise, Session, Workout } from "@/types";
import { uid } from "@/lib/utils";

const isSeedItem = <T extends { id: string }>(item: unknown): item is T =>
  Boolean(item && typeof item === "object" && "id" in item && typeof (item as { id?: unknown }).id === "string");

const mergeSeedItemsById = <T extends { id: string }>(seedItems: T[], storedItems?: T[]) => {
  const itemsById = new Map<string, T>();
  seedItems.forEach((item) => itemsById.set(item.id, item));

  const validStoredItems = storedItems?.filter(isSeedItem<T>) ?? [];
  validStoredItems.forEach((item) => itemsById.set(item.id, item));

  return Array.from(itemsById.values());
};

const normalizeSeedState = (
  state?: Partial<Pick<GymState, "exercises" | "workouts" | "sessions">>,
  source: "persist" | "sync" | "unknown" = "unknown",
) => {
  const inputExercises = Array.isArray(state?.exercises) ? state.exercises : [];
  const inputWorkouts = Array.isArray(state?.workouts) ? state.workouts : [];
  const validInputExercises = inputExercises.filter(isSeedItem<Exercise>);
  const validInputWorkouts = inputWorkouts.filter(isSeedItem<Workout>);
  const normalizedExercises = mergeSeedItemsById(defaultExercises, inputExercises);
  const normalizedWorkouts = mergeSeedItemsById(defaultWorkouts, inputWorkouts);
  const sessions = Array.isArray(state?.sessions) ? state.sessions : [];
  const usedExerciseFallback = inputExercises.length === 0 || validInputExercises.length !== inputExercises.length;
  const usedWorkoutFallback = inputWorkouts.length === 0 || validInputWorkouts.length !== inputWorkouts.length;

  if ((inputExercises.length === 0 || inputWorkouts.length === 0 || usedExerciseFallback || usedWorkoutFallback) && state) {
    captureSentryMessage("GymUp seed fallback applied", {
      source,
      inputExerciseCount: inputExercises.length,
      inputWorkoutCount: inputWorkouts.length,
      normalizedExerciseCount: normalizedExercises.length,
      normalizedWorkoutCount: normalizedWorkouts.length,
      sessionCount: sessions.length,
    });
  }

  return {
    exercises: normalizedExercises,
    workouts: normalizedWorkouts,
    sessions,
  };
};

const resetTransientExercises = (activeWorkout: ActiveWorkout, selectedIndex: number) =>
  activeWorkout.exercises.map((exercise, index) => {
    if (index === selectedIndex) return exercise;
    if (exercise.status === "selected") {
      return { ...exercise, status: "planned" as const };
    }
    return exercise;
  });

const commitCurrentSet = (activeWorkout: ActiveWorkout, exerciseCatalog: Exercise[], commitEmptySet = false) =>
  activeWorkout.exercises.map((exercise, index) => {
    if (index !== activeWorkout.currentIndex || exercise.status === "resting") return exercise;
    if (!commitEmptySet && exercise.currentReps <= 0) return exercise;

    const targetReps = exerciseCatalog.find((item) => item.id === exercise.exerciseId)?.targetReps ?? 0;
    const repsToSave = exercise.currentReps > 0 ? exercise.currentReps : targetReps;

    return {
      ...exercise,
      actualSets: exercise.actualSets + 1,
      actualReps: exercise.actualReps + repsToSave,
      currentReps: 0,
    };
  });

const getLatestWeightForExercise = (sessions: Session[], exerciseId: string) => {
  for (const session of sessions) {
    const previousExercise = session.exercises.find((exercise) => exercise.exerciseId === exerciseId && exercise.weightKg !== undefined);
    if (previousExercise?.weightKg !== undefined) {
      return previousExercise.weightKg;
    }
  }

  return undefined;
};

const isPrepExercise = (exerciseId: string, exercises: Exercise[], categories: string[]) => {
  const exercise = exercises.find((item) => item.id === exerciseId);
  return Boolean(exercise && categories.includes(exercise.category));
};

const getCustomWorkoutName = () => {
  if (typeof window === "undefined") return "Latihan mandiri";
  return window.localStorage.getItem("gymup-language") === "en" ? "Custom workout" : "Latihan mandiri";
};

type GymState = {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  activeWorkout?: ActiveWorkout;
  startWorkout: (workoutId: string) => void;
  startCustomWorkout: () => void;
  completeWarmup: () => void;
  startCooldown: () => void;
  returnToMainSession: () => void;
  selectCustomExercise: (exerciseId: string) => void;
  selectExercise: (index: number) => void;
  returnToExercisePicker: () => void;
  startSelectedExercise: () => void;
  incrementCurrentReps: (delta: number) => void;
  updateCurrentWeight: (weightKg?: number) => void;
  startRest: (durationSeconds?: number) => void;
  stopRestTimer: () => void;
  startNextSet: () => void;
  completeCurrentExercise: () => void;
  skipCurrentExercise: () => void;
  finishWorkout: (notes: string) => Session | undefined;
  cancelWorkout: () => void;
  replaceSyncedState: (state: Pick<GymState, "exercises" | "workouts" | "sessions">) => void;
  resetLocalState: () => void;
  resetHistory: () => void;
  addExercise: (exercise: Omit<Exercise, "id">) => void;
  addWorkout: (name: string, dayOfWeek: string, exerciseIds: string[]) => void;
  deleteWorkout: (workoutId: string) => void;
};

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      workouts: defaultWorkouts,
      sessions: [],
      startWorkout: (workoutId) => {
        const workout = get().workouts.find((item) => item.id === workoutId);
        if (!workout) return;
        const catalog = get().exercises;
        const warmupIds = workout.warmupIds?.length
          ? workout.warmupIds
          : workout.exerciseIds.filter((exerciseId) => isPrepExercise(exerciseId, catalog, ["Warmup"]));
        const cooldownIds = workout.cooldownIds?.length
          ? workout.cooldownIds
          : workout.exerciseIds.filter((exerciseId) => isPrepExercise(exerciseId, catalog, ["Cooldown"]));
        const mainExerciseIds = workout.exerciseIds.filter(
          (exerciseId) => !isPrepExercise(exerciseId, catalog, ["Warmup", "Cooldown"]),
        );

        set({
          activeWorkout: {
            workoutId,
            startTime: new Date().toISOString(),
            phase: warmupIds.length ? "warmup" : "main",
            warmupIds,
            cooldownIds,
            currentIndex: 0,
            mode: "exercise_picker",
            exercises: mainExerciseIds.map((exerciseId) => ({
              exerciseId,
              status: "planned",
              currentSet: 1,
              currentReps: 0,
              actualSets: 0,
              actualReps: 0,
              completed: false,
              skipped: false,
              weightKg: getLatestWeightForExercise(get().sessions, exerciseId),
            })),
          },
        });
      },
      startCustomWorkout: () => {
        set({
          activeWorkout: {
            workoutId: "custom-session",
            customName: getCustomWorkoutName(),
            isCustom: true,
            startTime: new Date().toISOString(),
            phase: "warmup",
            warmupIds: ["dynamic-warm-up"],
            cooldownIds: ["full-body-stretch"],
            currentIndex: 0,
            mode: "exercise_picker",
            exercises: [],
          },
        });
      },
      completeWarmup: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            phase: "main",
            mode: "exercise_picker",
          },
        });
      },
      startCooldown: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            phase: activeWorkout.cooldownIds?.length ? "cooldown" : "main",
            mode: "exercise_picker",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
          },
        });
      },
      returnToMainSession: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            phase: "main",
            mode: "exercise_picker",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
          },
        });
      },
      selectCustomExercise: (exerciseId) => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout?.isCustom || activeWorkout.phase !== "main") return;

        const existingIndex = activeWorkout.exercises.findIndex((exercise) => exercise.exerciseId === exerciseId);

        if (existingIndex >= 0) {
          get().selectExercise(existingIndex);
          return;
        }

        set({
          activeWorkout: {
            ...activeWorkout,
            currentIndex: activeWorkout.exercises.length,
            mode: "exercise_preview",
            exercises: [
              ...resetTransientExercises(activeWorkout, activeWorkout.exercises.length),
              {
                exerciseId,
                status: "selected",
                currentSet: 1,
                currentReps: 0,
                actualSets: 0,
                actualReps: 0,
                completed: false,
                skipped: false,
                weightKg: getLatestWeightForExercise(get().sessions, exerciseId),
              },
            ],
          },
        });
      },
      selectExercise: (index) => {
        const activeWorkout = get().activeWorkout;
        const selectedExercise = activeWorkout?.exercises[index];
        if (!activeWorkout || activeWorkout.phase !== "main" || !selectedExercise) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            currentIndex: index,
            mode: "exercise_preview",
            exercises: resetTransientExercises(
              {
                ...activeWorkout,
                exercises: activeWorkout.exercises.map((exercise, exerciseIndex) =>
                  exerciseIndex === index && exercise.status === "planned"
                    ? { ...exercise, status: "selected" }
                    : exercise,
                ),
              },
              index,
            ),
          },
        });
      },
      returnToExercisePicker: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "exercise_picker",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex && exercise.status === "selected"
                ? { ...exercise, status: "planned" }
                : exercise,
            ),
          },
        });
      },
      startSelectedExercise: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;
        const activeExercise = activeWorkout.exercises[activeWorkout.currentIndex];
        const targetReps = get().exercises.find((item) => item.id === activeExercise?.exerciseId)?.targetReps ?? 0;
        const latestWeight = activeExercise
          ? getLatestWeightForExercise(get().sessions, activeExercise.exerciseId)
          : undefined;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "exercise_active",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex
                ? {
                    ...exercise,
                    status: "active",
                    skipped: false,
                    completed: false,
                    currentReps: exercise.currentReps || targetReps,
                    weightKg: exercise.weightKg ?? latestWeight,
                    startedAt: exercise.startedAt ?? new Date().toISOString(),
                  }
                : exercise,
            ),
          },
        });
      },
      incrementCurrentReps: (delta) => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex
                ? { ...exercise, currentReps: Math.max(exercise.currentReps + delta, 0) }
                : exercise,
            ),
          },
        });
      },
      updateCurrentWeight: (weightKg) => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex ? { ...exercise, weightKg } : exercise,
            ),
          },
        });
      },
      startRest: (durationSeconds = 90) => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "resting",
            restStartedAt: new Date().toISOString(),
            restDurationSeconds: durationSeconds,
            exercises: commitCurrentSet(activeWorkout, get().exercises, true).map((exercise, index) =>
              index === activeWorkout.currentIndex ? { ...exercise, status: "resting" } : exercise,
            ),
          },
        });
      },
      stopRestTimer: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            restStartedAt: undefined,
            restDurationSeconds: 0,
          },
        });
      },
      startNextSet: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;
        const activeExercise = activeWorkout.exercises[activeWorkout.currentIndex];
        const targetReps = get().exercises.find((item) => item.id === activeExercise?.exerciseId)?.targetReps ?? 0;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "exercise_active",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex
                ? { ...exercise, status: "active", currentSet: exercise.currentSet + 1, currentReps: targetReps }
                : exercise,
            ),
          },
        });
      },
      completeCurrentExercise: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;
        const committedExercises = commitCurrentSet(
          activeWorkout,
          get().exercises,
          activeWorkout.mode === "exercise_active",
        );

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "exercise_picker",
            restStartedAt: undefined,
            restDurationSeconds: undefined,
            exercises: committedExercises.map((exercise, index) =>
              index === activeWorkout.currentIndex
                ? {
                    ...exercise,
                    status: "completed",
                    completed: true,
                    skipped: false,
                    currentReps: 0,
                  }
                : exercise,
            ),
          },
        });
      },
      skipCurrentExercise: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "exercise_picker",
            exercises: activeWorkout.exercises.map((exercise, index) =>
              index === activeWorkout.currentIndex
                ? {
                    ...exercise,
                    status: "skipped",
                    completed: false,
                    skipped: true,
                    currentReps: 0,
                  }
                : exercise,
            ),
          },
        });
      },
      finishWorkout: (notes) => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return undefined;
        const workout = get().workouts.find((item) => item.id === activeWorkout.workoutId);
        const exercises = commitCurrentSet(
          activeWorkout,
          get().exercises,
          activeWorkout.mode === "exercise_active",
        ).map<CompletedExercise>((exercise) => ({
          exerciseId: exercise.exerciseId,
          actualSets: exercise.actualSets,
          actualReps: exercise.actualReps,
          completed: exercise.completed,
          skipped: exercise.skipped,
          weightKg: exercise.weightKg,
        }));

        const session: Session = {
          id: uid("session"),
          date: new Date().toISOString(),
          workoutId: workout?.id ?? activeWorkout.workoutId,
          workoutName: workout?.name ?? activeWorkout.customName ?? getCustomWorkoutName(),
          startTime: activeWorkout.startTime,
          endTime: new Date().toISOString(),
          exercises,
          notes,
        };

        set((state) => ({
          sessions: [session, ...state.sessions],
          activeWorkout: undefined,
        }));

        return session;
      },
      cancelWorkout: () => set({ activeWorkout: undefined }),
      replaceSyncedState: (state) =>
        set((currentState) => {
          const normalizedState = normalizeSeedState(state, "sync");
          return {
            ...normalizedState,
            activeWorkout: currentState.activeWorkout,
          };
        }),
      resetLocalState: () =>
        set({
          exercises: defaultExercises,
          workouts: defaultWorkouts,
          sessions: [],
          activeWorkout: undefined,
        }),
      resetHistory: () => set({ sessions: [] }),
      addExercise: (exercise) => {
        set((state) => ({
          exercises: [...state.exercises, { ...exercise, id: uid("exercise") }],
        }));
      },
      addWorkout: (name, dayOfWeek, exerciseIds) => {
        set((state) => ({
          workouts: [...state.workouts, { id: uid("workout"), name, dayOfWeek, exerciseIds }],
        }));
      },
      deleteWorkout: (workoutId) => {
        set((state) => ({ workouts: state.workouts.filter((workout) => workout.id !== workoutId) }));
      },
    }),
    {
      name: "gymup-store",
      version: 11,
      migrate: (persistedState) => {
        const state = persistedState as Partial<GymState> | undefined;
        const normalizedState = normalizeSeedState(state, "persist");
        return {
          ...state,
          ...normalizedState,
          activeWorkout: state?.activeWorkout,
        };
      },
    },
  ),
);
