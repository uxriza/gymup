import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { resolveExerciseImageUrl } from "@/lib/exercise-media";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type ExerciseThumbnailProps = {
  exercise: Exercise;
  className?: string;
};

export function ExerciseThumbnail({ exercise, className }: ExerciseThumbnailProps) {
  const resolvedImageUrl = resolveExerciseImageUrl(exercise.imageUrl);
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(resolvedImageUrl && !hasError);

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white",
        className,
      )}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          className="h-full w-full object-contain p-1"
          src={resolvedImageUrl}
          alt=""
          decoding="async"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-secondary text-primary">
          <Dumbbell className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
