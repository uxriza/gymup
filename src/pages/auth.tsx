import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getAuthErrorMessage = (message: string, language: "id" | "en") => {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return language === "en"
      ? "This email is already registered. Try signing in with that account"
      : "Email ini sudah terdaftar. Coba masuk dengan akun tersebut";
  }
  if (normalized.includes("email not confirmed")) {
    return language === "en"
      ? "Your email is not verified yet. Check your inbox, then sign in again"
      : "Email belum diverifikasi. Cek inbox kamu dulu, lalu masuk lagi";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return language === "en"
      ? "Too many attempts. Wait a moment, then try again"
      : "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi";
  }
  if (normalized.includes("invalid login")) return language === "en" ? "Email or password is incorrect" : "Email atau password belum sesuai";
  if (normalized.includes("password")) return language === "en" ? "Password must be at least 6 characters" : "Password minimal 6 karakter";
  if (normalized.includes("email")) return language === "en" ? "Email format is not valid" : "Format email belum sesuai";
  return language === "en" ? "We could not process this account yet. Try again shortly" : "Belum bisa memproses akun. Coba lagi sebentar";
};

export function AuthPage() {
  const { language } = useI18n();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const copy = language === "en"
    ? {
        tagline: "Personal workout tracker",
        login: "Sign in",
        register: "Create account",
        signInTitle: "Sign in",
        signInDescription: "Continue your workouts and save progress to your account",
        registerTitle: "Create account",
        registerDescription: "Create an account to store your personal workout history",
        checkEmailTitle: "Check your email",
        checkEmailDescription: (value: string) => `Your account was created. Open the verification email we sent to ${value}`,
        checkEmailInfo: "After verifying your email, sign in to GymUp with the same address",
        name: "Name",
        yourName: "Your name",
        email: "Email",
        emailPlaceholder: "name@email.com",
        password: "Password",
        passwordPlaceholder: "At least 6 characters",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "Repeat password",
        hidePassword: "Hide password",
        showPassword: "Show password",
        submitLogin: "Sign in",
        submitRegister: "Create account",
        continueToLogin: "Go to sign in",
        fillName: "Enter your name first",
        invalidName: "Name must be at least 2 characters",
        fillEmailPassword: "Enter your email and password first",
        invalidEmail: "Enter a valid email address",
        invalidPassword: "Password must be at least 6 characters",
        passwordMismatch: "Password confirmation does not match",
      }
    : {
        tagline: "Catatan latihan pribadi",
        login: "Masuk",
        register: "Daftar",
        signInTitle: "Masuk akun",
        signInDescription: "Lanjutkan latihan dan simpan progres ke akun kamu",
        registerTitle: "Buat akun",
        registerDescription: "Buat akun untuk menyimpan riwayat latihan pribadi",
        checkEmailTitle: "Cek email kamu",
        checkEmailDescription: (value: string) => `Akun berhasil dibuat. Buka email verifikasi yang kami kirim ke ${value}`,
        checkEmailInfo: "Setelah verifikasi, masuk kembali ke GymUp dengan email yang sama",
        name: "Nama",
        yourName: "Nama kamu",
        email: "Email",
        emailPlaceholder: "nama@email.com",
        password: "Password",
        passwordPlaceholder: "Minimal 6 karakter",
        confirmPassword: "Konfirmasi password",
        confirmPasswordPlaceholder: "Ulangi password",
        hidePassword: "Sembunyikan password",
        showPassword: "Lihat password",
        submitLogin: "Masuk",
        submitRegister: "Daftar",
        continueToLogin: "Masuk",
        fillName: "Isi nama kamu dulu",
        invalidName: "Nama minimal 2 karakter",
        fillEmailPassword: "Isi email dan password dulu",
        invalidEmail: "Masukkan email yang valid",
        invalidPassword: "Password minimal 6 karakter",
        passwordMismatch: "Konfirmasi password belum sama",
      };

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setRegisteredEmail("");
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setRegisteredEmail("");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (mode === "register" && !normalizedName) {
      setError(copy.fillName);
      return;
    }

    if (mode === "register" && normalizedName.length < 2) {
      setError(copy.invalidName);
      return;
    }

    if (!normalizedEmail || !password) {
      setError(copy.fillEmailPassword);
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(copy.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(copy.invalidPassword);
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(normalizedEmail, password);
      } else {
        await signUp(normalizedEmail, password, normalizedName);
        setRegisteredEmail(normalizedEmail);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError instanceof Error ? authError.message : "", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-gym-background" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-secondary shadow-[0_0_22px_rgb(255_106_24/0.16)]">
              <img src="/pwa-icon.svg" alt="GymUp" className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="font-display block text-base font-bold uppercase tracking-normal">GymUp</span>
              <span className="block text-xs text-muted-foreground">{copy.tagline}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col justify-center px-4 py-6">
        <Card className="border-primary/15 bg-card/90">
          {registeredEmail ? (
            <>
              <CardHeader className="space-y-4 p-5 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/25 bg-primary/12 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="page-title">{copy.checkEmailTitle}</CardTitle>
                  <CardDescription className="page-description">
                    {copy.checkEmailDescription(registeredEmail)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0">
                <div className="rounded-md border border-primary/25 bg-primary/10 p-3 text-sm leading-6 text-primary">
                  {copy.checkEmailInfo}
                </div>
                <Button
                  className="min-h-12 w-full"
                  size="lg"
                  type="button"
                  onClick={() => {
                    setEmail(registeredEmail);
                    setRegisteredEmail("");
                    setMode("login");
                    setError("");
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  {copy.continueToLogin}
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-4 p-5 pb-4">
                <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")}>
                  <TabsList className="grid h-11 w-full grid-cols-2">
                    <TabsTrigger className="h-9" value="login">{copy.login}</TabsTrigger>
                    <TabsTrigger className="h-9" value="register">{copy.register}</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="space-y-1.5">
                  <CardTitle className="page-title">
                    {mode === "login" ? copy.signInTitle : copy.registerTitle}
                  </CardTitle>
                  <CardDescription className="page-description">
                    {mode === "login" ? copy.signInDescription : copy.registerDescription}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {mode === "register" ? (
                    <div className="space-y-2">
                      <Label htmlFor="name">{copy.name}</Label>
                      <Input
                        id="name"
                        className="h-12"
                        type="text"
                        autoComplete="name"
                        placeholder={copy.yourName}
                        value={name}
                        aria-invalid={Boolean(error && name.trim().length > 0 && name.trim().length < 2)}
                        onChange={(event) => {
                          setName(event.target.value);
                          setError("");
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="email">{copy.email}</Label>
                    <Input
                      id="email"
                      className="h-12"
                      type="email"
                      autoComplete="email"
                      placeholder={copy.emailPlaceholder}
                      value={email}
                      aria-invalid={Boolean(error && !isValidEmail(email.trim().toLowerCase()))}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{copy.password}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        className="h-12 pr-11"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        placeholder={copy.passwordPlaceholder}
                        value={password}
                        aria-invalid={Boolean(error && password.length > 0 && password.length < 6)}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError("");
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {mode === "register" ? (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{copy.confirmPassword}</Label>
                      <Input
                        id="confirm-password"
                        className="h-12"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={copy.confirmPasswordPlaceholder}
                        value={confirmPassword}
                        aria-invalid={Boolean(error && confirmPassword.length > 0 && password !== confirmPassword)}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setError("");
                        }}
                      />
                    </div>
                  ) : null}

                  {error ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
                      {error}
                    </p>
                  ) : null}

                  <Button className="min-h-12 w-full" size="lg" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {mode === "login" ? copy.submitLogin : copy.submitRegister}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
