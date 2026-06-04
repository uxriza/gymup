import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Dumbbell, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatDayLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";

const order = ["push", "pull", "legs"];

export function SelectWorkoutPage() {
  const navigate = useNavigate();
  const { workouts, exercises, startWorkout } = useGymStore();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const visibleWorkouts = [...workouts].sort((a, b) => {
    const aIndex = order.findIndex((key) => a.id.includes(key));
    const bIndex = order.findIndex((key) => b.id.includes(key));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkoutId((current) => (current === workoutId ? null : workoutId));
  };

  const startSelectedWorkout = (workoutId: string) => {
    startWorkout(workoutId);
    navigate("/workout");
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <Button className="min-h-11 w-fit px-0 text-muted-foreground" variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Beranda
        </Button>
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-primary">
          <ListChecks className="h-4 w-4" />
          Program siap latihan
          </p>
          <h1 className="text-3xl font-bold tracking-normal">Pilih latihan</h1>
          <p className="text-sm text-muted-foreground">
          Pilih Push, Pull, atau Legs. Buka program untuk melihat gerakan dan mulai latihan.
          </p>
        </div>
      </section>

      <section className="grid gap-3">
        {visibleWorkouts.map((workout) => {
          const workoutExercises = workout.exerciseIds
            .map((id) => exercises.find((exercise) => exercise.id === id))
            .filter(Boolean);
          const equipment = Array.from(new Set(workoutExercises.flatMap((exercise) => exercise?.equipment || []))).slice(0, 4);
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <Card key={workout.id} className="overflow-hidden transition-colors hover:border-primary/40">
              <button
                type="button"
                className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => toggleWorkout(workout.id)}
                aria-expanded={isExpanded}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{workout.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDayLabel(workout.dayOfWeek)} · {workoutExercises.length} gerakan
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180 text-primary",
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isExpanded ? (
                <CardContent className="animate-in slide-in-from-top-1 space-y-4 p-4 pt-0 duration-200 sm:p-6 sm:pt-0">
                  <div className="space-y-2">
                    {workoutExercises.slice(0, 6).map((exercise, index) => (
                      <div key={exercise!.id} className="flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {index + 1}. {exercise!.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {exercise!.targetSets} x {exercise!.targetReps} · {formatCategoryLabel(exercise!.category)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("shrink-0", exercise!.isOptional && "text-muted-foreground")}
                        >
                          {exercise!.isOptional ? "Opsional" : "Rekomendasi"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {equipment.length ? (
                    <div className="flex flex-wrap gap-2">
                      {equipment.map((item) => (
                        <Badge key={item} variant="secondary" className="gap-1 text-muted-foreground">
                          <Dumbbell className="h-3 w-3" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              ) : null}

              <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                <Button className="min-h-12 w-full" size="lg" onClick={() => startSelectedWorkout(workout.id)}>
                  Mulai
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
