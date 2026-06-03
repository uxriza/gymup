import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCategoryLabel, formatDayLabel } from "@/lib/labels";
import { useGymStore } from "@/store/gym-store";

const categories = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Custom"];

export function SetupPage() {
  const { workouts, exercises, addExercise, addWorkout, deleteWorkout } = useGymStore();
  const [exerciseName, setExerciseName] = useState("");
  const [category, setCategory] = useState("Chest");
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [isOptional, setIsOptional] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const groupedExercises = useMemo(
    () =>
      categories.map((group) => ({
        category: group,
        exercises: exercises.filter((exercise) => exercise.category === group),
      })),
    [exercises],
  );

  const submitExercise = (event: FormEvent) => {
    event.preventDefault();
    if (!exerciseName.trim()) return;
    addExercise({
      name: exerciseName.trim(),
      category,
      targetSets,
      targetReps,
      isOptional,
    });
    setExerciseName("");
    setTargetSets(3);
    setTargetReps(10);
    setIsOptional(false);
    setShowExerciseModal(false);
  };

  const submitWorkout = (event: FormEvent) => {
    event.preventDefault();
    if (!workoutName.trim() || selectedExerciseIds.length === 0) return;
    addWorkout(workoutName.trim(), dayOfWeek.trim(), selectedExerciseIds);
    setWorkoutName("");
    setDayOfWeek("");
    setSelectedExerciseIds([]);
    setShowWorkoutModal(false);
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((current) =>
      current.includes(exerciseId) ? current.filter((id) => id !== exerciseId) : [...current, exerciseId],
    );
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Atur gerakan, program, dan pilihan latihan personal.</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button className="h-12" variant="secondary" onClick={() => setShowExerciseModal(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
        <Button className="h-12" onClick={() => setShowWorkoutModal(true)}>
          <Plus className="h-4 w-4" />
          Buat Split
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Program saat ini</h2>
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>{formatDayLabel(workout.dayOfWeek)}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteWorkout(workout.id)} aria-label={`Hapus ${workout.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workout.exerciseIds.map((exerciseId) => {
                  const exercise = exercises.find((item) => item.id === exerciseId);
                  return exercise ? (
                    <Badge
                      key={exerciseId}
                      variant={exercise.isOptional ? "secondary" : "outline"}
                      className={exercise.isOptional ? "text-muted-foreground" : undefined}
                    >
                      {exercise.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent className="w-[calc(100vw-32px)] rounded-lg">
          <DialogHeader>
            <DialogTitle>Tambah gerakan</DialogTitle>
            <DialogDescription>Buat gerakan custom untuk tracker kamu.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submitExercise}>
            <Input placeholder="Nama gerakan" value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategoryLabel(item)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="h-11 rounded-md border border-border px-3 text-left text-sm"
                onClick={() => setIsOptional((value) => !value)}
              >
                {isOptional ? "Opsional" : "Rekomendasi"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={1}
                value={targetSets}
                onChange={(event) => setTargetSets(Number(event.target.value))}
                aria-label="Target set"
              />
              <Input
                type="number"
                min={1}
                value={targetReps}
                onChange={(event) => setTargetReps(Number(event.target.value))}
                aria-label="Target repetisi"
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-32px)] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Buat split</DialogTitle>
            <DialogDescription>Pilih gerakan sesuai urutan latihan yang kamu inginkan.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitWorkout}>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Hari Push" value={workoutName} onChange={(event) => setWorkoutName(event.target.value)} />
              <Input placeholder="Senin" value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)} />
            </div>

            <div className="space-y-4">
              {groupedExercises.map((group) =>
                group.exercises.length ? (
                  <div key={group.category} className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">{formatCategoryLabel(group.category)}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.exercises.map((exercise) => {
                        const selected = selectedExerciseIds.includes(exercise.id);
                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            className={`rounded-full border px-3 py-2 text-sm ${
                              selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary"
                            }`}
                            onClick={() => toggleExercise(exercise.id)}
                          >
                            {exercise.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null,
              )}
            </div>

            <Button type="submit" className="w-full">
              Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
