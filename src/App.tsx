import { useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Activity, Dumbbell, History, ListChecks, Loader2, Lock, LogOut, Trash2 } from "lucide-react";
import { HomePage } from "@/pages/home";
import { SelectWorkoutPage } from "@/pages/select-workout";
import { WorkoutPage } from "@/pages/workout";
import { HistoryPage } from "@/pages/history";
import { SetupPage } from "@/pages/setup";
import { AuthPage } from "@/pages/auth";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const navItems = [
  { to: "/", label: "Latihan", icon: Dumbbell },
  { to: "/history", label: "Riwayat", icon: History },
  { to: "/setup", label: "Gerakan", icon: ListChecks },
];

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authEnabled, loading, user, signOut } = useAuth();
  const { activeWorkout, workouts, cancelWorkout } = useGymStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const activeWorkoutName = workouts.find((workout) => workout.id === activeWorkout?.workoutId)?.name;
  const isLockedRoute = Boolean(activeWorkout && location.pathname !== "/workout");
  const showBottomNav = !activeWorkout && location.pathname !== "/select";

  if (authEnabled && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (authEnabled && !user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-gym-background" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button type="button" className="flex items-center gap-2 text-left" onClick={() => navigate(activeWorkout ? "/workout" : "/")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#ff922e_0%,#ff6a18_62%,#ffa24a_100%)] text-primary-foreground shadow-[0_0_22px_rgb(255_106_24/0.24)]">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block text-xs text-muted-foreground">Catatan latihan pribadi</span>
            </span>
          </button>
          {authEnabled ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keluar akun"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </header>

      <main className={cn("relative mx-auto max-w-3xl px-4 pt-5", showBottomNav ? "pb-24" : "pb-8")}>
        <div key={location.pathname} className="animate-page-transition">
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
                Lanjutkan sesi
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
                Buang sesi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/select" element={<SelectWorkoutPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/summary" element={<Navigate to="/history" replace />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        )}
        </div>
      </main>

      {showBottomNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-background/82 backdrop-blur-xl">
          <div className="mx-auto grid max-w-3xl grid-cols-3 px-3 pb-[max(34px,env(safe-area-inset-bottom))] pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground transition-all",
                    isActive && "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.24)]",
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

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5 sm:p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Keluar dari akun?</DialogTitle>
            <DialogDescription>
              Data latihan yang sudah tersimpan tetap aman. Kamu perlu masuk lagi untuk melanjutkan sinkronisasi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button className="min-h-12 w-full" variant="outline" onClick={() => setLogoutOpen(false)}>
              Batal
            </Button>
            <Button
              className="min-h-12 w-full"
              onClick={() => {
                setLogoutOpen(false);
                void signOut();
                navigate("/");
              }}
            >
              Keluar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
