import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type ExerciseMediaProps = {
  exercise: Exercise;
  emptyLabel: string;
  className?: string;
};

const isLikelyPlayableVideo = (videoUrl?: string) => {
  if (!videoUrl) return false;

  try {
    const pathname = new URL(videoUrl).pathname.toLowerCase();
    return pathname.endsWith(".mp4") || pathname.endsWith(".webm");
  } catch {
    return false;
  }
};

export function ExerciseMedia({ exercise, emptyLabel, className }: ExerciseMediaProps) {
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [videoRetryCount, setVideoRetryCount] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [videoTimedOut, setVideoTimedOut] = useState(false);

  useEffect(() => {
    setImageRetryCount(0);
    setVideoRetryCount(0);
    setHasImageError(false);
    setHasVideoError(false);
    setVideoTimedOut(false);
  }, [exercise.id, exercise.imageUrl, exercise.videoUrl]);

  const canRenderVideo = isLikelyPlayableVideo(exercise.videoUrl);

  useEffect(() => {
    if (!canRenderVideo || hasVideoError || videoTimedOut) return undefined;

    const timeoutId = window.setTimeout(() => {
      setVideoTimedOut(true);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [canRenderVideo, hasVideoError, videoRetryCount, videoTimedOut]);

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
      setVideoTimedOut(false);
      return;
    }
    setHasVideoError(true);
  };

  const showVideo = Boolean(canRenderVideo && !hasVideoError && !videoTimedOut);
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
          onCanPlay={() => setVideoTimedOut(false)}
          onLoadedData={() => setVideoTimedOut(false)}
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
