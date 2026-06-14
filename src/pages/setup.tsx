import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseThumbnail } from "@/components/exercise-thumbnail";
import { Input } from "@/components/ui/input";
import { defaultExercises } from "@/data";
import { useI18n } from "@/lib/i18n";
import { formatCategoryLabel } from "@/lib/labels";
import { useGymStore } from "@/store/gym-store";
import type { Exercise } from "@/types";

const categoryOrder = ["Semua", "Warmup", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Calves", "Cooldown", "Custom"];

function ExerciseMedia({ exercise, emptyLabel }: { exercise: Exercise; emptyLabel: string }) {
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
          {emptyLabel}
        </div>
      )}
    </div>
  );
}

export function SetupPage() {
  const { language } = useI18n();
  const { exercises } = useGymStore();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const copy = language === "en"
    ? {
        title: "Exercise library",
        description: "Browse movement references and basic instructions",
        searchPlaceholder: "Search exercise name or equipment",
        all: "All",
        listTitle: "Exercise list",
        total: (count: number) => `${count} total`,
        summary: (exercise: Exercise) => `${exercise.targetSets} sets x ${exercise.targetReps} reps · ${formatCategoryLabel(exercise.category, language)}`,
        notFoundTitle: "No exercise found",
        notFoundDescription: "Try another keyword or category",
        instructions: "Instructions",
        noInstructions: "Instructions are not available for this exercise yet",
        noMedia: "Exercise media is not available yet",
      }
    : {
        title: "Katalog gerakan",
        description: "Cari referensi gerakan dan instruksi dasar",
        searchPlaceholder: "Cari nama gerakan atau alat",
        all: "Semua",
        listTitle: "Daftar gerakan",
        total: (count: number) => `${count} total`,
        summary: (exercise: Exercise) => `${exercise.targetSets} set x ${exercise.targetReps} repetisi · ${formatCategoryLabel(exercise.category, language)}`,
        notFoundTitle: "Gerakan tidak ditemukan",
        notFoundDescription: "Coba kata kunci atau kategori lain",
        instructions: "Instruksi",
        noInstructions: "Instruksi belum tersedia untuk gerakan ini",
        noMedia: "Media gerakan belum tersedia",
      };

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
        formatCategoryLabel(exercise.category, language).toLowerCase().includes(normalizedQuery) ||
        exercise.equipment?.some((item) => item.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [catalogExercises, language, query, selectedCategory]);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="space-y-1">
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-description">{copy.description}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-12 border-white/10 bg-card/80 pl-9" placeholder={copy.searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
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
                {category === "Semua" ? copy.all : formatCategoryLabel(category, language)}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">{copy.listTitle}</h2>
          <p className="section-description">{copy.total(catalogExercises.length)}</p>
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
                    <p className="text-sm text-muted-foreground">{copy.summary(exercise)}</p>
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
              <CardTitle>{copy.notFoundTitle}</CardTitle>
              <CardDescription>{copy.notFoundDescription}</CardDescription>
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
                <DialogDescription>{copy.summary(selectedExercise)}</DialogDescription>
              </DialogHeader>

              <ExerciseMedia exercise={selectedExercise} emptyLabel={copy.noMedia} />

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
                <p className="font-semibold">{copy.instructions}</p>
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
                  <p className="text-sm text-muted-foreground">{copy.noInstructions}</p>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
