import { useEffect, useState } from "react";
import { Dumbbell, RotateCw } from "lucide-react";
import { resolveExerciseImageUrl } from "@/lib/exercise-media";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type ExerciseMediaProps = {
  exercise: Exercise;
  emptyLabel: string;
  retryLabel: string;
  videoErrorLabel: string;
  className?: string;
};

export const isLikelyPlayableVideo = (videoUrl?: string) => {
  if (!videoUrl) return false;

  try {
    const parsedUrl = new URL(videoUrl, window.location.origin);
    const pathname = parsedUrl.pathname.toLowerCase();
    return pathname.endsWith(".mp4") || pathname.endsWith(".webm");
  } catch {
    return false;
  }
};

export function ExerciseMedia({ exercise, emptyLabel, retryLabel, videoErrorLabel, className }: ExerciseMediaProps) {
  const resolvedImageUrl = resolveExerciseImageUrl(exercise.imageUrl);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [videoRetryCount, setVideoRetryCount] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setImageRetryCount(0);
    setVideoRetryCount(0);
    setHasImageError(false);
    setHasVideoError(false);
  }, [exercise.id, resolvedImageUrl, exercise.videoUrl]);

  const canRenderVideo = isLikelyPlayableVideo(exercise.videoUrl);

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

  const showVideo = Boolean(canRenderVideo && !hasVideoError);
  const showImage = Boolean(resolvedImageUrl && !hasImageError);
  const showVideoError = Boolean(canRenderVideo && hasVideoError);

  const retryVideo = () => {
    setHasVideoError(false);
    setVideoRetryCount((count) => count + 1);
  };

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-secondary", className)}>
      {showVideo ? (
        <video
          key={`${exercise.videoUrl ?? "video"}-${videoRetryCount}`}
          className="aspect-video w-full bg-black object-cover"
          src={exercise.videoUrl}
          poster={showImage ? resolvedImageUrl : undefined}
          controls
          autoPlay
          loop
          playsInline
          muted
          preload="metadata"
          onError={handleVideoError}
        />
      ) : showVideoError ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-background px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{videoErrorLabel}</p>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            onClick={retryVideo}
          >
            <RotateCw className="h-4 w-4" />
            {retryLabel}
          </button>
        </div>
      ) : showImage ? (
        <img
          key={`${resolvedImageUrl ?? "image"}-${imageRetryCount}`}
          className="aspect-video w-full bg-black object-cover"
          src={resolvedImageUrl}
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
