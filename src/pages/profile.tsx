import { useMemo, useState } from "react";
import { LogOut, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { hasMeaningfulSessionProgress } from "@/lib/session-utils";
import { useGymStore } from "@/store/gym-store";
import { useToast } from "@/components/ui/toast";

export function ProfilePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useI18n();
  const { toast } = useToast();
  const { authEnabled, user, displayName, updateName, signOut } = useAuth();
  const { sessions, workouts, exercises, resetLocalState } = useGymStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileName, setProfileName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const meaningfulSessionCount = useMemo(() => sessions.filter(hasMeaningfulSessionProgress).length, [sessions]);

  const copy = language === "en"
    ? {
        title: "Profile",
        description: authEnabled ? "Manage your account, language, and app preferences" : "Manage your language and local app preferences",
        accountSection: "Account",
        preferencesSection: "Preferences",
        summarySection: "Overview",
        accountEmail: "Account email",
        accountName: "Display name",
        guestMode: "Local mode",
        guestDescription: "Account sync is not active in this build yet",
        editNameTitle: "Edit name",
        editNameDescription: "This name is used in your GymUp greeting",
        editNameAction: "Edit name",
        languageLabel: "Language",
        yourName: "Your name",
        invalidName: "Name must be at least 2 characters",
        cancel: "Cancel",
        save: "Save",
        sessions: "Sessions",
        workouts: "Programs",
        movements: "Exercises",
        signOut: "Sign out",
        logoutTitle: "Sign out?",
        logoutDescription: "Saved workout data stays safe. You can sign back in anytime.",
        loggedOutTitle: "Signed out",
        loggedOutDescription: "Local data on this device has been cleared",
        logoutFailedTitle: "Unable to sign out",
        logoutFailedDescription: "Try again shortly",
        nameSavedTitle: "Name updated",
        nameSavedDescription: "Your in-app greeting has been refreshed",
        nameFailed: "Name could not be updated yet. Try again shortly",
      }
    : {
        title: "Profil",
        description: authEnabled ? "Atur akun, bahasa, dan preferensi aplikasi" : "Atur bahasa dan preferensi aplikasi lokal",
        accountSection: "Akun",
        preferencesSection: "Preferensi",
        summarySection: "Ringkasan",
        accountEmail: "Email akun",
        accountName: "Nama tampilan",
        guestMode: "Mode lokal",
        guestDescription: "Sinkronisasi akun belum aktif di build ini",
        editNameTitle: "Ubah nama",
        editNameDescription: "Nama ini dipakai untuk sapaan di GymUp.",
        editNameAction: "Ubah nama",
        languageLabel: "Bahasa",
        yourName: "Nama kamu",
        invalidName: "Nama minimal 2 karakter",
        cancel: "Batal",
        save: "Simpan",
        sessions: "Sesi",
        workouts: "Program",
        movements: "Gerakan",
        signOut: "Keluar",
        logoutTitle: "Keluar dari akun?",
        logoutDescription: "Data latihan yang sudah tersimpan tetap aman. Kamu perlu masuk lagi untuk melanjutkan sinkronisasi.",
        loggedOutTitle: "Berhasil keluar",
        loggedOutDescription: "Data lokal di perangkat ini sudah dibersihkan",
        logoutFailedTitle: "Belum bisa keluar",
        logoutFailedDescription: "Coba lagi sebentar",
        nameSavedTitle: "Nama berhasil diubah",
        nameSavedDescription: "Sapaan di aplikasi sudah diperbarui",
        nameFailed: "Nama belum bisa diperbarui. Coba lagi sebentar",
      };

  return (
    <div className="space-y-7 pb-20">
      <section className="space-y-2">
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-description">{copy.description}</p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{copy.accountSection}</h2>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{displayName || copy.guestMode}</p>
                <p className="text-sm text-muted-foreground">{authEnabled ? user?.email ?? "-" : copy.guestDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-secondary/35 p-3">
                <p className="text-xs text-muted-foreground">{copy.accountName}</p>
                <p className="mt-1 truncate text-sm font-medium">{displayName || "-"}</p>
              </div>
              <div className="rounded-md border border-border bg-secondary/35 p-3">
                <p className="text-xs text-muted-foreground">{copy.accountEmail}</p>
                <p className="mt-1 truncate text-sm font-medium">{user?.email ?? "-"}</p>
              </div>
            </div>

            {authEnabled ? (
              <div className="grid grid-cols-2 gap-3">
                <Button className="min-h-12 w-full" variant="outline" onClick={() => {
                  setProfileName(displayName);
                  setProfileError("");
                  setProfileOpen(true);
                }}>
                  {copy.editNameAction}
                </Button>
                <Button className="min-h-12 w-full" variant="secondary" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="h-4 w-4" />
                  {copy.signOut}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{copy.preferencesSection}</h2>
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium text-foreground">{copy.languageLabel}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={language === "id" ? "secondary" : "outline"}
                className="h-11 w-full"
                onClick={() => setLanguage("id")}
              >
                ID
              </Button>
              <Button
                variant={language === "en" ? "secondary" : "outline"}
                className="h-11 w-full"
                onClick={() => setLanguage("en")}
              >
                EN
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">{copy.summarySection}</h2>
        <div className="metric-surface grid grid-cols-3 divide-x divide-border/80 overflow-hidden">
          <div className="flex min-h-[92px] flex-col justify-between p-4">
            <p className="text-[11px] uppercase leading-4 text-muted-foreground">{copy.sessions}</p>
            <p className="text-2xl font-bold">{meaningfulSessionCount}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between p-4">
            <p className="text-[11px] uppercase leading-4 text-muted-foreground">{copy.workouts}</p>
            <p className="text-2xl font-bold">{workouts.length}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between p-4">
            <p className="text-[11px] uppercase leading-4 text-muted-foreground">{copy.movements}</p>
            <p className="text-2xl font-bold">{exercises.length}</p>
          </div>
        </div>
      </section>

      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) setProfileError("");
        }}
      >
        <DialogContent className="w-[calc(100vw-32px)] max-w-sm rounded-lg p-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>{copy.editNameTitle}</DialogTitle>
            <DialogDescription>{copy.editNameDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{copy.accountName}</Label>
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
                {profileSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
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
              {copy.signOut}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
