import { useEffect, useState } from "react";
import { differenceInMinutes, endOfWeek, format, isWithinInterval, startOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Dumbbell, Play, Repeat2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGymStore } from "@/store/gym-store";

export function HomePage() {
  const navigate = useNavigate();
  const { sessions, exercises, activeWorkout } = useGymStore();
  const [now, setNow] = useState(() => new Date());
  const latestSession = sessions[0];
  const latestCompletedExercises = latestSession?.exercises.filter((item) => item.completed) ?? [];
  const latestDuration = latestSession
    ? Math.max(differenceInMinutes(new Date(latestSession.endTime), new Date(latestSession.startTime)), 1)
    : 0;
  const latestSets = latestSession?.exercises.reduce((total, item) => total + item.actualSets, 0) ?? 0;
  const latestReps = latestSession?.exercises.reduce((total, item) => total + item.actualReps, 0) ?? 0;
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

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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
              Lanjutkan Sesi
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
                    Reps
                  </p>
                  <p className="font-mono text-2xl font-bold">{latestReps}</p>
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
    </div>
  );
}
