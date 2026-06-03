import { differenceInMinutes, format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGymStore } from "@/store/gym-store";

export function SummaryPage() {
  const navigate = useNavigate();
  const { sessions, exercises } = useGymStore();
  const session = sessions[0];

  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Belum ada ringkasan</h1>
        <Button onClick={() => navigate("/")}>Beranda</Button>
      </div>
    );
  }

  const completed = session.exercises.filter((item) => item.completed);
  const skipped = session.exercises.filter((item) => item.skipped);
  const planned = session.exercises.filter((item) => !item.completed && !item.skipped);
  const duration = Math.max(differenceInMinutes(new Date(session.endTime), new Date(session.startTime)), 1);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold">Sesi tersimpan</h1>
        <p className="text-muted-foreground">
          {session.workoutName} · {format(new Date(session.date), "d MMM yyyy")} · {duration} menit
        </p>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="font-mono text-3xl font-bold">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dilewati</p>
            <p className="font-mono text-3xl font-bold">{skipped.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Belum</p>
            <p className="font-mono text-3xl font-bold">{planned.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hasil gerakan</CardTitle>
          <CardDescription>Set dan repetisi tersimpan di perangkat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.exercises.map((item) => {
            const exercise = exercises.find((candidate) => candidate.id === item.exerciseId);
            return (
              <div key={item.exerciseId} className="flex items-center justify-between gap-3 rounded-md bg-secondary p-3">
                <div>
                  <p className="font-semibold">{exercise?.name || "Gerakan"}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.actualSets} set · {item.actualReps} repetisi
                    {item.weightKg !== undefined ? ` · ${item.weightKg} kg` : ""}
                  </p>
                </div>
                <Badge variant={item.completed ? "default" : "secondary"} className={!item.completed ? "text-muted-foreground" : undefined}>
                  {item.completed ? "Selesai" : item.skipped ? "Dilewati" : "Belum"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {session.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{session.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <Button className="w-full" size="lg" onClick={() => navigate("/")}>
        Beranda
      </Button>
    </div>
  );
}
