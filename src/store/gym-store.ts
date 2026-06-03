import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultExercises, defaultWorkouts } from "@/data";
import type { ActiveWorkout, CompletedExercise, Exercise, Session, Workout } from "@/types";
import { uid } from "@/lib/utils";

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

type GymState = {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  activeWorkout?: ActiveWorkout;
  startWorkout: (workoutId: string) => void;
  selectExercise: (index: number) => void;
  returnToExercisePicker: () => void;
  startSelectedExercise: () => void;
  incrementCurrentReps: (delta: number) => void;
  updateCurrentWeight: (weightKg?: number) => void;
  startRest: () => void;
  startNextSet: () => void;
  completeCurrentExercise: () => void;
  skipCurrentExercise: () => void;
  finishWorkout: (notes: string) => Session | undefined;
  cancelWorkout: () => void;
  replaceSyncedState: (state: Pick<GymState, "exercises" | "workouts" | "sessions">) => void;
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

        set({
          activeWorkout: {
            workoutId,
            startTime: new Date().toISOString(),
            currentIndex: 0,
            mode: "exercise_picker",
            exercises: workout.exerciseIds.map((exerciseId) => ({
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
      selectExercise: (index) => {
        const activeWorkout = get().activeWorkout;
        const selectedExercise = activeWorkout?.exercises[index];
        if (!activeWorkout || !selectedExercise) return;

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
      startRest: () => {
        const activeWorkout = get().activeWorkout;
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            mode: "resting",
            exercises: commitCurrentSet(activeWorkout, get().exercises, true).map((exercise, index) =>
              index === activeWorkout.currentIndex ? { ...exercise, status: "resting" } : exercise,
            ),
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
        if (!workout) return undefined;
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
          workoutId: workout.id,
          workoutName: workout.name,
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
        set({
          exercises: state.exercises,
          workouts: state.workouts,
          sessions: state.sessions,
        }),
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
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<GymState> | undefined;
        return {
          ...state,
          exercises: defaultExercises,
          workouts: defaultWorkouts,
          activeWorkout: undefined,
        };
      },
    },
  ),
);
