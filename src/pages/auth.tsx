import { FormEvent, useEffect, useState } from "react";
import { Activity, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";

const getAuthErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Email ini sudah terdaftar. Coba masuk dengan akun tersebut.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email belum diverifikasi. Cek inbox kamu dulu, lalu masuk lagi.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }
  if (normalized.includes("invalid login")) return "Email atau password belum sesuai.";
  if (normalized.includes("password")) return "Password minimal 6 karakter.";
  if (normalized.includes("email")) return "Format email belum sesuai.";
  return "Belum bisa memproses akun. Coba lagi sebentar.";
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Isi email dan password dulu.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Masukkan email yang valid.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(normalizedEmail, password);
      } else {
        await signUp(normalizedEmail, password);
        setMessage("Akun berhasil dibuat. Periksa email kamu untuk verifikasi sebelum masuk.");
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError instanceof Error ? authError.message : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-gym-background" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#ff922e_0%,#ff6a18_62%,#ffa24a_100%)] text-primary-foreground shadow-[0_0_22px_rgb(255_106_24/0.24)]">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block text-xs text-muted-foreground">Catatan latihan pribadi</span>
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center px-4 py-6">
        <Card className="border-primary/15 bg-card/90">
          <CardHeader className="space-y-4 p-5 pb-4">
            <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")}>
              <TabsList className="grid h-11 w-full grid-cols-2">
                <TabsTrigger className="h-9" value="login">Masuk</TabsTrigger>
                <TabsTrigger className="h-9" value="register">Daftar</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-1.5">
              <CardTitle className="font-display text-2xl font-bold uppercase leading-7">
                {mode === "login" ? "Masuk akun" : "Buat akun"}
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                {mode === "login"
                  ? "Lanjutkan latihan dan simpan progres ke akun kamu."
                  : "Buat akun untuk menyimpan riwayat latihan pribadi."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  className="h-12"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  aria-invalid={Boolean(error && !isValidEmail(email.trim().toLowerCase()))}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    className="h-12 pr-11"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    aria-invalid={Boolean(error && password.length > 0 && password.length < 6)}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                      setMessage("");
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {mode === "register" ? (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi password</Label>
                  <Input
                    id="confirm-password"
                    className="h-12"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    aria-invalid={Boolean(error && confirmPassword.length > 0 && password !== confirmPassword)}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                      setMessage("");
                    }}
                  />
                </div>
              ) : null}

              {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm leading-5 text-destructive">{error}</p> : null}
              {message ? <p className="rounded-md border border-primary/25 bg-primary/10 p-3 text-sm leading-5 text-primary">{message}</p> : null}

              <Button className="min-h-12 w-full" size="lg" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? (mode === "login" ? "Memproses..." : "Membuat akun...") : mode === "login" ? "Masuk" : "Daftar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
