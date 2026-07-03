import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, History, ListChecks, Lock, LogOut, Menu, Trash2, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/store/gym-store";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";

const HomePage = lazy(() => import("@/pages/home").then((module) => ({ default: module.HomePage })));
const SelectWorkoutPage = lazy(() => import("@/pages/select-workout").then((module) => ({ default: module.SelectWorkoutPage })));
const WorkoutPage = lazy(() => import("@/pages/workout").then((module) => ({ default: module.WorkoutPage })));
const HistoryPage = lazy(() => import("@/pages/history").then((module) => ({ default: module.HistoryPage })));
const SetupPage = lazy(() => import("@/pages/setup").then((module) => ({ default: module.SetupPage })));
const ProfilePage = lazy(() => import("@/pages/profile").then((module) => ({ default: module.ProfilePage })));
const AuthPage = lazy(() => import("@/pages/auth").then((module) => ({ default: module.AuthPage })));
const VerifiedPage = lazy(() => import("@/pages/verified").then((module) => ({ default: module.VerifiedPage })));
const AdminPage = lazy(() => import("@/pages/admin").then((module) => ({ default: module.AdminPage })));

const PageLoader = () => (
  <div className="space-y-7 pb-16">
    <section className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
    </section>

    <section className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-card/80 p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-44 max-w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full bg-white/[0.06]" />
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-xl border border-border/70 bg-card/70 p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-7 w-11" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, dateLocale } = useI18n();
  const { toast } = useToast();
  const { authEnabled, loading, user, signOut } = useAuth();
  const { activeWorkout, workouts, cancelWorkout, resetLocalState } = useGymStore();
  const [now, setNow] = useState(() => new Date());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeWorkoutName = workouts.find((workout) => workout.id === activeWorkout?.workoutId)?.name;
  const isAdminRoute = location.pathname === "/admin";
  const isLockedRoute = Boolean(activeWorkout && location.pathname !== "/workout");
  const showBottomNav = !activeWorkout && !["/select", "/admin"].includes(location.pathname);
  const navItems = language === "en"
    ? [
        { to: "/", label: "Train", icon: Dumbbell },
        { to: "/history", label: "History", icon: History },
        { to: "/setup", label: "Exercises", icon: ListChecks },
        { to: "/profile", label: "Profile", icon: UserRound },
      ]
    : [
        { to: "/", label: "Latihan", icon: Dumbbell },
        { to: "/history", label: "Riwayat", icon: History },
        { to: "/setup", label: "Gerakan", icon: ListChecks },
        { to: "/profile", label: "Profil", icon: UserRound },
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
        menuAria: "Open menu",
        menuTitle: "Menu",
        menuDescription: "Language and account options",
        languageLabel: "Language",
        accountLabel: "Account",
        profilePage: "Profile",
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
        menuAria: "Buka menu",
        menuTitle: "Menu",
        menuDescription: "Atur bahasa dan opsi akun",
        languageLabel: "Bahasa",
        accountLabel: "Akun",
        profilePage: "Profil",
      };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  if (authEnabled && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <main className="relative mx-auto w-full max-w-[480px] px-4 pt-5">
          <PageLoader />
        </main>
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

      {authEnabled && menuOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[1px]"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-background">
        <div
          ref={menuRef}
          className={cn(
            "relative mx-auto px-4 py-3",
            isAdminRoute ? "max-w-7xl sm:px-6 lg:px-8" : "max-w-[480px]",
          )}
        >
          <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 text-left" onClick={() => navigate(activeWorkout ? "/workout" : "/")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-secondary shadow-[0_0_22px_rgb(255_106_24/0.16)]">
              <img src="/pwa-icon.svg" alt="GymUp" className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block max-w-40 truncate text-xs text-muted-foreground">
                {copy.tagline}
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {!isAdminRoute ? (
              <span className="rounded-md border border-border/70 bg-card/70 px-2.5 py-1 text-[0.68rem] font-medium uppercase leading-none text-muted-foreground">
                {format(now, "EEE, d MMM · HH:mm", { locale: dateLocale })}
              </span>
            ) : null}
          {authEnabled ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={copy.menuAria}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          ) : null}
          </div>
          </div>
          {authEnabled && menuOpen ? (
            <div className="absolute left-4 right-4 top-[calc(100%-2px)] z-40 rounded-b-lg border border-t-0 border-border bg-card p-3 shadow-[0_18px_44px_rgb(0_0_0/0.32)]">
              <div className="space-y-3">
                <div className="space-y-2 px-1 pt-1">
                  <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">{copy.languageLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={language === "id" ? "secondary" : "outline"}
                      className="h-10 w-full"
                      onClick={() => setLanguage("id")}
                    >
                      ID
                    </Button>
                    <Button
                      variant={language === "en" ? "secondary" : "outline"}
                      className="h-10 w-full"
                      onClick={() => setLanguage("en")}
                    >
                      EN
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 border-t border-border pt-3">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    {copy.profilePage}
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    onClick={() => {
                      setMenuOpen(false);
                      setLogoutOpen(true);
                    }}
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    {copy.logoutAction}
                  </button>
                </div>
              </div>
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
        <div key={location.pathname}>
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/verified" element={<VerifiedPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        )}
          </Suspense>
        </div>
      </main>

      {showBottomNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background">
          <div
            className="mx-auto grid max-w-[480px] items-center px-4 pb-[max(28px,env(safe-area-inset-bottom))] pt-3"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "mx-auto inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md px-4 text-xs font-medium text-muted-foreground transition-all",
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
