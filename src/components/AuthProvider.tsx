// src/components/AuthProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, SupabaseClient } from "@supabase/supabase-js";

type Profile = {
  full_name: string | null;
  role: string | null;
};

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
  profile: Profile | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", userId)
        .single();
      setProfile(data as Profile | null);
    };

    const getCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    };
    getCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase, user, profile }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside AuthProvider");
  }
  return context;
};
