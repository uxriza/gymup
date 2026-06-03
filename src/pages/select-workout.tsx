import { ChevronRight, Dumbbell, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCategoryLabel, formatDayLabel } from "@/lib/labels";
import { useGymStore } from "@/store/gym-store";

const order = ["push", "pull", "legs"];

export function SelectWorkoutPage() {
  const navigate = useNavigate();
  const { workouts, exercises, startWorkout } = useGymStore();

  const visibleWorkouts = [...workouts].sort((a, b) => {
      const aIndex = order.findIndex((key) => a.id.includes(key));
      const bIndex = order.findIndex((key) => b.id.includes(key));
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-primary">
          <ListChecks className="h-4 w-4" />
          Program siap latihan
        </p>
        <h1 className="text-3xl font-bold tracking-normal">Pilih latihan</h1>
        <p className="text-sm text-muted-foreground">Pilih Push, Pull, atau Legs. Setiap program berisi urutan gerakan, target set, target rep, dan panduan gerakan.</p>
      </section>

      <section className="grid gap-3">
        {visibleWorkouts.map((workout) => {
          const workoutExercises = workout.exerciseIds
            .map((id) => exercises.find((exercise) => exercise.id === id))
            .filter(Boolean);
          const videoCount = workoutExercises.filter((exercise) => exercise?.videoUrl).length;
          const equipment = Array.from(new Set(workoutExercises.flatMap((exercise) => exercise?.equipment || []))).slice(0, 4);

          return (
            <Card key={workout.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>
                      {formatDayLabel(workout.dayOfWeek)} · {workoutExercises.length} gerakan · {videoCount} panduan
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{workoutExercises.length} gerakan</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {workoutExercises.slice(0, 6).map((exercise, index) => (
                    <div key={exercise!.id} className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {index + 1}. {exercise!.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exercise!.targetSets} x {exercise!.targetReps} · {formatCategoryLabel(exercise!.category)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={exercise!.isOptional ? "text-muted-foreground" : undefined}
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    startWorkout(workout.id);
                    navigate("/workout");
                  }}
                >
                  Mulai
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
