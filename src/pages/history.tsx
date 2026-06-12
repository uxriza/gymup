import { useState } from "react";
import { differenceInMinutes, endOfWeek, format, isWithinInterval, startOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, CalendarDays, CheckCircle2, Clock3, Dumbbell, ListChecks, Repeat2, Trash2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";

const getDateGroupLabel = (date: Date, now: Date) => {
  const today = format(now, "yyyy-MM-dd");
  const sessionDay = format(date, "yyyy-MM-dd");
  const yesterday = format(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), "yyyy-MM-dd");

  if (sessionDay === today) return "Hari ini";
  if (sessionDay === yesterday) return "Kemarin";
  return format(date, "EEEE, d MMMM yyyy", { locale: id });
};

export function HistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessions, exercises, resetHistory } = useGymStore();
  const [resetOpen, setResetOpen] = useState(false);
  const now = new Date();
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
  const groupedSessions = sessions.slice(0, 30).reduce<Array<{ label: string; sessions: typeof sessions }>>((groups, session) => {
    const label = getDateGroupLabel(new Date(session.date), now);
    const existingGroup = groups.find((group) => group.label === label);
    if (existingGroup) {
      existingGroup.sessions.push(session);
    } else {
      groups.push({ label, sessions: [session] });
    }
    return groups;
  }, []);

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="page-title">Riwayat</h1>
          <p className="page-description">Sesi latihan yang tersimpan di perangkat ini</p>
        </div>
        {sessions.length ? (
          <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0" onClick={() => setResetOpen(true)} aria-label="Hapus riwayat">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </section>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus riwayat?</DialogTitle>
            <DialogDescription>Semua sesi latihan yang tersimpan akan dihapus. Program latihan tetap aman</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              className="min-h-12 w-full"
              variant="destructive"
              onClick={() => {
                resetHistory();
                setResetOpen(false);
                toast({
                  title: "Riwayat dihapus",
                  description: "Semua sesi latihan sudah dibersihkan",
                  variant: "destructive",
                });
              }}
            >
              Hapus riwayat
            </Button>
            <Button className="min-h-12 w-full" variant="secondary" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <section className="space-y-3">
        <div>
          <h2 className="section-title">Minggu ini</h2>
          <p className="section-description">Ringkasan sesi Senin sampai Minggu</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="metric-surface border-primary/25">
            <CardContent className="relative z-10 space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="metric-value">{weeklySessions.length}</p>
                <p className="metric-label">Sesi</p>
              </div>
            </CardContent>
          </Card>
          <Card className="metric-surface border-primary/25">
            <CardContent className="relative z-10 space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <p className="metric-value">{weeklyMinutes}</p>
                <p className="metric-label">Menit</p>
              </div>
            </CardContent>
          </Card>
          <Card className="metric-surface border-primary/25">
            <CardContent className="relative z-10 space-y-2 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="metric-value">{weeklyCompletedExercises}</p>
                <p className="metric-label">Gerakan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Daftar sesi</h2>
            <p className="section-description">{sessions.length} sesi tersimpan</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Belum ada sesi</CardTitle>
              <CardDescription>Mulai latihan pertama kamu, nanti riwayatnya muncul di sini</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="min-h-12 w-full" onClick={() => navigate("/select")}>
                Mulai latihan
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {groupedSessions.map((group) => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-3 pt-1">
              <p className="shrink-0 text-sm font-medium text-muted-foreground">{group.label}</p>
              <div className="h-px flex-1 bg-border" />
            </div>

            {group.sessions.map((session) => {
              const completed = session.exercises.filter((item) => item.completed);
              const planned = session.exercises.filter((item) => !item.completed);
              const totalSets = session.exercises.reduce((total, item) => total + item.actualSets, 0);
              const totalRep = session.exercises.reduce((total, item) => total + item.actualReps, 0);
              const duration = Math.max(differenceInMinutes(new Date(session.endTime), new Date(session.startTime)), 1);

              return (
                <Card
                  key={session.id}
                  className="relative overflow-hidden border-primary/25 bg-[linear-gradient(135deg,rgb(13_14_16/0.98)_0%,rgb(18_20_24/0.96)_64%,rgb(255_122_26/0.045)_100%)] shadow-[0_18px_54px_rgb(0_0_0/0.24)]"
                >
                  <div className="pointer-events-none absolute -right-16 top-8 h-32 w-32 rounded-full bg-primary/6 blur-2xl" aria-hidden="true" />
                  <CardHeader className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{session.workoutName}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(session.date), "HH:mm", { locale: id })} · {duration} menit
                        </CardDescription>
                      </div>
                      <Badge className="shrink-0 bg-primary/15 text-primary">
                        <Trophy className="mr-1 h-3 w-3" />
                        {completed.length}/{session.exercises.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="metric-surface border-primary/20 p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          Durasi
                        </p>
                        <p className="text-lg font-bold">{duration}m</p>
                      </div>
                      <div className="metric-surface border-primary/20 p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Dumbbell className="h-3 w-3" />
                          Set
                        </p>
                        <p className="text-lg font-bold">{totalSets}</p>
                      </div>
                      <div className="metric-surface border-primary/20 p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Repeat2 className="h-3 w-3" />
                          Repetisi
                        </p>
                        <p className="text-lg font-bold">{totalRep}</p>
                      </div>
                    </div>

                    {planned.length ? (
                      <p className="text-xs text-muted-foreground">
                        {completed.length} selesai · {planned.length} tidak dikerjakan
                      </p>
                    ) : null}

                    <div className="space-y-2">
                      {session.exercises.slice(0, 4).map((item) => {
                        const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
                        return (
                          <div key={item.exerciseId} className="surface-list-item flex items-center justify-between gap-3 border-border/90 bg-background/42 p-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{exercise?.name || "Gerakan"}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.actualSets} set · {item.actualReps} repetisi
                                {item.weightKg !== undefined ? ` · ${item.weightKg} kg` : ""}
                              </p>
                            </div>
                            <Badge
                              variant={item.completed ? "default" : "secondary"}
                              className={cn(
                                "shrink-0",
                                item.completed && "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20",
                                !item.completed && "text-muted-foreground",
                              )}
                            >
                              {item.completed ? "Selesai" : "Tidak dikerjakan"}
                            </Badge>
                          </div>
                        );
                      })}
                      {session.exercises.length > 4 ? (
                        <p className="text-xs text-muted-foreground">+{session.exercises.length - 4} gerakan lainnya</p>
                      ) : null}
                    </div>
                    {session.notes ? <p className="text-sm text-muted-foreground">{session.notes}</p> : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
