import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth-provider";
import { useLandingCopy } from "@/lib/landing-copy";

export function LandingStartLink({ className = "" }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useLandingCopy();
  return <Link className={`landing-cta ${className}`} to={user ? "/app" : "/app?tab=register"} aria-busy={loading || undefined}>
    {t(user ? "Buka GymUp" : "Coba gratis")}
  </Link>;
}
