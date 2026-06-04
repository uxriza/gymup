import { useState } from "react";
import { differenceInMinutes, format } from "date-fns";
import { CheckCircle2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGymStore } from "@/store/gym-store";

export function SummaryPage() {
  const navigate = useNavigate();
  const { sessions, exercises } = useGymStore();
  const [rewardOpen, setRewardOpen] = useState(true);
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
    <div className="space-y-5 pb-28">
      <Dialog open={rewardOpen} onOpenChange={setRewardOpen}>
        <DialogContent className="max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-7 w-7" />
          </div>
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl">Latihan selesai</DialogTitle>
            <DialogDescription>
              Kamu menyelesaikan {completed.length} gerakan dari program {session.workoutName} dalam {duration} menit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 rounded-md bg-secondary p-3 text-left">
            <div>
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="text-xl font-bold">{completed.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Set</p>
              <p className="text-xl font-bold">{session.exercises.reduce((total, item) => total + item.actualSets, 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rep</p>
              <p className="text-xl font-bold">{session.exercises.reduce((total, item) => total + item.actualReps, 0)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button className="min-h-12 w-full" onClick={() => setRewardOpen(false)}>
              Lihat ringkasan
            </Button>
            <Button className="min-h-12 w-full" variant="secondary" onClick={() => navigate("/")}>
              Beranda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <section className="space-y-2">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h1 className="text-[2rem] font-bold leading-9">Sesi tersimpan</h1>
        <p className="text-muted-foreground">
          {session.workoutName} · {format(new Date(session.date), "d MMM yyyy")} · {duration} menit
        </p>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/10 bg-card/88">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="text-3xl font-bold">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dilewati</p>
            <p className="text-3xl font-bold">{skipped.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Belum</p>
            <p className="text-3xl font-bold">{planned.length}</p>
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

      <div className="fixed inset-x-0 bottom-[calc(max(34px,env(safe-area-inset-bottom))_+_72px)] z-40 border-t border-border bg-background/95 px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <Button className="min-h-12 w-full" size="lg" onClick={() => navigate("/")}>
            Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
