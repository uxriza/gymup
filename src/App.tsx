import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Activity, Dumbbell, History, Lock, Settings, Trash2 } from "lucide-react";
import { HomePage } from "@/pages/home";
import { SelectWorkoutPage } from "@/pages/select-workout";
import { WorkoutPage } from "@/pages/workout";
import { SummaryPage } from "@/pages/summary";
import { HistoryPage } from "@/pages/history";
import { SetupPage } from "@/pages/setup";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { to: "/", label: "Latihan", icon: Dumbbell },
  { to: "/history", label: "Riwayat", icon: History },
  { to: "/setup", label: "Atur", icon: Settings },
];

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkout, workouts, cancelWorkout } = useGymStore();
  const activeWorkoutName = workouts.find((workout) => workout.id === activeWorkout?.workoutId)?.name;
  const isLockedRoute = Boolean(activeWorkout && !["/workout", "/summary"].includes(location.pathname));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button className="flex items-center gap-2 text-left" onClick={() => navigate(activeWorkout ? "/workout" : "/")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-bold">GymUp</span>
              <span className="block text-xs text-muted-foreground">Catatan latihan pribadi</span>
            </span>
          </button>
        </div>
      </header>

      <main className={cn("mx-auto max-w-3xl px-4 pt-5", activeWorkout ? "pb-8" : "pb-24")}>
        {isLockedRoute ? (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>Sesi masih berjalan</CardTitle>
              <CardDescription>
                {activeWorkoutName ? `${activeWorkoutName} sedang aktif. ` : ""}
                Selesaikan atau buang sesi dulu sebelum membuka halaman lain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => navigate("/workout")}>
                Lanjutkan Sesi
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  cancelWorkout();
                  navigate("/");
                }}
              >
                <Trash2 className="h-4 w-4" />
                Buang Sesi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/select" element={<SelectWorkoutPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        )}
      </main>

      {!activeWorkout ? (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto grid max-w-3xl grid-cols-3 px-3 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground",
                    isActive && "bg-secondary text-foreground",
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
