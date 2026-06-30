import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type ExerciseMediaProps = {
  exercise: Exercise;
  emptyLabel: string;
  className?: string;
};

export function ExerciseMedia({ exercise, emptyLabel, className }: ExerciseMediaProps) {
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [videoRetryCount, setVideoRetryCount] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setImageRetryCount(0);
    setVideoRetryCount(0);
    setHasImageError(false);
    setHasVideoError(false);
  }, [exercise.id, exercise.imageUrl, exercise.videoUrl]);

  const handleImageError = () => {
    if (imageRetryCount < 1) {
      setImageRetryCount((count) => count + 1);
      return;
    }
    setHasImageError(true);
  };

  const handleVideoError = () => {
    if (videoRetryCount < 1) {
      setVideoRetryCount((count) => count + 1);
      return;
    }
    setHasVideoError(true);
  };

  const showVideo = Boolean(exercise.videoUrl && !hasVideoError);
  const showImage = Boolean(exercise.imageUrl && !hasImageError);

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-secondary", className)}>
      {showVideo ? (
        <video
          key={`${exercise.videoUrl ?? "video"}-${videoRetryCount}`}
          className="aspect-video w-full bg-black object-cover"
          src={exercise.videoUrl}
          poster={showImage ? exercise.imageUrl : undefined}
          controls
          autoPlay
          loop
          playsInline
          muted
          preload="metadata"
          onError={handleVideoError}
        />
      ) : showImage ? (
        <img
          key={`${exercise.imageUrl ?? "image"}-${imageRetryCount}`}
          className="aspect-video w-full bg-black object-cover"
          src={exercise.imageUrl}
          alt={exercise.name}
          onError={handleImageError}
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-background px-4 text-center text-sm text-muted-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <p>{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}
