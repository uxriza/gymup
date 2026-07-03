import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { upsertAnalyticsProfile } from "@/lib/analytics-sync";
import { setSentryUser } from "@/lib/sentry";

type AuthContextValue = {
  authEnabled: boolean;
  loading: boolean;
  signingOut: boolean;
  user: User | null;
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getDisplayName = (user: User | null) => {
  if (!user) return "";
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0] || "Kamu";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const supabaseClient = supabase;

    void supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setSentryUser(user?.id ?? null);
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authEnabled: isSupabaseConfigured,
      loading,
      signingOut,
      user,
      displayName: getDisplayName(user),
      signIn: async (email, password) => {
        if (!supabase) return;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, name) => {
        if (!supabase) return;
        const trimmedName = name.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/verified`,
            data: {
              full_name: trimmedName,
              name: trimmedName,
            },
          },
        });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) {
          throw new Error("already registered");
        }
      },
      updateName: async (name) => {
        if (!supabase) return;
        const trimmedName = name.trim();
        const { data, error } = await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            name: trimmedName,
            display_name: trimmedName,
          },
        });
        if (error) throw error;
        setUser(data.user);
        await upsertAnalyticsProfile(data.user);
      },
      signOut: async () => {
        if (!supabase) return;
        setSigningOut(true);
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        } finally {
          setSigningOut(false);
        }
      },
    }),
    [loading, signingOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
