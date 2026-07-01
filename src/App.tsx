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
import { useI18n } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const HomePage = lazy(() => import("@/pages/home").then((module) => ({ default: module.HomePage })));
const SelectWorkoutPage = lazy(() => import("@/pages/select-workout").then((module) => ({ default: module.SelectWorkoutPage })));
const WorkoutPage = lazy(() => import("@/pages/workout").then((module) => ({ default: module.WorkoutPage })));
const HistoryPage = lazy(() => import("@/pages/history").then((module) => ({ default: module.HistoryPage })));
const SetupPage = lazy(() => import("@/pages/setup").then((module) => ({ default: module.SetupPage })));
const AuthPage = lazy(() => import("@/pages/auth").then((module) => ({ default: module.AuthPage })));
const VerifiedPage = lazy(() => import("@/pages/verified").then((module) => ({ default: module.VerifiedPage })));
const AdminPage = lazy(() => import("@/pages/admin").then((module) => ({ default: module.AdminPage })));

const PageLoader = () => (
  <div className="flex min-h-[45vh] items-center justify-center">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useI18n();
  const { toast } = useToast();
  const { authEnabled, loading, user, displayName, updateName, signOut } = useAuth();
  const { activeWorkout, workouts, cancelWorkout, resetLocalState } = useGymStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const activeWorkoutName = workouts.find((workout) => workout.id === activeWorkout?.workoutId)?.name;
  const isAdminRoute = location.pathname === "/admin";
  const isLockedRoute = Boolean(activeWorkout && location.pathname !== "/workout");
  const showBottomNav = !activeWorkout && !["/select", "/admin"].includes(location.pathname);
  const navItems = language === "en"
    ? [
        { to: "/", label: "Train", icon: Dumbbell },
        { to: "/history", label: "History", icon: History },
        { to: "/setup", label: "Exercises", icon: ListChecks },
      ]
    : [
        { to: "/", label: "Latihan", icon: Dumbbell },
        { to: "/history", label: "Riwayat", icon: History },
        { to: "/setup", label: "Gerakan", icon: ListChecks },
      ];
  const copy = language === "en"
    ? {
        tagline: "Personal workout tracker",
        editNameAria: "Edit name",
        logoutAria: "Sign out",
        sessionRunning: "Session in progress",
        sessionRunningDescription: `${activeWorkoutName ? `${activeWorkoutName} is still active. ` : ""}Finish or discard it before opening another page.`,
        continueSession: "Continue session",
        discardSession: "Discard session",
        discardedTitle: "Session discarded",
        discardedDescription: "The active session was not saved",
        editNameTitle: "Edit name",
        editNameDescription: "This name is used in your GymUp greeting",
        accountEmail: "Account email",
        name: "Name",
        yourName: "Your name",
        invalidName: "Name must be at least 2 characters",
        cancel: "Cancel",
        save: "Save",
        nameSavedTitle: "Name updated",
        nameSavedDescription: "Your in-app greeting has been refreshed",
        nameFailed: "Name could not be updated yet. Try again shortly",
        logoutTitle: "Sign out?",
        logoutDescription: "Saved workout data stays safe. You can sign back in anytime.",
        loggedOutTitle: "Signed out",
        loggedOutDescription: "Local data on this device has been cleared",
        logoutFailedTitle: "Unable to sign out",
        logoutFailedDescription: "Try again shortly",
        logoutAction: "Sign out",
      }
    : {
        tagline: "Catatan latihan pribadi",
        editNameAria: "Ubah nama",
        logoutAria: "Keluar akun",
        sessionRunning: "Sesi masih berjalan",
        sessionRunningDescription: `${activeWorkoutName ? `${activeWorkoutName} sedang aktif. ` : ""}Selesaikan atau buang sesi dulu sebelum membuka halaman lain.`,
        continueSession: "Lanjutkan sesi",
        discardSession: "Buang sesi",
        discardedTitle: "Sesi dibuang",
        discardedDescription: "Sesi aktif tidak disimpan",
        editNameTitle: "Ubah nama",
        editNameDescription: "Nama ini dipakai untuk sapaan di GymUp.",
        accountEmail: "Email akun",
        name: "Nama",
        yourName: "Nama kamu",
        invalidName: "Nama minimal 2 karakter",
        cancel: "Batal",
        save: "Simpan",
        nameSavedTitle: "Nama berhasil diubah",
        nameSavedDescription: "Sapaan di aplikasi sudah diperbarui",
        nameFailed: "Nama belum bisa diperbarui. Coba lagi sebentar",
        logoutTitle: "Keluar dari akun?",
        logoutDescription: "Data latihan yang sudah tersimpan tetap aman. Kamu perlu masuk lagi untuk melanjutkan sinkronisasi.",
        loggedOutTitle: "Berhasil keluar",
        loggedOutDescription: "Data lokal di perangkat ini sudah dibersihkan",
        logoutFailedTitle: "Belum bisa keluar",
        logoutFailedDescription: "Coba lagi sebentar",
        logoutAction: "Keluar",
      };

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
        <div className={cn("mx-auto flex items-center justify-between px-4 py-3", isAdminRoute ? "max-w-7xl sm:px-6 lg:px-8" : "max-w-[480px]")}>
          <button type="button" className="flex items-center gap-2 text-left" onClick={() => navigate(activeWorkout ? "/workout" : "/")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#ff922e_0%,#ff6a18_62%,#ffa24a_100%)] text-primary-foreground shadow-[0_0_22px_rgb(255_106_24/0.24)]">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block max-w-40 truncate text-xs text-muted-foreground">
                {copy.tagline}
              </span>
            </span>
          </button>
          {authEnabled ? (
            <div className="flex items-center gap-1">
              <div className="inline-flex h-10 items-center rounded-full border border-border bg-card/80 p-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    language === "id" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => setLanguage("id")}
                  aria-label="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => setLanguage("en")}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
              <Button
                variant="ghost"
                className="h-10 px-3"
                aria-label={copy.editNameAria}
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
                aria-label={copy.logoutAria}
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={cn(
          "relative mx-auto px-4 pt-5",
          isAdminRoute ? "max-w-7xl pb-10 sm:px-6 lg:px-8" : "max-w-[480px]",
          !isAdminRoute && (showBottomNav ? "pb-24" : "pb-8"),
        )}
      >
        <div key={location.pathname} className="animate-page-transition">
          <Suspense fallback={<PageLoader />}>
            {isLockedRoute ? (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle>{copy.sessionRunning}</CardTitle>
              <CardDescription>{copy.sessionRunningDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => navigate("/workout")}>
                {copy.continueSession}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  cancelWorkout();
                  navigate("/");
                  toast({
                    title: copy.discardedTitle,
                    description: copy.discardedDescription,
                    variant: "destructive",
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
                {copy.discardSession}
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
            <Route path="/admin" element={<AdminPage />} />
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
            <DialogTitle>{copy.editNameTitle}</DialogTitle>
            <DialogDescription>{copy.editNameDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">{copy.accountEmail}</p>
              <p className="mt-1 truncate text-sm font-medium">{user?.email ?? "-"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">{copy.name}</Label>
              <Input
                id="profile-name"
                className="h-12"
                value={profileName}
                placeholder={copy.yourName}
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
                {copy.cancel}
              </Button>
              <Button
                className="min-h-12 w-full"
                disabled={profileSaving}
                onClick={async () => {
                  const trimmedName = profileName.trim();
                  if (trimmedName.length < 2) {
                    setProfileError(copy.invalidName);
                    return;
                  }

                  setProfileSaving(true);
                  setProfileError("");
                  try {
                    await updateName(trimmedName);
                    setProfileName(trimmedName);
                    setProfileOpen(false);
                    toast({
                      title: copy.nameSavedTitle,
                      description: copy.nameSavedDescription,
                    });
                  } catch {
                    setProfileError(copy.nameFailed);
                  } finally {
                    setProfileSaving(false);
                  }
                }}
              >
                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {copy.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>{copy.logoutTitle}</DialogTitle>
            <DialogDescription>{copy.logoutDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button className="min-h-12 w-full" variant="outline" onClick={() => setLogoutOpen(false)}>
              {copy.cancel}
            </Button>
            <Button
              className="min-h-12 w-full"
              onClick={async () => {
                setLogoutOpen(false);
                try {
                  await signOut();
                  resetLocalState();
                  navigate("/");
                  toast({
                    title: copy.loggedOutTitle,
                    description: copy.loggedOutDescription,
                    variant: "default",
                  });
                } catch {
                  toast({
                    title: copy.logoutFailedTitle,
                    description: copy.logoutFailedDescription,
                    variant: "destructive",
                  });
                }
              }}
            >
              {copy.logoutAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
