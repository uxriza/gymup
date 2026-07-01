import type { Session } from "@/types";

export const hasMeaningfulSessionProgress = (session: Session) =>
  session.exercises.some((exercise) => exercise.completed || exercise.actualSets > 0 || exercise.actualReps > 0);
