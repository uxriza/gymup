export type Exercise = {
  id: string;
  name: string;
  category: string;
  targetSets: number;
  targetReps: number;
  isOptional: boolean;
  notes?: string;
  equipment?: string[];
  updatedAt?: string;
  imageUrl?: string;
  videoUrl?: string;
  instructions?: string[];
};

export type Workout = {
  id: string;
  name: string;
  dayOfWeek?: string;
  warmupIds?: string[];
  exerciseIds: string[];
  cooldownIds?: string[];
};

export type CompletedExercise = {
  exerciseId: string;
  actualSets: number;
  actualReps: number;
  completed: boolean;
  skipped?: boolean;
  notes?: string;
  weightKg?: number;
};

export type Session = {
  id: string;
  date: string;
  workoutId: string;
  workoutName: string;
  startTime: string;
  endTime: string;
  exercises: CompletedExercise[];
  notes: string;
};

export type ActiveExercise = {
  exerciseId: string;
  status: "planned" | "selected" | "active" | "resting" | "completed" | "skipped";
  currentSet: number;
  currentReps: number;
  actualSets: number;
  actualReps: number;
  completed: boolean;
  skipped: boolean;
  startedAt?: string;
  weightKg?: number;
};

export type ActiveWorkout = {
  workoutId: string;
  customName?: string;
  isCustom?: boolean;
  startTime: string;
  phase: "warmup" | "main" | "cooldown";
  warmupIds?: string[];
  cooldownIds?: string[];
  restStartedAt?: string;
  restDurationSeconds?: number;
  currentIndex: number;
  mode: "exercise_picker" | "exercise_preview" | "exercise_active" | "resting";
  exercises: ActiveExercise[];
};
