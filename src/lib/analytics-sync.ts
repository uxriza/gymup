import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Exercise, Session, Workout } from "@/types";

type AnalyticsState = {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
};

const buildInFilter = (values: string[]) => `(${values.map((value) => JSON.stringify(value)).join(",")})`;

const getDurationMinutes = (session: Session) =>
  Math.max(Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000), 1);

const getDisplayName = (user: User) => {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0] || "Kamu";
};

export const upsertAnalyticsProfile = async (user: User) => {
  if (!supabase || !user.email) return;

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    email: user.email.toLowerCase(),
    display_name: getDisplayName(user),
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
};

export const syncAnalyticsState = async (userId: string, state: AnalyticsState) => {
  if (!supabase) return;

  if (state.sessions.length === 0) {
    const { error: exerciseDeleteError } = await supabase.from("session_exercises").delete().eq("user_id", userId);
    if (exerciseDeleteError) throw exerciseDeleteError;
    const { error } = await supabase.from("workout_sessions").delete().eq("user_id", userId);
    if (error) throw error;
    return;
  }

  const exerciseById = new Map(state.exercises.map((exercise) => [exercise.id, exercise]));
  const workoutById = new Map(state.workouts.map((workout) => [workout.id, workout]));
  const now = new Date().toISOString();
  const sessionRows = state.sessions.map((session) => {
    const completedExercises = session.exercises.filter((exercise) => exercise.completed);
    const totalSets = session.exercises.reduce((total, exercise) => total + exercise.actualSets, 0);
    const totalReps = session.exercises.reduce((total, exercise) => total + exercise.actualReps, 0);
    const workout = workoutById.get(session.workoutId);

    return {
      id: session.id,
      user_id: userId,
      workout_id: workout?.id ?? session.workoutId,
      workout_name: workout?.name ?? session.workoutName,
      started_at: session.startTime,
      ended_at: session.endTime,
      duration_minutes: getDurationMinutes(session),
      completed_exercise_count: completedExercises.length,
      total_exercise_count: session.exercises.length,
      total_sets: totalSets,
      total_reps: totalReps,
      notes: session.notes || null,
      updated_at: now,
    };
  });

  const { error: sessionError } = await supabase.from("workout_sessions").upsert(sessionRows);
  if (sessionError) throw sessionError;

  const sessionIds = state.sessions.map((session) => session.id);
  const sessionIdFilter = buildInFilter(sessionIds);

  const { error: staleSessionError } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("user_id", userId)
    .not("id", "in", sessionIdFilter);
  if (staleSessionError) throw staleSessionError;

  const exerciseRows = state.sessions.flatMap((session) =>
    session.exercises.map((exercise) => {
      const catalogExercise = exerciseById.get(exercise.exerciseId);
      return {
        session_id: session.id,
        exercise_id: exercise.exerciseId,
        user_id: userId,
        exercise_name: catalogExercise?.name ?? "Gerakan",
        category: catalogExercise?.category ?? null,
        actual_sets: exercise.actualSets,
        actual_reps: exercise.actualReps,
        completed: exercise.completed,
        skipped: Boolean(exercise.skipped),
        weight_kg: exercise.weightKg ?? null,
        updated_at: now,
      };
    }),
  );

  if (exerciseRows.length) {
    const { error: exerciseError } = await supabase.from("session_exercises").upsert(exerciseRows);
    if (exerciseError) throw exerciseError;
  }

  const { error: staleExerciseError } = await supabase
    .from("session_exercises")
    .delete()
    .eq("user_id", userId)
    .not("session_id", "in", sessionIdFilter);
  if (staleExerciseError) throw staleExerciseError;
};
