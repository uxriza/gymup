import { lazy, Suspense, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Activity, Dumbbell, History, ListChecks, Loader2, Lock, LogOut, Trash2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  { to: "/", label: "Latihan", icon: Dumbbell },
  { to: "/history", label: "Riwayat", icon: History },
  { to: "/setup", label: "Gerakan", icon: ListChecks },
];

const HomePage = lazy(() => import("@/pages/home").then((module) => ({ default: module.HomePage })));
const SelectWorkoutPage = lazy(() => import("@/pages/select-workout").then((module) => ({ default: module.SelectWorkoutPage })));
const WorkoutPage = lazy(() => import("@/pages/workout").then((module) => ({ default: module.WorkoutPage })));
const HistoryPage = lazy(() => import("@/pages/history").then((module) => ({ default: module.HistoryPage })));
const SetupPage = lazy(() => import("@/pages/setup").then((module) => ({ default: module.SetupPage })));
const AuthPage = lazy(() => import("@/pages/auth").then((module) => ({ default: module.AuthPage })));
const VerifiedPage = lazy(() => import("@/pages/verified").then((module) => ({ default: module.VerifiedPage })));

const PageLoader = () => (
  <div className="flex min-h-[45vh] items-center justify-center">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authEnabled, loading, user, displayName, updateName, signOut } = useAuth();
  const { activeWorkout, workouts, cancelWorkout } = useGymStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
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

  if (authEnabled && location.pathname === "/verified") {
    return (
      <Suspense fallback={<PageLoader />}>
        <VerifiedPage />
      </Suspense>
    );
  }

  if (authEnabled && !user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-gym-background" aria-hidden="true" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
          <button type="button" className="flex items-center gap-2 text-left" onClick={() => navigate(activeWorkout ? "/workout" : "/")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#ff922e_0%,#ff6a18_62%,#ffa24a_100%)] text-primary-foreground shadow-[0_0_22px_rgb(255_106_24/0.24)]">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block max-w-40 truncate text-xs text-muted-foreground">
                Catatan latihan pribadi
              </span>
            </span>
          </button>
          {authEnabled ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="h-10 px-3"
                aria-label="Ubah nama"
                onClick={() => {
                  setProfileName(displayName);
                  setProfileError("");
                  setProfileOpen(true);
                }}
              >
                <UserRound className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Keluar akun"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main className={cn("relative mx-auto max-w-[480px] px-4 pt-5", showBottomNav ? "pb-24" : "pb-8")}>
        <div key={location.pathname} className="animate-page-transition">
          <Suspense fallback={<PageLoader />}>
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
            <Route path="/verified" element={<VerifiedPage />} />
          </Routes>
        )}
          </Suspense>
        </div>
      </main>

      {showBottomNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background">
          <div className="mx-auto grid max-w-[480px] grid-cols-3 px-3 pb-[max(34px,env(safe-area-inset-bottom))] pt-2">
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

      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) {
            setProfileError("");
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Ubah nama</DialogTitle>
            <DialogDescription>
              Nama ini dipakai untuk sapaan di GymUp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Email akun</p>
              <p className="mt-1 truncate text-sm font-medium">{user?.email ?? "-"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama</Label>
              <Input
                id="profile-name"
                className="h-12"
                value={profileName}
                placeholder="Nama kamu"
                aria-invalid={Boolean(profileError)}
                onChange={(event) => {
                  setProfileName(event.target.value);
                  setProfileError("");
                }}
              />
            </div>
            {profileError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm leading-5 text-destructive">{profileError}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Button className="min-h-12 w-full" variant="outline" onClick={() => setProfileOpen(false)}>
                Batal
              </Button>
              <Button
                className="min-h-12 w-full"
                disabled={profileSaving}
                onClick={async () => {
                  const trimmedName = profileName.trim();
                  if (trimmedName.length < 2) {
                    setProfileError("Nama minimal 2 karakter");
                    return;
                  }

                  setProfileSaving(true);
                  setProfileError("");
                  try {
                    await updateName(trimmedName);
                    setProfileName(trimmedName);
                    setProfileOpen(false);
                  } catch {
                    setProfileError("Nama belum bisa diperbarui. Coba lagi sebentar");
                  } finally {
                    setProfileSaving(false);
                  }
                }}
              >
                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
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
