import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseThumbnail } from "@/components/exercise-thumbnail";
import { Input } from "@/components/ui/input";
import { formatCategoryLabel } from "@/lib/labels";
import { defaultExercises } from "@/data";
import { useGymStore } from "@/store/gym-store";
import type { Exercise } from "@/types";

const categoryOrder = ["Semua", "Warmup", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Calves", "Cooldown", "Custom"];

function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-secondary">
      {exercise.videoUrl ? (
        <video
          className="aspect-video w-full bg-black object-cover"
          src={exercise.videoUrl}
          poster={exercise.imageUrl}
          controls
          autoPlay
          loop
          playsInline
          muted
          preload="metadata"
        />
      ) : exercise.imageUrl ? (
        <img className="aspect-video w-full bg-black object-cover" src={exercise.imageUrl} alt={exercise.name} />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-background text-sm text-muted-foreground">
          Media gerakan belum tersedia
        </div>
      )}
    </div>
  );
}

export function SetupPage() {
  const { exercises } = useGymStore();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const catalogExercises = useMemo(
    () => exercises.map((exercise) => defaultExercises.find((item) => item.id === exercise.id) ?? exercise),
    [exercises],
  );

  const categories = useMemo(
    () => categoryOrder.filter((category) => category === "Semua" || catalogExercises.some((exercise) => exercise.category === category)),
    [catalogExercises],
  );

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalogExercises.filter((exercise) => {
      const matchesCategory = selectedCategory === "Semua" || exercise.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        formatCategoryLabel(exercise.category).toLowerCase().includes(normalizedQuery) ||
        exercise.equipment?.some((item) => item.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [catalogExercises, query, selectedCategory]);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="space-y-1">
          <h1 className="text-[2rem] font-bold leading-9">Katalog gerakan</h1>
          <p className="text-muted-foreground">Cari referensi gerakan dan instruksi dasar</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-12 border-white/10 bg-card/80 pl-9" placeholder="Cari nama gerakan atau alat" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const selected = category === selectedCategory;
            return (
              <Button
                key={category}
                type="button"
                variant={selected ? "default" : "secondary"}
                size="sm"
                className="h-11 shrink-0 px-4"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "Semua" ? "Semua" : formatCategoryLabel(category)}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Daftar gerakan</h2>
          <p className="text-sm text-muted-foreground">{catalogExercises.length} total</p>
        </div>

        {filteredExercises.length ? (
          filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="surface-list-item min-h-24 w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="flex min-w-0 items-start gap-3">
                <ExerciseThumbnail exercise={exercise} className="h-16 w-16" />
                <div className="min-w-0 space-y-2">
                  <div className="space-y-1">
                    <p className="truncate font-semibold">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.targetSets} set x {exercise.targetReps} repetisi · {formatCategoryLabel(exercise.category)}
                    </p>
                  </div>
                  {exercise.equipment?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.slice(0, 3).map((item) => (
                        <Badge key={item} variant="secondary" className="max-w-full truncate text-muted-foreground">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          ))
        ) : (
          <Card className="border-primary/10 bg-card/88">
            <CardHeader>
              <CardTitle>Gerakan tidak ditemukan</CardTitle>
              <CardDescription>Coba kata kunci atau kategori lain</CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <Dialog open={Boolean(selectedExercise)} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DialogContent className="max-h-[88vh] w-[calc(100vw-32px)] overflow-y-auto rounded-lg">
          {selectedExercise ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExercise.name}</DialogTitle>
                <DialogDescription>
                  {selectedExercise.targetSets} set x {selectedExercise.targetReps} repetisi · {formatCategoryLabel(selectedExercise.category)}
                </DialogDescription>
              </DialogHeader>

              <ExerciseMedia exercise={selectedExercise} />

              {selectedExercise.equipment?.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.equipment.map((item) => (
                    <Badge key={item} variant="secondary" className="text-muted-foreground">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="font-semibold">Instruksi</p>
                {selectedExercise.instructions?.length ? (
                  <ol className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={`${selectedExercise.id}-${index}`} className="flex gap-2">
                        <span className="text-primary">{index + 1}</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Instruksi belum tersedia untuk gerakan ini</p>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
