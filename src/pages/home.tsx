import { useEffect, useState } from "react";
import { addMonths, differenceInMinutes, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, subMonths } from "date-fns";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, Dumbbell, Play, Repeat2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { getWeekdayShortLabels } from "@/lib/labels";
import { useGymStore } from "@/store/gym-store";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in window.navigator && Boolean(window.navigator.standalone));

const isExercise = (exercise: Exercise | undefined): exercise is Exercise => Boolean(exercise);

const getActivityCellClass = (count: number) => {
  if (count >= 3) return "border-primary bg-primary";
  if (count === 2) return "border-primary/70 bg-primary/70";
  if (count === 1) return "border-primary/45 bg-primary/35";
  return "border-border bg-secondary/70";
};

export function HomePage() {
  const navigate = useNavigate();
  const { language, dateLocale } = useI18n();
  const { displayName } = useAuth();
  const { sessions, exercises, workouts, activeWorkout } = useGymStore();
  const [now, setNow] = useState(() => new Date());
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const latestSession = sessions[0];
  const latestWorkoutIndex = latestSession
    ? workouts.findIndex((workout) => workout.id === latestSession.workoutId)
    : -1;
  const recommendedWorkout = workouts.length
    ? workouts[latestWorkoutIndex >= 0 ? (latestWorkoutIndex + 1) % workouts.length : 0]
    : undefined;
  const latestCompletedExercises = latestSession?.exercises.filter((item) => item.completed) ?? [];
  const latestDuration = latestSession
    ? Math.max(differenceInMinutes(new Date(latestSession.endTime), new Date(latestSession.startTime)), 1)
    : 0;
  const latestSets = latestSession?.exercises.reduce((total, item) => total + item.actualSets, 0) ?? 0;
  const latestRep = latestSession?.exercises.reduce((total, item) => total + item.actualReps, 0) ?? 0;
  const monthStart = startOfMonth(displayedMonth);
  const monthEnd = endOfMonth(displayedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlySessions = sessions.filter((session) =>
    isWithinInterval(new Date(session.date), { start: monthStart, end: monthEnd }),
  );
  const monthlyActiveDays = monthDays.filter((day) =>
    monthlySessions.some((session) => isSameDay(new Date(session.date), day)),
  ).length;
  const monthStartOffset = (monthStart.getDay() + 6) % 7;
  const monthGridDays = [...Array.from({ length: monthStartOffset }, () => null), ...monthDays];
  const getSessionCountForDay = (day: Date) =>
    monthlySessions.filter((session) => isSameDay(new Date(session.date), day)).length;
  const canGoToNextMonth = !isSameMonth(displayedMonth, now);
  const recommendedExercises = recommendedWorkout
    ? recommendedWorkout.exerciseIds
        .map((exerciseId) => exercises.find((exercise) => exercise.id === exerciseId))
        .filter(isExercise)
    : [];
  const recommendedMainExercises = recommendedExercises.filter((exercise) => !["Warmup", "Cooldown"].includes(exercise.category));
  const planSets = recommendedMainExercises.reduce((total, exercise) => total + exercise.targetSets, 0);
  const planReps = recommendedMainExercises.reduce((total, exercise) => total + exercise.targetSets * exercise.targetReps, 0);
  const estimatedMinutes = Math.max(recommendedMainExercises.length * 6, 18);
  const completedRatio = latestSession?.exercises.length
    ? Math.round((latestCompletedExercises.length / latestSession.exercises.length) * 100)
    : 0;
  const weekdayLabels = getWeekdayShortLabels(language);
  const copy = language === "en"
    ? {
        fallbackTitle: "Welcome to GymUp",
        greetingPrefix: "Hi",
        descriptionLoggedIn: "Get your next session ready and keep today’s training rhythm.",
        descriptionLoggedOut: "Track daily workouts with a mobile-first flow that stays focused and easy to use.",
        heroTitle: activeWorkout ? "Keep your session moving" : "Start today’s session",
        heroBody: activeWorkout
          ? "Your session is still active. Open it again and continue without starting over."
          : recommendedWorkout
            ? "Follow the planned order, keep your tempo, and save the session when you finish."
            : "Choose a program, follow the moves, and save your training progress.",
        heroCta: activeWorkout ? "Continue" : "Start now",
        freeWorkout: "Free workout",
        min: "min",
        exercises: "exercises",
        sets: "sets",
        reps: "reps",
        addToHome: "Add to home screen",
        addToHomeDescription: "Open GymUp like an app from your phone home screen",
        activeSession: "Active session",
        activeSessionDescription: "Return to this session before opening another workout page",
        latestActivity: "Latest activity",
        latestActivityDescription: "Your most recent completed session",
        history: "History",
        duration: "Duration",
        set: "Set",
        rep: "Reps",
        mainExercise: "Main exercises",
        fallbackExercise: "Exercise",
        exerciseSummary: (sets: number, reps: number, weightKg?: number) =>
          `${sets} sets · ${reps} reps${weightKg !== undefined ? ` · ${weightKg} kg` : ""}`,
        moreExercises: (count: number) => `+${count} more exercises`,
        noLatestCompleted: "No completed exercise in the latest program yet",
        noSessionTitle: "No completed session yet",
        noSessionDescription: "Start your first workout and the latest progress will show up here.",
        chooseWorkout: "Choose workout",
        monthlyActivity: "Monthly activity",
        monthlyActivityDescription: (days: number, totalSessions: number) => `${days} active days · ${totalSessions} sessions`,
        previousMonth: "View previous month",
        nextMonth: "View next month",
        sessionLabel: (dayLabel: string, count: number) => `${dayLabel}: ${count} sessions`,
        activity: "Activity",
        installGuideTitle: "Add to home screen",
        installGuideDescription: isIosDevice()
          ? "On iPhone, add the shortcut from Safari’s Share menu"
          : "If the install prompt does not appear yet, use the browser menu to add the app",
        iosStep1: "Tap Share in Safari",
        iosStep2: "Choose “Add to Home Screen”",
        iosStep3: "Tap “Add”, then open GymUp from the new icon",
        androidStep1: "Open the browser menu",
        androidStep2: "Choose “Install app” or “Add to home screen”",
        androidStep3: "After install, open GymUp from the home screen",
      }
    : {
        fallbackTitle: "Welcome to GymUp",
        greetingPrefix: "Halo",
        descriptionLoggedIn: "Siapkan sesi berikutnya dan jaga ritme latihanmu hari ini.",
        descriptionLoggedOut: "Catat latihan harian dengan tampilan yang fokus, padat, dan mudah dipakai di mobile.",
        heroTitle: activeWorkout ? "Lanjutkan ritme latihan" : "Mulai sesi hari ini",
        heroBody: activeWorkout
          ? "Sesi kamu masih aktif. Buka lagi dan teruskan progres tanpa mulai dari awal."
          : recommendedWorkout
            ? "Ikuti urutan gerakan, jaga tempo, lalu simpan progres sesi."
            : "Pilih program, ikuti gerakan, lalu simpan progres latihanmu.",
        heroCta: activeWorkout ? "Lanjutkan" : "Mulai sekarang",
        freeWorkout: "Latihan bebas",
        min: "min",
        exercises: "gerakan",
        sets: "set",
        reps: "rep",
        addToHome: "Tambah ke layar utama",
        addToHomeDescription: "Buka GymUp seperti aplikasi dari layar utama HP",
        activeSession: "Sesi aktif",
        activeSessionDescription: "Lanjutkan sesi sebelum membuka halaman latihan lain",
        latestActivity: "Aktivitas terbaru",
        latestActivityDescription: "Program dan progres sesi terbaru",
        history: "Riwayat",
        duration: "Durasi",
        set: "Set",
        rep: "Rep",
        mainExercise: "Gerakan utama",
        fallbackExercise: "Gerakan",
        exerciseSummary: (sets: number, reps: number, weightKg?: number) =>
          `${sets} set · ${reps} repetisi${weightKg !== undefined ? ` · ${weightKg} kg` : ""}`,
        moreExercises: (count: number) => `+${count} gerakan lainnya`,
        noLatestCompleted: "Belum ada gerakan selesai di program terakhir",
        noSessionTitle: "Belum ada sesi selesai",
        noSessionDescription: "Mulai latihan pertama kamu, nanti progres terakhir akan muncul di sini.",
        chooseWorkout: "Mulai latihan",
        monthlyActivity: "Aktivitas bulanan",
        monthlyActivityDescription: (days: number, totalSessions: number) => `${days} hari aktif · ${totalSessions} sesi`,
        previousMonth: "Lihat bulan sebelumnya",
        nextMonth: "Lihat bulan berikutnya",
        sessionLabel: (dayLabel: string, count: number) => `${dayLabel}: ${count} sesi`,
        activity: "Aktivitas",
        installGuideTitle: "Tambahkan ke layar utama",
        installGuideDescription: isIosDevice()
          ? "Di iPhone, shortcut ditambahkan lewat tombol Bagikan di Safari"
          : "Kalau pilihan pasang belum muncul, gunakan menu browser untuk menambahkan aplikasi",
        iosStep1: "Ketuk Bagikan di Safari",
        iosStep2: "Pilih “Tambahkan ke Layar Utama”",
        iosStep3: "Ketuk “Tambah”, lalu buka GymUp dari ikon di layar utama",
        androidStep1: "Buka menu browser",
        androidStep2: "Pilih “Pasang aplikasi” atau “Tambahkan ke layar utama”",
        androidStep3: "Setelah terpasang, GymUp bisa dibuka dari layar utama",
      };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallShortcut = async () => {
    if (isInstalled) return;

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
      return;
    }

    setInstallGuideOpen(true);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(now, "EEEE, d MMM", { locale: dateLocale })} · {format(now, "HH:mm")}
            </p>
            <h1 className="page-title max-w-[17rem]">
              {displayName ? `${copy.greetingPrefix}, ${displayName}` : copy.fallbackTitle}
            </h1>
            <p className="page-description max-w-[18rem]">
              {displayName ? copy.descriptionLoggedIn : copy.descriptionLoggedOut}
            </p>
          </div>
        </div>

        <div className="feature-surface overflow-hidden p-0">
          <div className="relative min-h-[21rem]">
            <div
              className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgb(9_11_15/0.06)_0%,rgb(9_11_15/0.34)_62%,rgb(24_27_34)_100%),url('/gym-header.png')] bg-cover bg-[center_34%]"
              aria-hidden="true"
            />
            <div className="relative flex min-h-[21rem] flex-col justify-end p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">{recommendedWorkout?.name ?? copy.freeWorkout}</p>
                  <h2 className="font-display text-[2rem] font-bold uppercase leading-none">{copy.heroTitle}</h2>
                  <p className="page-description">{copy.heroBody}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-3 py-1.5">
                    <strong className="font-semibold text-foreground">{estimatedMinutes}</strong> {copy.min}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1.5">
                    <strong className="font-semibold text-foreground">{recommendedMainExercises.length || "--"}</strong> {copy.exercises}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1.5">
                    <strong className="font-semibold text-foreground">{planSets || "--"}</strong> {copy.sets}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1.5">
                    <strong className="font-semibold text-foreground">{planReps || "--"}</strong> {copy.reps}
                  </span>
                </div>

                <Button className="h-12 w-full text-sm font-semibold" size="lg" onClick={() => navigate(activeWorkout ? "/workout" : "/select")}>
                  <Play className="h-4 w-4" />
                  {copy.heroCta}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!isInstalled ? (
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-white/[0.08] bg-card/80 p-3.5 text-left transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={handleInstallShortcut}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Download className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{copy.addToHome}</span>
                <span className="block text-xs text-muted-foreground">{copy.addToHomeDescription}</span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
      </section>

      {activeWorkout ? (
        <Card className="border-primary/40">
          <CardDescription className="sr-only">{copy.activeSessionDescription}</CardDescription>
          <CardContent className="space-y-3 p-5">
            <div>
              <CardTitle>{copy.activeSession}</CardTitle>
              <p className="section-description mt-1">{copy.activeSessionDescription}</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate("/workout")}>
              {copy.heroCta}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="section-title">{copy.latestActivity}</h2>
            <p className="section-description">{copy.latestActivityDescription}</p>
          </div>
          <Button variant="outline" size="sm" className="h-9 shrink-0 px-3" onClick={() => navigate("/history")}>
            {copy.history}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {latestSession ? (
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">{latestSession.workoutName}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(new Date(latestSession.date), "EEEE, d MMM, HH:mm", { locale: dateLocale })}
                    </CardDescription>
                  </div>
                  <Badge className="shrink-0 bg-primary text-primary-foreground">{completedRatio}%</Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-secondary/55">
                <div className="px-3 py-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 text-primary" />
                    {copy.duration}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-none">{latestDuration}m</p>
                </div>
                <div className="px-3 py-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Dumbbell className="h-3 w-3 text-primary" />
                    {copy.set}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-none">{latestSets}</p>
                </div>
                <div className="px-3 py-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Repeat2 className="h-3 w-3 text-primary" />
                    {copy.rep}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-none">{latestRep}</p>
                </div>
              </div>

              {latestCompletedExercises.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{copy.mainExercise}</p>
                  <div className="space-y-2">
                    {latestCompletedExercises.slice(0, 3).map((item) => {
                      const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
                      return (
                        <div key={item.exerciseId} className="surface-list-item flex items-center justify-between gap-3 px-3 py-2.5">
                          <p className="truncate text-sm font-medium">{exercise?.name || copy.fallbackExercise}</p>
                          <p className="shrink-0 text-xs text-muted-foreground">
                            {copy.exerciseSummary(item.actualSets, item.actualReps, item.weightKg)}
                          </p>
                        </div>
                      );
                    })}
                    {latestCompletedExercises.length > 3 ? (
                      <p className="text-xs text-muted-foreground">{copy.moreExercises(latestCompletedExercises.length - 3)}</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="border-t border-border pt-3 text-sm text-muted-foreground">{copy.noLatestCompleted}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/[0.08] bg-card/80">
            <CardContent className="space-y-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{copy.noSessionTitle}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.noSessionDescription}
                </p>
              </div>
              <Button className="min-h-11 w-full" onClick={() => navigate("/select")}>
                {copy.chooseWorkout}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">{copy.monthlyActivity}</h2>
            <p className="section-description">{copy.monthlyActivityDescription(monthlyActiveDays, monthlySessions.length)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="glass-pill h-11 w-11"
              onClick={() => setDisplayedMonth((current) => subMonths(current, 1))}
              aria-label={copy.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-20 text-center text-xs font-medium uppercase text-muted-foreground">
              {format(displayedMonth, "MMM yyyy", { locale: dateLocale })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="glass-pill h-11 w-11"
              onClick={() => setDisplayedMonth((current) => addMonths(current, 1))}
              disabled={!canGoToNextMonth}
              aria-label={copy.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-medium uppercase text-muted-foreground">
              {weekdayLabels.map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthGridDays.map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="h-8 rounded-xl" aria-hidden="true" />;
                }

                const count = getSessionCountForDay(day);
                const label = copy.sessionLabel(format(day, "d MMMM", { locale: dateLocale }), count);

                return (
                  <span
                    key={day.toISOString()}
                    role="img"
                    aria-label={label}
                    title={label}
                    className={cn("h-8 rounded-xl border shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]", getActivityCellClass(count))}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground" aria-hidden="true">
              <span className="mr-1">{copy.activity}</span>
              {[0, 1, 2, 3].map((count) => (
                <span key={count} className={cn("h-2.5 w-2.5 rounded-sm border", getActivityCellClass(count))} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={installGuideOpen} onOpenChange={setInstallGuideOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.installGuideTitle}</DialogTitle>
            <DialogDescription>{copy.installGuideDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            {isIosDevice() ? (
              <>
                <div className="flex gap-3 rounded-md border border-border p-3">
                  <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>{copy.iosStep1}</p>
                </div>
                <div className="rounded-md border border-border p-3">{copy.iosStep2}</div>
                <div className="rounded-md border border-border p-3">{copy.iosStep3}</div>
              </>
            ) : (
              <>
                <div className="rounded-md border border-border p-3">{copy.androidStep1}</div>
                <div className="rounded-md border border-border p-3">{copy.androidStep2}</div>
                <div className="rounded-md border border-border p-3">{copy.androidStep3}</div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
