import { differenceInMinutes, format, isAfter, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock3, Dumbbell, ListChecks, Repeat2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";

export function HistoryPage() {
  const { sessions, exercises } = useGymStore();
  const lastSevenDays = sessions.filter((session) => isAfter(new Date(session.date), subDays(new Date(), 7)));
  const completedThisWeek = lastSevenDays.reduce(
    (total, session) => total + session.exercises.filter((exercise) => exercise.completed).length,
    0,
  );

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Riwayat</h1>
        <p className="text-muted-foreground">Sesi latihan yang tersimpan di perangkat ini.</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sesi 7 hari</p>
            <p className="font-mono text-3xl font-bold">{lastSevenDays.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Gerakan selesai</p>
            <p className="font-mono text-3xl font-bold">{completedThisWeek}</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        {sessions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Belum ada sesi</CardTitle>
              <CardDescription>Sesi latihan yang selesai akan muncul di sini.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {sessions.slice(0, 30).map((session) => {
          const completed = session.exercises.filter((item) => item.completed);
          const skipped = session.exercises.filter((item) => item.skipped);
          const planned = session.exercises.filter((item) => !item.completed && !item.skipped);
          const totalSets = session.exercises.reduce((total, item) => total + item.actualSets, 0);
          const totalReps = session.exercises.reduce((total, item) => total + item.actualReps, 0);
          const duration = Math.max(differenceInMinutes(new Date(session.endTime), new Date(session.startTime)), 1);

          return (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{session.workoutName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(session.date), "EEEE, d MMM yyyy, HH:mm", { locale: id })} · {duration} menit
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/15 text-primary">
                    <Trophy className="mr-1 h-3 w-3" />
                    {completed.length} selesai
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-md bg-secondary p-2">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock3 className="h-3 w-3" />
                      Durasi
                    </p>
                    <p className="font-mono text-lg font-bold">{duration}m</p>
                  </div>
                  <div className="rounded-md bg-secondary p-2">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ListChecks className="h-3 w-3" />
                      Gerakan
                    </p>
                    <p className="font-mono text-lg font-bold">
                      {completed.length}/{session.exercises.length}
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary p-2">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Dumbbell className="h-3 w-3" />
                      Set
                    </p>
                    <p className="font-mono text-lg font-bold">{totalSets}</p>
                  </div>
                  <div className="rounded-md bg-secondary p-2">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Repeat2 className="h-3 w-3" />
                      Reps
                    </p>
                    <p className="font-mono text-lg font-bold">{totalReps}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-500/15 text-emerald-300">{completed.length} selesai</Badge>
                  {skipped.length ? (
                    <Badge variant="secondary" className="text-muted-foreground">
                      {skipped.length} dilewati
                    </Badge>
                  ) : null}
                  {planned.length ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      {planned.length} belum
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {session.exercises.slice(0, 4).map((item) => {
                    const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
                    return (
                      <div key={item.exerciseId} className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
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
                          {item.completed ? "Selesai" : item.skipped ? "Dilewati" : "Belum"}
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
      </section>
    </div>
  );
}
