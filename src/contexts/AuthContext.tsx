import React, { createContext, useEffect, useState } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import useApiClient from "../hooks/useApiClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithFacebook: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useApiClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      // Update state immediately without blocking
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle user upsert asynchronously without blocking auth state
      if (session?.user) {
        api("/webhook", "POST", {
          userId: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name,
          avatarUrl: session.user.user_metadata?.avatar_url,
          username: session.user.email?.split("@")[0],
          firstName: session.user.user_metadata?.full_name?.split(" ")[0],
          lastName: session.user.user_metadata?.full_name?.split(" ")[1],
          phone: session.user.user_metadata?.phone,
          provider: session.user.app_metadata?.provider,
          providerId: session.user.user_metadata?.provider_id,
          emailVerified: session.user.user_metadata?.email_verified,
          phoneVerified: session.user.user_metadata?.phone_verified,
          isActive: true,
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at,
        }).then((response) => {
          if (!response.success) {
            console.error("Failed to upsert user:", response.error);
          }
        });
      }
    });

    // No additional setup needed for in-app OAuth
  }, []);

  const signInWithGoogle = async () => {
    try {

      // Use Supabase's built-in OAuth method in the same window
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: null };
    }
  };

  const signInWithFacebook = async () => {
    try {

      // Use Supabase's built-in OAuth method in the same window
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
      }
      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: null };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
