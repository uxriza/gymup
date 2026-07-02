import { useEffect, useState } from "react";
import { addMonths, differenceInMinutes, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, subMonths } from "date-fns";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, Dumbbell, ListChecks, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { getWeekdayShortLabels } from "@/lib/labels";
import { hasMeaningfulSessionProgress } from "@/lib/session-utils";
import { useGymStore } from "@/store/gym-store";
import type { Exercise } from "@/types";
import { cn } from "@/lib/utils";

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
  const { sessions, exercises, workouts, activeWorkout, startWorkout } = useGymStore();
  const [now, setNow] = useState(() => new Date());
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const meaningfulSessions = sessions.filter(hasMeaningfulSessionProgress);
  const latestSession = meaningfulSessions[0] ?? sessions[0];
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
  const monthStart = startOfMonth(displayedMonth);
  const monthEnd = endOfMonth(displayedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlySessions = meaningfulSessions.filter((session) =>
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
        descriptionLoggedOut: "Track daily workouts with a mobile-first flow that stays focused and easy to use.",
        suggestedLabel: "Suggested for today",
        suggestedTitle: "Suggested workout",
        suggestedFallback: "Choose your workout",
        suggestedDescription: "Based on your latest session",
        suggestedReason: "Ready to continue with a familiar focus and manageable duration.",
        suggestedSummary: (exerciseCount: number, minutes: number) => `${exerciseCount} exercises · about ${minutes} min`,
        takeSuggested: "Start workout",
        startWorkout: "Choose program",
        addToHome: "Add to home screen",
        addToHomeDescription: "Open GymUp like an app from your phone home screen",
        activeSession: "Active session",
        activeSessionDescription: "Return to this session before opening another workout page",
        continueSession: "Continue session",
        latestActivity: "Latest activity",
        latestActivityDescription: "Your most recent completed session",
        history: "History",
        latestSummary: (done: number, total: number) => `${done}/${total} exercises completed`,
        duration: "Duration",
        completedCount: "Completed",
        totalExercises: "Total exercises",
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
        descriptionLoggedOut: "Catat latihan harian dengan tampilan yang fokus, padat, dan mudah dipakai di mobile.",
        suggestedLabel: "Rekomendasi hari ini",
        suggestedTitle: "Latihan rekomendasi",
        suggestedFallback: "Pilih latihanmu",
        suggestedDescription: "Berdasarkan sesi terakhirmu",
        suggestedReason: "Cocok untuk lanjut dari ritme terakhir dengan durasi yang tetap ringan.",
        suggestedSummary: (exerciseCount: number, minutes: number) => `${exerciseCount} gerakan · sekitar ${minutes} menit`,
        takeSuggested: "Mulai latihan ini",
        startWorkout: "Pilih program",
        addToHome: "Tambah ke layar utama",
        addToHomeDescription: "Buka GymUp seperti aplikasi dari layar utama HP",
        activeSession: "Sesi aktif",
        activeSessionDescription: "Lanjutkan sesi sebelum membuka halaman latihan lain",
        continueSession: "Lanjutkan sesi",
        latestActivity: "Aktivitas terbaru",
        latestActivityDescription: "Program dan progres sesi terbaru",
        history: "Riwayat",
        latestSummary: (done: number, total: number) => `${done}/${total} gerakan selesai`,
        duration: "Durasi",
        completedCount: "Selesai",
        totalExercises: "Total gerakan",
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

  const handleTakeSuggestedWorkout = () => {
    if (!recommendedWorkout) {
      navigate("/select");
      return;
    }

    startWorkout(recommendedWorkout.id);
    navigate("/workout");
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(now, "EEEE, d MMM", { locale: dateLocale })} · {format(now, "HH:mm")}
            </p>
            <h1 className="font-display text-[1.5rem] font-bold uppercase leading-[0.96] text-foreground sm:text-[1.65rem]">
              {displayName ? `${copy.greetingPrefix}, ${displayName}` : copy.fallbackTitle}
            </h1>
            {!displayName ? <p className="page-description">{copy.descriptionLoggedOut}</p> : null}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card/92 p-5 shadow-[0_20px_56px_rgb(0_0_0/0.28)]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgb(10 12 17 / 0.18) 0%, rgb(13 16 22 / 0.34) 26%, rgb(14 17 23 / 0.82) 58%, rgb(15 18 24 / 0.96) 100%), linear-gradient(90deg, rgb(15 18 24 / 0.94) 0%, rgb(15 18 24 / 0.56) 36%, rgb(15 18 24 / 0.16) 68%, rgb(15 18 24 / 0.06) 100%), url('/gym-header.png')",
              backgroundPosition: "center, center, center top",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover, cover, cover",
              opacity: 0.92,
            }}
          />
          <div className="relative space-y-5">
            <div className="space-y-3">
              <p className="eyebrow text-primary">{copy.suggestedLabel}</p>
              <div className="space-y-2">
                <h2 className="section-title text-[2rem]">{recommendedWorkout?.name ?? copy.suggestedFallback}</h2>
                {recommendedWorkout ? <p className="text-[0.86rem] leading-5 text-muted-foreground">{copy.suggestedDescription}</p> : null}
              </div>
              {recommendedWorkout ? (
                <div className="space-y-3">
                  <p className="max-w-[26rem] text-[0.95rem] leading-6 text-foreground/88">{copy.suggestedReason}</p>
                  <div className="inline-flex rounded-md border border-border bg-secondary/55 px-3 py-2 text-[0.84rem] text-muted-foreground">
                    {copy.suggestedSummary(recommendedMainExercises.length, estimatedMinutes)}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Button className="h-12 w-full" size="lg" onClick={handleTakeSuggestedWorkout}>
                <Dumbbell className="h-4 w-4" />
                {copy.takeSuggested}
              </Button>
              <Button className="h-12 w-full" size="lg" variant="secondary" onClick={() => navigate("/select")}>
                <ListChecks className="h-4 w-4" />
                {copy.startWorkout}
              </Button>
            </div>
          </div>
        </div>

        {!isInstalled ? (
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-md border border-border/80 bg-card/70 p-3 text-left transition-colors hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={handleInstallShortcut}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Download className="h-5 w-5" />
              </span>
              <span className="min-w-0 space-y-0.5">
                <span className="block text-[0.98rem] font-medium leading-5 text-foreground">{copy.addToHome}</span>
                <span className="block text-[0.84rem] leading-5 text-muted-foreground">{copy.addToHomeDescription}</span>
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
              {copy.continueSession}
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
            <CardHeader className="space-y-3 p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">{latestSession.workoutName}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(new Date(latestSession.date), "EEEE, d MMM, HH:mm", { locale: dateLocale })}
                    </CardDescription>
                  </div>
                  <Badge className="shrink-0 border border-primary/20 bg-primary/10 text-[0.7rem] font-medium text-primary">
                    {completedRatio}%
                  </Badge>
                </div>
                <p className="text-sm leading-5 text-muted-foreground">
                  {copy.latestSummary(latestCompletedExercises.length, latestSession.exercises.length)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="metric-surface p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 text-primary" />
                    {copy.duration}
                  </p>
                  <p className="text-2xl font-bold">{latestDuration}m</p>
                </div>
                <div className="metric-surface p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ListChecks className="h-3 w-3 text-primary" />
                    {copy.totalExercises}
                  </p>
                  <p className="text-2xl font-bold">{latestSession.exercises.length}</p>
                </div>
                <div className="metric-surface p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {copy.completedCount}
                  </p>
                  <p className="text-2xl font-bold">{latestCompletedExercises.length}</p>
                </div>
              </div>
              {!latestCompletedExercises.length ? (
                <p className="border-t border-border pt-3 text-sm text-muted-foreground">{copy.noLatestCompleted}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 bg-card/80">
            <CardContent className="space-y-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
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

      <section className="space-y-1.5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.05rem] font-bold uppercase leading-none text-foreground/82">{copy.monthlyActivity}</h2>
            <p className="text-[0.84rem] leading-5 text-muted-foreground">{copy.monthlyActivityDescription(monthlyActiveDays, monthlySessions.length)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setDisplayedMonth((current) => subMonths(current, 1))}
              aria-label={copy.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-20 text-center text-[0.72rem] font-medium uppercase text-muted-foreground">
              {format(displayedMonth, "MMM yyyy", { locale: dateLocale })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setDisplayedMonth((current) => addMonths(current, 1))}
              disabled={!canGoToNextMonth}
              aria-label={copy.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Card className="border-border/70 bg-card/72 shadow-none">
          <CardContent className="space-y-2 p-3">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-medium text-muted-foreground">
              {weekdayLabels.map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {monthGridDays.map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="h-7 rounded-md" aria-hidden="true" />;
                }

                const count = getSessionCountForDay(day);
                const label = copy.sessionLabel(format(day, "d MMMM", { locale: dateLocale }), count);

                return (
                  <span
                    key={day.toISOString()}
                    role="img"
                    aria-label={label}
                    title={label}
                    className={cn("h-7 rounded-md border shadow-sm", getActivityCellClass(count))}
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
