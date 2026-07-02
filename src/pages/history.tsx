import { useState } from "react";
import { differenceInMinutes, format, type Locale } from "date-fns";
import { Calendar, CheckCircle2, Clock3, TimerOff, Trash2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { hasMeaningfulSessionProgress } from "@/lib/session-utils";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";

const getDateGroupLabel = (date: Date, now: Date, language: "id" | "en", locale: Locale) => {
  const today = format(now, "yyyy-MM-dd");
  const sessionDay = format(date, "yyyy-MM-dd");
  const yesterday = format(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), "yyyy-MM-dd");

  if (sessionDay === today) return language === "en" ? "Today" : "Hari ini";
  if (sessionDay === yesterday) return language === "en" ? "Yesterday" : "Kemarin";
  return format(date, "EEEE, d MMMM yyyy", { locale });
};

export function HistoryPage() {
  const navigate = useNavigate();
  const { language, dateLocale } = useI18n();
  const { toast } = useToast();
  const { sessions, exercises, resetHistory } = useGymStore();
  const [resetOpen, setResetOpen] = useState(false);
  const meaningfulSessions = sessions.filter(hasMeaningfulSessionProgress);
  const now = new Date();
  const groupedSessions = meaningfulSessions.slice(0, 30).reduce<Array<{ label: string; sessions: typeof sessions }>>((groups, session) => {
    const label = getDateGroupLabel(new Date(session.date), now, language, dateLocale);
    const existingGroup = groups.find((group) => group.label === label);
    if (existingGroup) {
      existingGroup.sessions.push(session);
    } else {
      groups.push({ label, sessions: [session] });
    }
    return groups;
  }, []);
  const copy = language === "en"
    ? {
        title: "History",
        description: "Workout sessions stored on this device",
        clearHistory: "Clear history",
        clearHistoryTitle: "Clear history?",
        clearHistoryDescription: "All saved workout sessions will be deleted. Your workout programs stay safe.",
        clearHistoryAction: "Clear history",
        cancel: "Cancel",
        clearedTitle: "History cleared",
        clearedDescription: "All saved workout sessions have been removed",
        sessionList: "Session list",
        storedSessions: (count: number) => `${count} saved sessions`,
        noSessionTitle: "No completed sessions yet",
        noSessionDescription: "Finish at least one exercise and your training history will show up here.",
        startWorkout: "Start workout",
        duration: "Duration",
        set: "Set",
        reps: "Reps",
        doneAndSkipped: (done: number, skipped: number) => `${done} done · ${skipped} not completed`,
        fallbackExercise: "Exercise",
        exerciseSummary: (sets: number, reps: number, weightKg?: number) =>
          `${sets} sets · ${reps} reps${weightKg !== undefined ? ` · ${weightKg} kg` : ""}`,
        completed: "Done",
        skipped: "Not completed",
        moreExercises: (count: number) => `+${count} more exercises`,
        minuteSuffix: "min",
      }
    : {
        title: "Riwayat",
        description: "Sesi latihan yang tersimpan di perangkat ini",
        clearHistory: "Hapus riwayat",
        clearHistoryTitle: "Hapus riwayat?",
        clearHistoryDescription: "Semua sesi latihan yang tersimpan akan dihapus. Program latihan tetap aman",
        clearHistoryAction: "Hapus riwayat",
        cancel: "Batal",
        clearedTitle: "Riwayat dihapus",
        clearedDescription: "Semua sesi latihan sudah dibersihkan",
        sessionList: "Daftar sesi",
        storedSessions: (count: number) => `${count} sesi tersimpan`,
        noSessionTitle: "Belum ada sesi dengan progres",
        noSessionDescription: "Selesaikan minimal satu gerakan, nanti riwayat latihanmu muncul di sini",
        startWorkout: "Mulai latihan",
        duration: "Durasi",
        set: "Set",
        reps: "Repetisi",
        doneAndSkipped: (done: number, skipped: number) => `${done} selesai · ${skipped} tidak dikerjakan`,
        fallbackExercise: "Gerakan",
        exerciseSummary: (sets: number, reps: number, weightKg?: number) =>
          `${sets} set · ${reps} repetisi${weightKg !== undefined ? ` · ${weightKg} kg` : ""}`,
        completed: "Selesai",
        skipped: "Tidak dikerjakan",
        moreExercises: (count: number) => `+${count} gerakan lainnya`,
        minuteSuffix: "menit",
      };

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-description">{copy.description}</p>
        </div>
        {sessions.length ? (
          <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0" onClick={() => setResetOpen(true)} aria-label={copy.clearHistory}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </section>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.clearHistoryTitle}</DialogTitle>
            <DialogDescription>{copy.clearHistoryDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              className="min-h-12 w-full"
              variant="destructive"
              onClick={() => {
                resetHistory();
                setResetOpen(false);
                toast({
                  title: copy.clearedTitle,
                  description: copy.clearedDescription,
                  variant: "destructive",
                });
              }}
            >
              {copy.clearHistoryAction}
            </Button>
            <Button className="min-h-12 w-full" variant="secondary" onClick={() => setResetOpen(false)}>
              {copy.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <section className="space-y-3">
        <div>
          <h2 className="section-title">{copy.sessionList}</h2>
          <p className="section-description">{copy.storedSessions(meaningfulSessions.length)}</p>
        </div>

        {meaningfulSessions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{copy.noSessionTitle}</CardTitle>
              <CardDescription>{copy.noSessionDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="min-h-12 w-full" onClick={() => navigate("/select")}>
                {copy.startWorkout}
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
              const performedExercises = session.exercises.filter((item) => item.actualSets > 0 || item.actualReps > 0);
              const duration = Math.max(differenceInMinutes(new Date(session.endTime), new Date(session.startTime)), 1);

              return (
                <Card
                  key={session.id}
                  className="relative overflow-hidden border-border/80 bg-[linear-gradient(135deg,rgb(13_14_16/0.98)_0%,rgb(18_20_24/0.96)_64%,rgb(255_122_26/0.045)_100%)] shadow-[0_18px_54px_rgb(0_0_0/0.24)]"
                >
                  <div className="pointer-events-none absolute -right-16 top-8 h-32 w-32 rounded-full bg-primary/6 blur-2xl" aria-hidden="true" />
                  <CardHeader className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{session.workoutName}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(session.date), "HH:mm", { locale: dateLocale })}
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
                      <div className="metric-surface p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          {copy.duration}
                        </p>
                        <p className="text-lg font-bold">{duration}m</p>
                      </div>
                      <div className="metric-surface p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          {copy.completed}
                        </p>
                        <p className="text-lg font-bold">{completed.length}</p>
                      </div>
                      <div className="metric-surface p-2">
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <TimerOff className="h-3 w-3" />
                          {copy.skipped}
                        </p>
                        <p className="text-lg font-bold">{planned.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {performedExercises.slice(0, 4).map((item) => {
                        const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
                        return (
                          <div key={item.exerciseId} className="surface-list-item flex items-center justify-between gap-3 border-border/90 bg-background/42 p-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{exercise?.name || copy.fallbackExercise}</p>
                              <p className="text-xs text-muted-foreground">{copy.exerciseSummary(item.actualSets, item.actualReps, item.weightKg)}</p>
                            </div>
                            <Badge
                              variant={item.completed ? "default" : "secondary"}
                              className={cn(
                                "shrink-0",
                                item.completed && "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20",
                                !item.completed && "text-muted-foreground",
                              )}
                            >
                              {item.completed ? copy.completed : copy.skipped}
                            </Badge>
                          </div>
                        );
                      })}
                      {performedExercises.length > 4 ? (
                        <p className="text-xs text-muted-foreground">{copy.moreExercises(performedExercises.length - 4)}</p>
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
