import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Minus,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  ThumbsUp,
  Timer,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseThumbnail } from "@/components/exercise-thumbnail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { defaultExercises } from "@/data";
import { formatCategoryLabel } from "@/lib/labels";
import { cn, formatDuration } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";
import type { ActiveExercise, Exercise } from "@/types";

const categoryOrder = ["Semua", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Calves"];

const statusLabel: Record<ActiveExercise["status"], string> = {
  planned: "Belum",
  selected: "Dipilih",
  active: "Berjalan",
  resting: "Istirahat",
  completed: "Selesai",
  skipped: "Belum",
};

const statusClass: Record<ActiveExercise["status"], string> = {
  planned: "bg-secondary text-muted-foreground",
  selected: "bg-primary/10 text-primary",
  active: "bg-primary text-primary-foreground",
  resting: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  skipped: "bg-muted text-muted-foreground",
};

const baseWeightOptions = [
  0,
  ...Array.from({ length: 20 }, (_, index) => (index + 1) * 2.5),
  ...Array.from({ length: 10 }, (_, index) => 55 + index * 5),
  ...Array.from({ length: 10 }, (_, index) => 110 + index * 10),
];

const getWeightOptions = (currentWeight?: number) => {
  const options = currentWeight !== undefined ? [...baseWeightOptions, currentWeight] : baseWeightOptions;
  return Array.from(new Set(options)).sort((a, b) => a - b);
};

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

const localizedInstructions: Record<string, string[]> = {
  "bench-press": [
    "Berbaring di bangku dengan posisi palang tepat di atas garis mata.",
    "Tekuk lutut secukupnya dan pastikan telapak kaki menapak stabil di lantai.",
    "Tarik napas, pegang palang sedikit lebih lebar dari bahu, lalu turunkan palang perlahan ke dada.",
    "Dorong palang kembali ke atas dengan kontrol. Minta bantuan penjaga saat memakai beban berat.",
  ],
  "incline-bench-press-dumbel": [
    "Atur bangku pada sudut sekitar 30 sampai 45 derajat.",
    "Pegang dumbel sejajar dada atas dengan bahu tetap stabil.",
    "Dorong dumbel lurus ke atas, lalu turunkan perlahan dengan kontrol.",
  ],
  "shoulder-press-dumbels": [
    "Duduk dengan sandaran hampir tegak dan punggung menempel stabil.",
    "Angkat dumbel ke tinggi bahu dengan siku mengarah ke depan.",
    "Dorong dumbel ke atas sampai hampir bertemu, lalu turunkan perlahan.",
    "Jaga otot inti tetap aktif dan ulangi dengan tempo terkontrol.",
  ],
  "lateral-raises": [
    "Berdiri stabil dengan dumbel di sisi tubuh.",
    "Angkat lengan ke samping sampai sekitar tinggi bahu.",
    "Jaga siku sedikit menekuk dan bahu tidak terangkat berlebihan.",
    "Turunkan dumbel perlahan tanpa mengayun badan.",
  ],
  "dips": [
    "Pegang pegangan dip dengan tubuh stabil dan bahu terkunci.",
    "Turunkan tubuh perlahan sampai siku menekuk nyaman.",
    "Dorong tubuh kembali ke atas dengan dada dan trisep tetap aktif.",
    "Gunakan rentang gerak yang aman untuk bahu.",
  ],
  "benchpress-dumbels": [
    "Berbaring di bangku sambil memegang dua dumbel di sisi dada.",
    "Dorong dumbel ke atas sampai lengan hampir lurus.",
    "Turunkan dumbel perlahan ke posisi awal dengan kontrol.",
    "Jaga pergelangan tangan netral dan bahu tetap stabil.",
  ],
  "pull-ups": [
    "Pegang palang pull-up dengan pegangan lebar dan tubuh menggantung stabil.",
    "Tarik dada ke arah palang sambil menjaga bahu turun dan punggung aktif.",
    "Turunkan tubuh perlahan sampai lengan kembali panjang.",
  ],
  "rowing-seated-narrow-pegangan": [
    "Duduk tegak dan pegang pegangan sempit.",
    "Tarik pegangan ke arah dada sambil merapatkan tulang belikat.",
    "Jangan bersandar berlebihan dan jaga gerakan tetap terkontrol.",
  ],
  "facepull": [
    "Atur katrol setinggi dada dan gunakan tali.",
    "Mundur sampai lengan lurus dan tubuh stabil.",
    "Tarik tali ke arah wajah sambil merapatkan tulang belikat.",
    "Kontrol gerakan balik tanpa melepas ketegangan bahu belakang.",
  ],
  "biceps-curls-with-barbell": [
    "Pegang barbel selebar bahu dengan punggung tegak.",
    "Tekuk siku untuk mengangkat palang tanpa mengayun badan.",
    "Turunkan palang perlahan sampai lengan hampir lurus.",
    "Jaga siku tetap dekat tubuh selama gerakan.",
  ],
  "hammer-curls": [
    "Pegang dumbel di sisi tubuh dengan telapak tangan saling menghadap.",
    "Angkat dumbel ke arah bahu tanpa mendorong siku ke depan.",
    "Kencangkan biceps di posisi atas, lalu turunkan perlahan.",
  ],
  "front-squats": [
    "Letakkan palang di depan bahu dengan siku mengarah ke depan.",
    "Turunkan pinggul seperti squat sambil menjaga dada tetap tegak.",
    "Dorong lantai untuk kembali berdiri dengan kontrol.",
  ],
  "romanian-deadlift": [
    "Mulai dari posisi berdiri dengan palang atau dumbel di depan paha.",
    "Dorong pinggul ke belakang sambil punggung tetap netral.",
    "Turunkan beban sampai hamstring terasa tertarik, lalu kembali berdiri.",
  ],
  "leg-press": [
    "Letakkan kaki di pijakan dengan posisi nyaman dan stabil.",
    "Turunkan beban sampai lutut menekuk aman.",
    "Dorong pijakan kembali tanpa mengunci lutut berlebihan.",
  ],
  "dumbel-lunges-walking": [
    "Pegang dumbel di sisi tubuh dan berdiri tegak.",
    "Ambil langkah panjang sampai lutut depan membentuk sudut nyaman.",
    "Dorong tubuh ke depan untuk berdiri dan lanjutkan dengan kaki lainnya.",
  ],
  "standing-calf-raises": [
    "Berdiri di mesin latihan betis dengan posisi tubuh tegak.",
    "Dorong tumit setinggi mungkin sampai betis berkontraksi.",
    "Tahan sebentar, lalu turunkan tumit perlahan.",
  ],
  "hip-thrust": [
    "Posisikan punggung atas di bangku dan palang di atas panggul dengan bantalan.",
    "Letakkan kaki tepat di bawah lutut.",
    "Dorong pinggul ke atas sampai tubuh membentuk garis dari lutut ke bahu.",
    "Turunkan pinggul perlahan dan ulangi dengan kontrol.",
  ],
};

const getExerciseInstructions = (exercise: Exercise) => localizedInstructions[exercise.id] ?? exercise.instructions ?? [];

const getSeedExercise = (exercise: Exercise) => defaultExercises.find((item) => item.id === exercise.id) ?? exercise;

function ExerciseInfo({ exercise }: { exercise: Exercise }) {
  const instructions = getExerciseInstructions(exercise);

  return (
    <div className="space-y-4">
      {exercise.equipment?.length ? (
        <div className="flex flex-wrap gap-2">
          {exercise.equipment.slice(0, 4).map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 text-muted-foreground">
              <Dumbbell className="h-3 w-3" />
              {item}
            </Badge>
          ))}
        </div>
      ) : null}

      {instructions.length ? (
        <div className="space-y-2 rounded-md border border-border p-3">
          <p className="text-sm font-semibold">Instruksi gerakan</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {instructions.map((instruction, index) => (
              <li key={`${exercise.id}-${index}`} className="flex gap-2">
                <span className="text-primary">{index + 1}</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

export function WorkoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    activeWorkout,
    workouts,
    exercises,
    completeWarmup,
    startCooldown,
    returnToMainSession,
    selectExercise,
    selectCustomExercise,
    returnToExercisePicker,
    startSelectedExercise,
    incrementCurrentReps,
    updateCurrentWeight,
    startRest,
    stopRestTimer,
    startNextSet,
    completeCurrentExercise,
    finishWorkout,
    cancelWorkout,
  } = useGymStore();
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showFinish, setShowFinish] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [exerciseReward, setExerciseReward] = useState<{
    name: string;
    sets: number;
    reps: number;
  } | null>(null);

  const workout = workouts.find((item) => item.id === activeWorkout?.workoutId);
  const sessionName = workout?.name ?? activeWorkout?.customName ?? "Latihan mandiri";
  const active = activeWorkout?.exercises[activeWorkout.currentIndex];
  const catalogExercises = exercises.map(getSeedExercise);
  const mainCatalogExercises = catalogExercises.filter((item) => !["Warmup", "Cooldown"].includes(item.category));
  const findExerciseById = (id?: string) => catalogExercises.find((item) => item.id === id);
  const exercise = findExerciseById(active?.exerciseId);
  const warmupExercises = (activeWorkout?.warmupIds ?? []).map(findExerciseById).filter(Boolean) as Exercise[];
  const cooldownExercises = (activeWorkout?.cooldownIds ?? []).map(findExerciseById).filter(Boolean) as Exercise[];

  const sessionElapsedSeconds = activeWorkout?.startTime
    ? Math.max(Math.floor((nowTick - new Date(activeWorkout.startTime).getTime()) / 1000), 0)
    : 0;
  const activeElapsedSeconds = activeWorkout?.mode === "exercise_active" && active?.startedAt
    ? Math.max(Math.floor((nowTick - new Date(active.startedAt).getTime()) / 1000), 0)
    : 0;
  const restDurationSeconds = activeWorkout?.restDurationSeconds ?? 90;
  const restElapsedSeconds = activeWorkout?.restStartedAt
    ? Math.max(Math.floor((nowTick - new Date(activeWorkout.restStartedAt).getTime()) / 1000), 0)
    : 0;
  const restSeconds = activeWorkout?.mode === "resting"
    ? Math.max(restDurationSeconds - restElapsedSeconds, 0)
    : 0;

  useEffect(() => {
    const updateNow = () => setNowTick(Date.now());
    updateNow();
    const interval = window.setInterval(updateNow, 1000);
    window.addEventListener("focus", updateNow);
    document.addEventListener("visibilitychange", updateNow);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", updateNow);
      document.removeEventListener("visibilitychange", updateNow);
    };
  }, []);

  useEffect(() => {
    if (!activeWorkout || !navigator.wakeLock) return;

    let wakeLock: WakeLockSentinel | undefined;
    let isCancelled = false;

    const requestWakeLock = async () => {
      if (document.visibilityState !== "visible" || wakeLock || isCancelled) return;

      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = undefined;
        });
      } catch {
        wakeLock = undefined;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock && !wakeLock.released) {
        void wakeLock.release();
      }
    };
  }, [activeWorkout]);

  useEffect(() => {
    if (!exerciseReward) return;

    const timeout = window.setTimeout(() => setExerciseReward(null), 1700);
    return () => window.clearTimeout(timeout);
  }, [exerciseReward]);

  const progress = useMemo(() => {
    if (!activeWorkout) return 0;
    if (activeWorkout.phase === "warmup") return 0;
    if (activeWorkout.phase === "cooldown") return 100;
    const done = activeWorkout.exercises.filter((item) => item.completed || item.skipped).length;
    if (!activeWorkout.exercises.length) return 0;
    return Math.round((done / activeWorkout.exercises.length) * 100);
  }, [activeWorkout]);

  if (!activeWorkout) {
    return (
      <div className="space-y-4">
        <h1 className="text-[1.875rem] font-bold leading-8">Tidak ada sesi aktif</h1>
        <Button onClick={() => navigate("/select")}>Pilih latihan</Button>
      </div>
    );
  }

  const completedCount = activeWorkout.exercises.filter((item) => item.completed).length;
  const plannedCount = activeWorkout.exercises.length - completedCount;
  const totalExerciseCount = activeWorkout.exercises.length;
  const phaseLabel = activeWorkout.phase === "warmup"
    ? "Pemanasan"
    : activeWorkout.phase === "cooldown"
      ? "Pendinginan"
      : "Latihan";
  const pageTitle = activeWorkout.phase === "main" ? "Sesi latihan" : phaseLabel;
  const progressLabel = activeWorkout.phase === "main"
    ? `${progress}% progres sesi`
    : activeWorkout.phase === "warmup"
      ? "Tahap awal"
      : "Tahap akhir";
  const isRestComplete = activeWorkout.mode === "resting" && restSeconds === 0;
  const isExerciseCompleted = active?.status === "completed";
  const canStartExercise = !isExerciseCompleted;
  const showPreviewActions = activeWorkout.phase === "main" && activeWorkout.mode === "exercise_preview";
  const categories = categoryOrder.filter((category) => category === "Semua" || mainCatalogExercises.some((item) => item.category === category));
  const filteredCatalogExercises = mainCatalogExercises.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      formatCategoryLabel(item.category).toLowerCase().includes(normalizedQuery) ||
      item.equipment?.some((equipment) => equipment.toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });

  const startRestTimer = () => {
    startRest(90);
  };

  const addRep = () => {
    incrementCurrentReps(1);
  };

  const removeRep = () => {
    incrementCurrentReps(-1);
  };

  const completeExerciseWithReward = () => {
    if (!active || !exercise || !activeWorkout) {
      completeCurrentExercise();
      return;
    }

    const willCommitCurrentSet = activeWorkout.mode === "exercise_active";
    const savedReps = willCommitCurrentSet
      ? active.currentReps > 0
        ? active.currentReps
        : exercise.targetReps
      : 0;

    setExerciseReward({
      name: exercise.name,
      sets: active.actualSets + (willCommitCurrentSet ? 1 : 0),
      reps: active.actualReps + savedReps,
    });
    completeCurrentExercise();
  };

  const finishAndNavigate = () => {
    finishWorkout(summaryNotes);
    navigate("/history");
    toast({
      title: "Sesi tersimpan",
      description: "Riwayat latihan sudah diperbarui",
    });
  };

  const requestFinish = () => {
    if (activeWorkout.phase === "main" && cooldownExercises.length) {
      startCooldown();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setShowFinish(true);
  };

  const renderPrepStep = (
    phase: "warmup" | "cooldown",
    items: Exercise[],
  ) => {
    const isWarmup = phase === "warmup";
    const title = isWarmup ? "Pemanasan dulu" : "Pendinginan";
    const description = isWarmup
      ? "Ikuti instruksi ringan ini sebelum memilih gerakan utama"
      : "Turunkan intensitas sebentar sebelum menyimpan sesi";
    const buttonLabel = isWarmup ? "Mulai sesi latihan" : "Selesai pendinginan";
    const onAction = isWarmup ? completeWarmup : () => setShowFinish(true);

    return (
      <Card className="animate-workout-card border-primary/20 bg-card/90">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-24">
          {items.map((item) => (
            <div key={item.id} className="surface-list-item space-y-3 p-4">
              <div className="flex items-start gap-3">
                <ExerciseThumbnail exercise={item} className="h-14 w-14 rounded-[0.375rem]" />
                <div className="min-w-0">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.targetReps >= 45 ? `${item.targetReps} detik` : `${item.targetSets} set x ${item.targetReps} repetisi`}
                  </p>
                </div>
              </div>
              <ExerciseInfo exercise={item} />
            </div>
          ))}
        </CardContent>

        {createPortal(
          <div className="premium-dock fixed inset-x-0 bottom-0 z-50 border-t border-border/70 px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto w-full max-w-[480px]">
              <Button className="min-h-12 w-full" size="lg" onClick={onAction}>
                {isWarmup ? <Play className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {buttonLabel}
              </Button>
            </div>
          </div>,
          document.body,
        )}
      </Card>
    );
  };

  const renderCustomPicker = () => (
    <div className="space-y-4 pb-24">
      <div className="grid grid-cols-2 gap-3">
        <div className="metric-surface p-3">
          <p className="text-xs text-muted-foreground">Selesai</p>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="metric-surface p-3">
          <p className="text-xs text-muted-foreground">Gerakan sesi</p>
          <p className="text-2xl font-bold">{totalExerciseCount}</p>
        </div>
      </div>

      <section className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-12 pl-9" placeholder="Cari gerakan atau alat" value={query} onChange={(event) => setQuery(event.target.value)} />
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

      <div className="space-y-3">
        {filteredCatalogExercises.map((item) => {
          const activeExercise = activeWorkout.exercises.find((entry) => entry.exerciseId === item.id);
          const isCompleted = activeExercise?.status === "completed";

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "surface-list-item w-full p-4 text-left hover:border-primary/35",
                isCompleted && "border-emerald-500/70 bg-emerald-500/10 hover:border-emerald-400/80",
              )}
              onClick={() => selectCustomExercise(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ExerciseThumbnail exercise={item} className="h-16 w-16" />
                  <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-background">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                    <p className={cn("truncate font-semibold", isCompleted && "text-emerald-100")}>{item.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.targetSets} set x {item.targetReps} repetisi · {formatCategoryLabel(item.category)}
                  </p>
                  {activeExercise && (activeExercise.actualSets > 0 || activeExercise.actualReps > 0) ? (
                    <p className={cn("text-xs text-muted-foreground", isCompleted && "font-medium text-emerald-200/90")}>
                      Tercatat {activeExercise.actualSets} set · {activeExercise.actualReps} repetisi
                    </p>
                  ) : null}
                  </div>
                </div>
                {activeExercise ? (
                  <Badge className={cn("shrink-0", statusClass[activeExercise.status])}>
                    {statusLabel[activeExercise.status]}
                  </Badge>
                ) : (
                  <Badge className="shrink-0 bg-secondary text-muted-foreground">Pilih</Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPicker = () => (
    <div className="space-y-4 pb-24">
      <div className="grid grid-cols-3 gap-3">
        <div className="metric-surface p-3">
          <p className="text-xs text-muted-foreground">Selesai</p>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="metric-surface p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{totalExerciseCount}</p>
        </div>
        <div className="metric-surface p-3">
          <p className="text-xs text-muted-foreground">Belum</p>
          <p className="text-2xl font-bold">{plannedCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {activeWorkout.exercises.map((activeExercise, index) => {
          const item = findExerciseById(activeExercise.exerciseId);
          if (!item) return null;

          return (
            <button
              key={activeExercise.exerciseId}
              type="button"
              className={cn(
                "surface-list-item w-full p-4 text-left hover:border-primary/35",
                activeExercise.status === "completed" &&
                  "border-emerald-500/70 bg-emerald-500/10 hover:border-emerald-400/80",
                activeExercise.status === "active" && "border-primary/60",
                activeExercise.status === "resting" && "border-orange-500/50",
              )}
              onClick={() => selectExercise(index)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <ExerciseThumbnail exercise={item} className="h-16 w-16" />
                  <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {activeExercise.status === "completed" ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-background">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                    <p className={cn("truncate font-semibold", activeExercise.status === "completed" && "text-emerald-100")}>
                      {item.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {item.targetSets} set x {item.targetReps} repetisi · {formatCategoryLabel(item.category)}
                    </span>
                    {!item.isOptional ? (
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary"
                        aria-label="Rekomendasi"
                        title="Rekomendasi"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
                  {activeExercise.actualSets > 0 || activeExercise.actualReps > 0 ? (
                    <p
                      className={cn(
                        "text-xs text-muted-foreground",
                        activeExercise.status === "completed" && "font-medium text-emerald-200/90",
                      )}
                    >
                      Tercatat {activeExercise.actualSets} set · {activeExercise.actualReps} repetisi
                    </p>
                  ) : null}
                  </div>
                </div>
                <Badge className={cn("shrink-0", statusClass[activeExercise.status])}>
                  {statusLabel[activeExercise.status]}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPreview = () => exercise && active ? (
    <Card className="animate-workout-card pb-24">
      <CardHeader>
        <Button className="w-fit px-0 text-muted-foreground" variant="ghost" onClick={returnToExercisePicker}>
          <ArrowLeft className="h-4 w-4" />
          Pilih gerakan
        </Button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{exercise.name}</CardTitle>
            <CardDescription>
              {exercise ? `${exercise.targetSets} set x ${exercise.targetReps} repetisi · ${formatCategoryLabel(exercise.category)}` : null}
            </CardDescription>
          </div>
          <Badge className={cn(statusClass[active.status])}>{statusLabel[active.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ExerciseMedia exercise={exercise} />
        <ExerciseInfo exercise={exercise} />
      </CardContent>
    </Card>
  ) : null;

  const renderActive = () => exercise && active ? (
    <Card className="animate-workout-card border-primary/35 bg-card/90 pb-24 shadow-[0_24px_80px_rgb(0_0_0/0.36)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{exercise.name}</CardTitle>
            <CardDescription>
              Set {active.currentSet} · target {exercise.targetSets} set x {exercise.targetReps} repetisi
              {active.currentSet > exercise.targetSets ? " · set tambahan" : ""}
            </CardDescription>
          </div>
          <Badge className={cn(statusClass.active)}>Berjalan</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-surface p-4">
            <p className="text-xs text-muted-foreground">Durasi gerakan</p>
            <p className="text-3xl font-bold">{formatDuration(activeElapsedSeconds)}</p>
          </div>
          <div className="metric-surface p-4">
            <p className="text-xs text-muted-foreground">Set berjalan</p>
            <p className="text-3xl font-bold">{active.currentSet}</p>
          </div>
        </div>

        <div className="rounded-md border border-primary/15 bg-card/80 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Beban latihan</p>
              <p className="text-xs text-muted-foreground">Mengikuti beban terakhir yang kamu pakai</p>
            </div>
            <Select
              value={active.weightKg !== undefined ? String(active.weightKg) : "none"}
              onValueChange={(value) => updateCurrentWeight(value === "none" ? undefined : Number(value))}
            >
              <SelectTrigger className="h-12 w-full justify-between rounded-md border-primary/30 bg-background px-4 text-base" aria-label="Beban latihan dalam kilogram">
                <SelectValue placeholder="Pilih beban" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">Belum ada</SelectItem>
                {getWeightOptions(active.weightKg).map((weight) => (
                  <SelectItem key={weight} value={String(weight)}>
                    {weight} kg
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-primary/15 bg-card/80 p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
          <p className="text-center text-xs text-muted-foreground">Repetisi set ini</p>
          <div className="mt-2 grid grid-cols-[48px_1fr_48px] items-center gap-3">
            <Button variant="outline" size="icon" className="h-12 w-12 bg-background" onClick={removeRep} aria-label="Kurangi repetisi">
              <Minus className="h-5 w-5" />
            </Button>
            <p className="text-center text-3xl font-bold">{active.currentReps}</p>
            <Button variant="outline" size="icon" className="h-12 w-12 bg-background" onClick={addRep} aria-label="Tambah repetisi">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : null;

  const renderResting = () => exercise && active ? (
    <Card className="animate-workout-card border-primary/30 bg-card/90 shadow-[0_24px_80px_rgb(0_0_0/0.36)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{exercise.name}</CardTitle>
            <CardDescription>
              Istirahat sebelum set {active.currentSet + 1} · {active.actualSets} set tercatat
            </CardDescription>
          </div>
          <Badge className={cn(statusClass.resting)}>Istirahat</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="animate-rest-pulse rounded-md border border-primary/20 bg-[linear-gradient(115deg,rgb(22_24_28/0.96)_0%,rgb(30_33_39/0.92)_64%,rgb(255_122_26/0.06)_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{isRestComplete ? "Istirahat selesai" : "Waktu istirahat"}</p>
              <p className="text-5xl font-bold">{formatDuration(restSeconds)}</p>
            </div>
            {!isRestComplete ? (
              <Button variant="ghost" size="icon" onClick={stopRestTimer} aria-label="Hentikan timer">
                <Pause className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
          <Progress value={restDurationSeconds ? ((restDurationSeconds - restSeconds) / restDurationSeconds) * 100 : 100} className="mt-4 bg-orange-500/20" />
        </div>

        <div className="rounded-md border border-primary/15 bg-card/80 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Tips istirahat</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Tarik napas pelan, rilekskan bahu, dan siapkan posisi awal sebelum mulai set berikutnya.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12" size="lg" onClick={startNextSet}>
            <Play className="h-4 w-4" />
            Set berikutnya
          </Button>
          <Button className="h-12" size="lg" variant="outline" onClick={completeExerciseWithReward}>
            <Check className="h-4 w-4" />
            Akhiri
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{sessionName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-[1.875rem] font-bold leading-8">{pageTitle}</h1>
              {activeWorkout.phase === "main" ? <Badge className="bg-primary/15 text-primary">{phaseLabel}</Badge> : null}
            </div>
          </div>
          <Button variant="ghost" className="h-10 px-3 text-muted-foreground hover:text-destructive" onClick={() => setShowDiscard(true)} aria-label="Buang sesi">
            <X className="h-4 w-4" />
            Buang
          </Button>
        </div>
        <Progress value={progress} />
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{progressLabel}</span>
          <span className="font-semibold">{formatDuration(sessionElapsedSeconds)}</span>
        </div>
      </section>

      {activeWorkout.phase === "warmup" ? renderPrepStep("warmup", warmupExercises) : null}
      {activeWorkout.phase === "main" && activeWorkout.mode === "exercise_picker" ? (activeWorkout.isCustom ? renderCustomPicker() : renderPicker()) : null}
      {activeWorkout.phase === "main" && activeWorkout.mode === "exercise_preview" ? renderPreview() : null}
      {activeWorkout.phase === "main" && activeWorkout.mode === "exercise_active" ? renderActive() : null}
      {activeWorkout.phase === "main" && activeWorkout.mode === "resting" ? renderResting() : null}
      {activeWorkout.phase === "cooldown" ? renderPrepStep("cooldown", cooldownExercises) : null}

      {activeWorkout.phase === "main" && activeWorkout.mode === "exercise_picker" ? createPortal(
        <div className="premium-dock fixed inset-x-0 bottom-0 z-50 border-t border-border/70 px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-[480px]">
            <Button
              className="min-h-12 w-full"
              size="lg"
              onClick={requestFinish}
            >
              Selesai sesi
            </Button>
          </div>
        </div>,
        document.body,
      ) : null}

      {activeWorkout.phase === "main" && activeWorkout.mode === "exercise_active" ? createPortal(
        <div className="premium-dock fixed inset-x-0 bottom-0 z-50 border-t border-border/70 px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto grid w-full max-w-[480px] grid-cols-2 gap-3">
            <Button className="col-span-2 min-h-12 w-full text-base" size="lg" onClick={startRestTimer}>
              <Timer className="h-5 w-5" />
              Istirahat
            </Button>
            <Button className="min-h-12 w-full" size="lg" variant="secondary" onClick={() => setShowInstructions(true)}>
              <Dumbbell className="h-4 w-4" />
              Instruksi
            </Button>
            <Button className="min-h-12 w-full" size="lg" variant="outline" onClick={completeExerciseWithReward}>
              <Check className="h-4 w-4" />
              Akhiri
            </Button>
          </div>
        </div>,
        document.body,
      ) : null}

      {showPreviewActions ? createPortal(
        <div className="premium-dock fixed inset-x-0 bottom-0 z-50 border-t border-border/70 px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto grid w-full max-w-[480px] grid-cols-2 gap-3">
            <Button className="min-h-12 w-full" size="lg" variant="outline" onClick={returnToExercisePicker}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            {isExerciseCompleted ? (
              <Button className="min-h-12 w-full" size="lg" variant="secondary" onClick={returnToExercisePicker}>
                <Check className="h-4 w-4" />
                Selesai
              </Button>
            ) : (
              <Button className="min-h-12 w-full" size="lg" onClick={startSelectedExercise} disabled={!canStartExercise}>
                <Play className="h-4 w-4" />
                Mulai
              </Button>
            )}
          </div>
        </div>,
        document.body,
      ) : null}

      {exerciseReward ? createPortal(
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-6" role="status" aria-live="polite">
          <div className="animate-page-transition w-full max-w-[20rem] rounded-xl border border-primary/40 bg-[radial-gradient(circle_at_82%_18%,rgb(255_122_26/0.24),transparent_34%),linear-gradient(145deg,rgb(16_18_22/0.98)_0%,rgb(24_27_33/0.96)_100%)] p-5 text-center shadow-[0_28px_90px_rgb(0_0_0/0.55),0_0_42px_rgb(255_122_26/0.16)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgb(255_122_26/0.34)]">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold uppercase leading-7">Gerakan selesai</p>
            <p className="mt-2 text-base font-semibold">{exerciseReward.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {exerciseReward.sets} set · {exerciseReward.reps} repetisi tercatat
            </p>
          </div>
        </div>,
        document.body,
      ) : null}

      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Selesaikan sesi?</DialogTitle>
            <DialogDescription>
              {activeWorkout.isCustom
                ? `${completedCount} selesai · ${totalExerciseCount} gerakan sesi`
                : `${completedCount} selesai · ${plannedCount} tidak dikerjakan`}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            className="min-h-24"
            placeholder="Catatan sesi"
            value={summaryNotes}
            onChange={(event) => setSummaryNotes(event.target.value)}
          />

          {completedCount === 0 ? (
            <div className="rounded-md border border-primary/25 bg-primary/10 p-3 text-sm leading-6 text-primary">
              Belum ada gerakan yang selesai. Tetap simpan sesi?
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="min-h-12 w-full"
              size="lg"
              variant="outline"
              onClick={() => {
                returnToMainSession();
                setShowFinish(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Lanjutkan latihan
            </Button>
            <Button className="min-h-12 w-full" size="lg" onClick={finishAndNavigate}>
              Simpan sesi
            </Button>
          </div>

          <div className="border-t border-border pt-3">
            <Button
              variant="ghost"
              className="min-h-11 w-full text-muted-foreground hover:text-destructive"
              onClick={() => {
                cancelWorkout();
                navigate("/");
                toast({
                  title: "Sesi dibuang",
                  description: "Sesi aktif tidak disimpan",
                  variant: "destructive",
                });
              }}
            >
              Buang sesi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscard} onOpenChange={setShowDiscard}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Buang sesi?</DialogTitle>
            <DialogDescription>
              Sesi aktif akan dihapus dan tidak disimpan ke riwayat
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button className="min-h-12 w-full" variant="outline" onClick={() => setShowDiscard(false)}>
              Batal
            </Button>
            <Button
              className="min-h-12 w-full"
              variant="destructive"
              onClick={() => {
                setShowDiscard(false);
                cancelWorkout();
                navigate("/");
                toast({
                  title: "Sesi dibuang",
                  description: "Sesi aktif tidak disimpan",
                  variant: "destructive",
                });
              }}
            >
              Buang sesi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-32px)] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>{exercise?.name}</DialogTitle>
            <DialogDescription>
              {exercise ? `${exercise.targetSets} set x ${exercise.targetReps} repetisi · ${formatCategoryLabel(exercise.category)}` : null}
            </DialogDescription>
          </DialogHeader>
          {exercise ? (
            <div className="space-y-5">
              <ExerciseMedia exercise={exercise} />
              <ExerciseInfo exercise={exercise} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
