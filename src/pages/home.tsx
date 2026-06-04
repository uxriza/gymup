import { useEffect, useState } from "react";
import { addMonths, differenceInMinutes, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, Dumbbell, Play, Repeat2, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const weekdayLabels = ["S", "S", "R", "K", "J", "S", "M"];

const getActivityCellClass = (count: number) => {
  if (count >= 3) return "border-primary bg-primary";
  if (count === 2) return "border-primary/70 bg-primary/70";
  if (count === 1) return "border-primary/45 bg-primary/35";
  return "border-border bg-secondary/70";
};

export function HomePage() {
  const navigate = useNavigate();
  const { sessions, exercises, activeWorkout } = useGymStore();
  const [now, setNow] = useState(() => new Date());
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const latestSession = sessions[0];
  const latestCompletedExercises = latestSession?.exercises.filter((item) => item.completed) ?? [];
  const latestDuration = latestSession
    ? Math.max(differenceInMinutes(new Date(latestSession.endTime), new Date(latestSession.startTime)), 1)
    : 0;
  const latestSets = latestSession?.exercises.reduce((total, item) => total + item.actualSets, 0) ?? 0;
  const latestRep = latestSession?.exercises.reduce((total, item) => total + item.actualReps, 0) ?? 0;
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weeklySessions = sessions.filter((session) =>
    isWithinInterval(new Date(session.date), { start: weekStart, end: weekEnd }),
  );
  const weeklyMinutes = weeklySessions.reduce(
    (total, session) => total + Math.max(differenceInMinutes(new Date(session.endTime), new Date(session.startTime)), 1),
    0,
  );
  const weeklyCompletedExercises = weeklySessions.reduce(
    (total, session) => total + session.exercises.filter((exercise) => exercise.completed).length,
    0,
  );
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
            <h1 className="text-3xl font-bold tracking-normal">Tracker latihan pribadi</h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Mulai program latihan, ikuti gerakan, lalu catat progres sesi secara lokal.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{activeWorkout ? "Sesi sedang berjalan" : "Siap latihan hari ini"}</p>
              <p className="text-xs text-muted-foreground">
                {activeWorkout ? "Lanjutkan dari posisi terakhir." : "Pilih program dan mulai sesi baru."}
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
            className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={handleInstallShortcut}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Download className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">Tambah ke Home</span>
                <span className="block text-xs text-muted-foreground">Buka GymUp seperti aplikasi dari layar utama HP.</span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ) : null}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Minggu ini</h2>
          <p className="text-sm text-muted-foreground">Ringkasan latihan Senin sampai Minggu.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{weeklySessions.length}</p>
                <p className="text-xs text-muted-foreground">Sesi</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{weeklyMinutes}</p>
                <p className="text-xs text-muted-foreground">Menit</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{weeklyCompletedExercises}</p>
                <p className="text-xs text-muted-foreground">Gerakan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {activeWorkout ? (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Sesi aktif</CardTitle>
            <CardDescription>Lanjutkan sesi sebelum membuka flow latihan lain.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={() => navigate("/workout")}>
              Lanjutkan
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {latestSession ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Terakhir</h2>
              <p className="text-sm text-muted-foreground">Program dan progres sesi terbaru.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              Riwayat
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

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
                <div className="rounded-md bg-secondary p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    Durasi
                  </p>
                  <p className="font-mono text-2xl font-bold">{latestDuration}m</p>
                </div>
                <div className="rounded-md bg-secondary p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Dumbbell className="h-3 w-3" />
                    Set
                  </p>
                  <p className="font-mono text-2xl font-bold">{latestSets}</p>
                </div>
                <div className="rounded-md bg-secondary p-3">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Repeat2 className="h-3 w-3" />
                    Rep
                  </p>
                  <p className="font-mono text-2xl font-bold">{latestRep}</p>
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
                          <p className="shrink-0 font-mono text-xs text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">Belum ada gerakan selesai di program terakhir.</p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}

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
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium text-muted-foreground">
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
            <DialogTitle>Tambah ke Home Screen</DialogTitle>
            <DialogDescription>
              {isIosDevice()
                ? "Di iPhone, shortcut ditambahkan lewat tombol Share di Safari."
                : "Kalau prompt install belum muncul, gunakan menu browser untuk menambahkan shortcut."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            {isIosDevice() ? (
              <>
                <div className="flex gap-3 rounded-md border border-border p-3">
                  <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p>Tap tombol Share di Safari.</p>
                </div>
                <div className="rounded-md border border-border p-3">Pilih “Add to Home Screen” atau “Tambahkan ke Layar Utama”.</div>
                <div className="rounded-md border border-border p-3">Tap “Add”, lalu buka GymUp dari icon di Home Screen.</div>
              </>
            ) : (
              <>
                <div className="rounded-md border border-border p-3">Buka menu browser.</div>
                <div className="rounded-md border border-border p-3">Pilih “Install app” atau “Add to Home screen”.</div>
                <div className="rounded-md border border-border p-3">Setelah terpasang, GymUp bisa dibuka dari Home Screen.</div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
