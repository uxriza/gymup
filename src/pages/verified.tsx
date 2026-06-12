import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

const getVerificationError = (search: string, hash: string) => {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  return searchParams.get("error_description") || hashParams.get("error_description") || "";
};

export function VerifiedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, user } = useAuth();
  const verificationError = useMemo(
    () => getVerificationError(location.search, location.hash),
    [location.hash, location.search],
  );

  const title = verificationError ? "Verifikasi belum berhasil" : user ? "Email berhasil diverifikasi" : "Cek status akun";
  const description = verificationError
    ? "Link verifikasi tidak bisa dipakai. Coba daftar ulang atau minta link baru dari halaman masuk"
    : user
      ? "Akun kamu sudah aktif dan siap dipakai untuk menyimpan progres latihan"
      : "Email sudah dibuka. Silakan masuk untuk melanjutkan ke GymUp";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-gym-background" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/25 bg-primary/12 text-primary">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : verificationError ? (
                <MailCheck className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-1.5">
              <CardTitle className="page-title">{loading ? "Memeriksa akun" : title}</CardTitle>
              <CardDescription className="page-description">
                {loading ? "Tunggu sebentar, kami sedang mengecek status verifikasi email kamu" : description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-5 pt-0">
            {!loading && user ? (
              <Button className="min-h-12 w-full" size="lg" onClick={() => navigate("/")}>
                <ArrowRight className="h-4 w-4" />
                Buka GymUp
              </Button>
            ) : null}

            {!loading && !user ? (
              <Button className="min-h-12 w-full" size="lg" onClick={() => navigate("/")}>
                <ArrowRight className="h-4 w-4" />
                Masuk
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
