import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Dumbbell, Loader2, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type ProfileRow = {
  user_id: string;
  email: string;
  display_name: string | null;
  last_seen_at: string;
  created_at: string;
};

type WorkoutSessionRow = {
  id: string;
  user_id: string;
  workout_name: string;
  started_at: string;
  duration_minutes: number;
  completed_exercise_count: number;
  total_exercise_count: number;
  total_sets: number;
  total_reps: number;
};

type SessionExerciseRow = {
  session_id: string;
  exercise_name: string;
  category: string | null;
  actual_sets: number;
  actual_reps: number;
  completed: boolean;
};

type AdminData = {
  profiles: ProfileRow[];
  sessions: WorkoutSessionRow[];
  exercises: SessionExerciseRow[];
};

const countBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="metric-surface border-primary/25">
      <CardContent className="relative z-10 space-y-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, dateLocale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminData>({ profiles: [], sessions: [], exercises: [] });
  const copy = language === "en"
    ? {
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: (days: number) => `${days} days ago`,
        admin: "Admin",
        monitoring: "Monitoring",
        internalDashboard: "Internal GymUp dashboard",
        setupIncomplete: "Setup is incomplete",
        accessDenied: "Access denied",
        setupDescription: "The dashboard could not be loaded yet. Make sure the admin schema has been applied in Supabase",
        deniedDescription: "This account is not in the admin allowlist yet. Add the email in Supabase first",
        backToApp: "Back to app",
        totalUsers: "Total users",
        active7Days: "Active in 7 days",
        active30Days: "Active in 30 days",
        totalSessions: "Total sessions",
        trainingMinutes: "Training minutes",
        completedExercises: "Completed exercises",
        activeUsers: "Active users",
        activeUsersDescription: (count: number) => `${count} users active in the last 30 days`,
        noSyncedUsers: "No synced users yet",
        popularPrograms: "Popular programs",
        popularProgramsDescription: "Most frequently completed programs",
        noSessions: "No sessions yet",
        sessionSuffix: "sessions",
        popularExercises: "Popular exercises",
        popularExercisesDescription: "Most frequently completed exercises",
        noCompletedExercises: "No completed exercises yet",
        completedSuffix: "done",
        recentSessions: "Recent sessions",
        recentSessionsDescription: (count: number) => `${count} sessions stored in analytics`,
        userFallback: "User",
        exerciseSuffix: "exercises",
        setSuffix: "sets",
        repSuffix: "reps",
      }
    : {
        today: "Hari ini",
        yesterday: "Kemarin",
        daysAgo: (days: number) => `${days} hari lalu`,
        admin: "Admin",
        monitoring: "Monitoring",
        internalDashboard: "Dashboard internal GymUp",
        setupIncomplete: "Setup belum lengkap",
        accessDenied: "Akses ditolak",
        setupDescription: "Dashboard belum bisa dimuat. Pastikan schema admin sudah dijalankan di Supabase",
        deniedDescription: "Email akun ini belum masuk daftar admin. Tambahkan email ke allowlist lewat Supabase",
        backToApp: "Kembali ke app",
        totalUsers: "Total user",
        active7Days: "Aktif 7 hari",
        active30Days: "Aktif 30 hari",
        totalSessions: "Total sesi",
        trainingMinutes: "Menit latihan",
        completedExercises: "Gerakan selesai",
        activeUsers: "User aktif",
        activeUsersDescription: (count: number) => `${count} user aktif dalam 30 hari terakhir`,
        noSyncedUsers: "Belum ada user yang tersinkron",
        popularPrograms: "Program populer",
        popularProgramsDescription: "Program paling sering diselesaikan",
        noSessions: "Belum ada sesi",
        sessionSuffix: "sesi",
        popularExercises: "Gerakan populer",
        popularExercisesDescription: "Gerakan paling sering selesai",
        noCompletedExercises: "Belum ada gerakan selesai",
        completedSuffix: "selesai",
        recentSessions: "Sesi terbaru",
        recentSessionsDescription: (count: number) => `${count} sesi tersimpan di analytics`,
        userFallback: "User",
        exerciseSuffix: "gerakan",
        setSuffix: "set",
        repSuffix: "rep",
      };

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const supabaseClient = supabase;
    let cancelled = false;

    const loadAdminData = async () => {
      setLoading(true);
      setError("");

      try {
        const adminResult = await supabaseClient.rpc("is_admin");
        if (adminResult.error) throw adminResult.error;
        if (!adminResult.data) {
          if (!cancelled) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const [profilesResult, sessionsResult, exercisesResult] = await Promise.all([
          supabaseClient
            .from("profiles")
            .select("user_id,email,display_name,last_seen_at,created_at")
            .order("last_seen_at", { ascending: false }),
          supabaseClient
            .from("workout_sessions")
            .select("id,user_id,workout_name,started_at,duration_minutes,completed_exercise_count,total_exercise_count,total_sets,total_reps")
            .order("started_at", { ascending: false }),
          supabaseClient
            .from("session_exercises")
            .select("session_id,exercise_name,category,actual_sets,actual_reps,completed"),
        ]);

        if (profilesResult.error) throw profilesResult.error;
        if (sessionsResult.error) throw sessionsResult.error;
        if (exercisesResult.error) throw exercisesResult.error;

        if (!cancelled) {
          setIsAdmin(true);
          setData({
            profiles: (profilesResult.data ?? []) as ProfileRow[],
            sessions: (sessionsResult.data ?? []) as WorkoutSessionRow[],
            exercises: (exercisesResult.data ?? []) as SessionExerciseRow[],
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(copy.setupDescription);
          setLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const thirtyDaysAgo = subDays(new Date(), 30);
    const active7 = data.profiles.filter((profile) => new Date(profile.last_seen_at) >= sevenDaysAgo).length;
    const active30 = data.profiles.filter((profile) => new Date(profile.last_seen_at) >= thirtyDaysAgo).length;
    const totalMinutes = data.sessions.reduce((total, session) => total + session.duration_minutes, 0);
    const completedExercises = data.exercises.filter((exercise) => exercise.completed);
    const popularPrograms = countBy(data.sessions, (session) => session.workout_name).slice(0, 5);
    const popularExercises = countBy(completedExercises, (exercise) => exercise.exercise_name).slice(0, 5);
    const profileByUserId = new Map(data.profiles.map((profile) => [profile.user_id, profile]));

    return {
      active7,
      active30,
      totalMinutes,
      completedExercises: completedExercises.length,
      popularPrograms,
      popularExercises,
      profileByUserId,
      recentSessions: data.sessions.slice(0, 6),
    };
  }, [data]);

  const formatLastSeen = (value: string) => {
    const date = new Date(value);
    const days = differenceInCalendarDays(new Date(), date);
    if (days === 0) return copy.today;
    if (days === 1) return copy.yesterday;
    return copy.daysAgo(days);
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <section className="space-y-2">
          <Badge className="bg-primary/15 text-primary">
            <ShieldCheck className="mr-1 h-3 w-3" />
            {copy.admin}
          </Badge>
          <h1 className="page-title">{copy.monitoring}</h1>
          <p className="page-description">{copy.internalDashboard}</p>
        </section>

        <Card className="border-destructive/35 bg-destructive/5">
          <CardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle>{error ? copy.setupIncomplete : copy.accessDenied}</CardTitle>
            <CardDescription>
              {error || copy.deniedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="min-h-12 w-full" variant="secondary" onClick={() => navigate("/")}>
              {copy.backToApp}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="bg-primary/15 text-primary">
            <ShieldCheck className="mr-1 h-3 w-3" />
            {copy.admin}
          </Badge>
          <h1 className="page-title">{copy.monitoring}</h1>
          <p className="page-description max-w-2xl">
            {copy.internalDashboard}
          </p>
        </div>
        <Button variant="secondary" className="w-full lg:w-auto" onClick={() => navigate("/")}>
          {copy.backToApp}
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={UsersRound} label={copy.totalUsers} value={data.profiles.length} />
        <MetricCard icon={CalendarDays} label={copy.active7Days} value={stats.active7} />
        <MetricCard icon={UsersRound} label={copy.active30Days} value={stats.active30} />
        <MetricCard icon={Dumbbell} label={copy.totalSessions} value={data.sessions.length} />
        <MetricCard icon={Clock3} label={copy.trainingMinutes} value={stats.totalMinutes} />
        <MetricCard icon={CheckCircle2} label={copy.completedExercises} value={stats.completedExercises} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <Card className="border-primary/25 bg-[linear-gradient(135deg,rgb(13_14_16/0.98)_0%,rgb(18_20_24/0.96)_64%,rgb(255_122_26/0.045)_100%)]">
          <CardHeader>
            <CardTitle>{copy.activeUsers}</CardTitle>
            <CardDescription>{copy.activeUsersDescription(stats.active30)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.profiles.slice(0, 7).map((profile) => (
              <div key={profile.user_id} className="surface-list-item flex items-center justify-between gap-3 border-border/90 bg-background/42 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{profile.display_name || profile.email.split("@")[0]}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-muted-foreground">
                  {formatLastSeen(profile.last_seen_at)}
                </Badge>
              </div>
            ))}
            {data.profiles.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noSyncedUsers}</p> : null}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{copy.popularPrograms}</CardTitle>
            <CardDescription>{copy.popularProgramsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.popularPrograms.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-md border border-border/80 bg-secondary/40 p-3">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <Badge className="bg-primary/15 text-primary">{item.count} {copy.sessionSuffix}</Badge>
              </div>
            ))}
            {stats.popularPrograms.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noSessions}</p> : null}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{copy.popularExercises}</CardTitle>
            <CardDescription>{copy.popularExercisesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.popularExercises.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-md border border-border/80 bg-secondary/40 p-3">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <Badge className="bg-primary/15 text-primary">{item.count} {copy.completedSuffix}</Badge>
              </div>
            ))}
            {stats.popularExercises.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noCompletedExercises}</p> : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{copy.recentSessions}</CardTitle>
          <CardDescription>{copy.recentSessionsDescription(data.sessions.length)}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {stats.recentSessions.map((session) => {
            const profile = stats.profileByUserId.get(session.user_id);
            return (
              <div key={session.id} className="surface-list-item border-border/90 bg-background/42 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.workout_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile?.display_name || profile?.email || copy.userFallback} · {format(new Date(session.started_at), "d MMM, HH:mm", { locale: dateLocale })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-muted-foreground">
                    {session.duration_minutes}m
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-secondary/50 px-2 py-1">{session.completed_exercise_count}/{session.total_exercise_count} {copy.exerciseSuffix}</span>
                  <span className="rounded-md bg-secondary/50 px-2 py-1">{session.total_sets} {copy.setSuffix}</span>
                  <span className="rounded-md bg-secondary/50 px-2 py-1">{session.total_reps} {copy.repSuffix}</span>
                </div>
              </div>
            );
          })}
          {stats.recentSessions.length === 0 ? <p className="text-sm text-muted-foreground">{copy.noSessions}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
