import { useEffect, useState } from "react";
import { addMonths, differenceInMinutes, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, Dumbbell, Play, Repeat2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { useGymStore } from "@/store/gym-store";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in window.navigator && Boolean(window.navigator.standalone));

const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const getActivityCellClass = (count: number) => {
  if (count >= 3) return "border-primary bg-primary";
  if (count === 2) return "border-primary/70 bg-primary/70";
  if (count === 1) return "border-primary/45 bg-primary/35";
  return "border-border bg-secondary/70";
};

export function HomePage() {
  const navigate = useNavigate();
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
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {format(now, "EEEE, d MMM", { locale: id })} · {format(now, "HH:mm:ss")}
          </p>
          <div className="space-y-1">
            <h1 className="text-[2rem] font-bold leading-9 tracking-normal">
              {displayName ? `Halo, ${displayName}` : "Tracker latihan pribadi"}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {displayName
                ? "Siap lanjutkan progres latihan hari ini"
                : "Mulai program latihan, ikuti gerakan, lalu catat progres sesi secara lokal"}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-[radial-gradient(circle_at_88%_22%,rgb(255_122_26/0.13),transparent_30%),linear-gradient(135deg,rgb(13_14_16/0.98)_0%,rgb(21_23_27/0.96)_62%,rgb(255_122_26/0.08)_100%)] p-4 shadow-[0_24px_70px_hsl(var(--primary)/0.08)]">
          <div className="pointer-events-none absolute -bottom-14 -right-10 h-36 w-36 rounded-full border border-primary/20 bg-primary/8 blur-2xl" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-xl font-bold uppercase leading-6">
                {activeWorkout ? "Lanjutkan latihan" : "Mulai sesi latihan"}
              </p>
              <p className="mt-1 max-w-[15rem] text-sm leading-6 text-muted-foreground">
                {activeWorkout
                  ? "Sesi kamu masih tersimpan"
                  : recommendedWorkout
                    ? `Saran: ${recommendedWorkout.name}`
                    : "Mulai catat progres"}
              </p>
            </div>
            <Button className="h-12 shrink-0 px-4" size="lg" onClick={() => navigate(activeWorkout ? "/workout" : "/select")}>
              <Play className="h-5 w-5" />
              {activeWorkout ? "Lanjutkan" : "Mulai"}
            </Button>
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
              <span className="min-w-0">
                <span className="block text-sm font-medium">Tambah ke layar utama</span>
                <span className="block text-xs text-muted-foreground">Buka GymUp seperti aplikasi dari layar utama HP</span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
      </section>

      {activeWorkout ? (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Sesi aktif</CardTitle>
            <CardDescription>Lanjutkan sesi sebelum membuka halaman latihan lain</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={() => navigate("/workout")}>
              Lanjutkan
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Terakhir</h2>
            <p className="text-sm text-muted-foreground">Program dan progres sesi terbaru</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
            Riwayat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {latestSession ? (
          <Card>
            <CardHeader className="space-y-3">
              <div>
                <CardTitle>{latestSession.workoutName}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" />
                  {format(new Date(latestSession.date), "EEEE, d MMM, HH:mm", { locale: id })}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/15 text-primary">{latestCompletedExercises.length} selesai</Badge>
                <Badge variant="secondary" className="text-muted-foreground">
                  {latestSession.exercises.length} total gerakan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="relative overflow-hidden rounded-md border border-primary/15 bg-[linear-gradient(115deg,rgb(22_24_28/0.96)_0%,rgb(30_33_39/0.92)_64%,rgb(255_122_26/0.06)_100%)] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
                  <div className="pointer-events-none absolute -right-5 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-primary/8 blur-xl" aria-hidden="true" />
                  <p className="relative flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 text-primary" />
                    Durasi
                  </p>
                  <p className="relative text-2xl font-bold">{latestDuration}m</p>
                </div>
                <div className="relative overflow-hidden rounded-md border border-primary/15 bg-[linear-gradient(115deg,rgb(22_24_28/0.96)_0%,rgb(30_33_39/0.92)_64%,rgb(255_122_26/0.055)_100%)] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
                  <div className="pointer-events-none absolute -right-5 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-primary/8 blur-xl" aria-hidden="true" />
                  <p className="relative flex items-center gap-1 text-xs text-muted-foreground">
                    <Dumbbell className="h-3 w-3 text-primary" />
                    Set
                  </p>
                  <p className="relative text-2xl font-bold">{latestSets}</p>
                </div>
                <div className="relative overflow-hidden rounded-md border border-primary/15 bg-[linear-gradient(115deg,rgb(22_24_28/0.96)_0%,rgb(30_33_39/0.92)_64%,rgb(255_122_26/0.05)_100%)] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
                  <div className="pointer-events-none absolute -right-5 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-primary/8 blur-xl" aria-hidden="true" />
                  <p className="relative flex items-center gap-1 text-xs text-muted-foreground">
                    <Repeat2 className="h-3 w-3 text-primary" />
                    Repetisi
                  </p>
                  <p className="relative text-2xl font-bold">{latestRep}</p>
                </div>
              </div>

              {latestCompletedExercises.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Gerakan utama</p>
                  <div className="space-y-2">
                    {latestCompletedExercises.slice(0, 3).map((item) => {
                      const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
                      return (
                        <div key={item.exerciseId} className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
                          <p className="truncate text-sm font-medium">{exercise?.name || "Gerakan"}</p>
                          <p className="shrink-0 text-xs text-muted-foreground">
                            {item.actualSets} set · {item.actualReps} repetisi
                            {item.weightKg !== undefined ? ` · ${item.weightKg} kg` : ""}
                          </p>
                        </div>
                      );
                    })}
                    {latestCompletedExercises.length > 3 ? (
                      <p className="text-xs text-muted-foreground">+{latestCompletedExercises.length - 3} gerakan lainnya</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada gerakan selesai di program terakhir</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 bg-card/80">
            <CardContent className="space-y-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Belum ada sesi selesai</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Mulai latihan pertama kamu, nanti progres terakhir akan muncul di sini.
                </p>
              </div>
              <Button className="min-h-11 w-full" onClick={() => navigate("/select")}>
                Mulai latihan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Aktivitas bulanan</h2>
            <p className="text-sm text-muted-foreground">
              {monthlyActiveDays} hari aktif · {monthlySessions.length} sesi
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => setDisplayedMonth((current) => subMonths(current, 1))}
              aria-label="Lihat bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-20 text-center text-xs font-medium text-muted-foreground">{format(displayedMonth, "MMM yyyy", { locale: id })}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              onClick={() => setDisplayedMonth((current) => addMonths(current, 1))}
              disabled={!canGoToNextMonth}
              aria-label="Lihat bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Card>
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
                const label = `${format(day, "d MMMM", { locale: id })}: ${count} sesi`;

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
              <span className="mr-1">Aktivitas</span>
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
            <DialogTitle>Tambahkan ke layar utama</DialogTitle>
            <DialogDescription>
              {isIosDevice()
                ? "Di iPhone, shortcut ditambahkan lewat tombol Bagikan di Safari"
                : "Kalau pilihan pasang belum muncul, gunakan menu browser untuk menambahkan aplikasi"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            {isIosDevice() ? (
              <>
                <div className="flex gap-3 rounded-md border border-border p-3">
                  <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>Ketuk tombol Bagikan di Safari</p>
                </div>
                <div className="rounded-md border border-border p-3">Pilih “Tambahkan ke Layar Utama”</div>
                <div className="rounded-md border border-border p-3">Ketuk “Tambah”, lalu buka GymUp dari ikon di layar utama</div>
              </>
            ) : (
              <>
                <div className="rounded-md border border-border p-3">Buka menu browser</div>
                <div className="rounded-md border border-border p-3">Pilih “Pasang aplikasi” atau “Tambahkan ke layar utama”</div>
                <div className="rounded-md border border-border p-3">Setelah terpasang, GymUp bisa dibuka dari layar utama</div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
