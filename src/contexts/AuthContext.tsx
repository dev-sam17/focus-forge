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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      // Update state immediately without blocking
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle successful sign in
      if (event === "SIGNED_IN" && session?.user) {
        console.log("User successfully signed in, redirecting to dashboard");
        // Clear any existing hash from OAuth callback
        if (window.location.hash) {
          window.location.hash = "";
        }
        // Force UI update by setting loading to false
        setLoading(false);
      }

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

    return () => {
      subscription?.unsubscribe();
    };
  }, [api]);

  // Dedicated OAuth callback listener (attach once to avoid leaks)
  useEffect(() => {
    if (typeof window !== "undefined" && window.electron?.onOAuthCallback) {
      const unsubscribe = window.electron.onOAuthCallback(async (url: string) => {
        try {
          console.log("Processing OAuth callback:", url);
          setLoading(true);

          if (url.includes("#")) {
            // Hash-based flow (access_token)
            const hashIndex = url.indexOf("#");
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken) {
              const { data } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              if (data.session) {
                console.log("Successfully set session from hash");
                setSession(data.session);
                setUser(data.session.user);
                setLoading(false);
              }
            } else {
              window.location.hash = hash;
              await supabase.auth.getSession();
            }
          } else if (url.includes("code=")) {
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get("code");
            if (code) {
              console.log("Attempting to exchange code for session:", code);
              try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                  console.error("Code exchange error:", error);
                  const { data: sessionData } = await supabase.auth.getSession();
                  if (sessionData.session) {
                    console.log("Found existing session after failed code exchange");
                    setSession(sessionData.session);
                    setUser(sessionData.session.user);
                  }
                } else if (data.session) {
                  console.log("Successfully exchanged code for session");
                  setSession(data.session);
                  setUser(data.session.user);
                  setLoading(false);
                  await supabase.auth.getSession();
                } else {
                  console.warn("Code exchange succeeded but no session returned");
                  const { data: sessionData } = await supabase.auth.getSession();
                  if (sessionData.session) {
                    setSession(sessionData.session);
                    setUser(sessionData.session.user);
                  }
                }
              } catch (exchangeError) {
                console.error("Exception during code exchange:", exchangeError);
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData.session) {
                  console.log("Fallback: found existing session");
                  setSession(sessionData.session);
                  setUser(sessionData.session.user);
                }
              }
            }
          }

          setLoading(false);
        } catch (error) {
          console.error("OAuth callback error:", error);
          setLoading(false);
        }
      });

      return () => {
        unsubscribe?.();
      };
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Always use custom protocol for Electron app
      const isElectron = typeof window !== "undefined" && window.electron;
      const redirectTo = isElectron
        ? "focus-forge://auth/callback"
        : `${window.location.origin}/auth/callback`;

      console.log("OAuth redirect URL:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        return { error };
      }

      // Open the login URL in the system browser
      if (data?.url) {
        if (isElectron && window.electron?.openExternal) {
          await window.electron.openExternal(data.url);
        } else {
          window.location.href = data.url;
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
    }
  };

  const signInWithFacebook = async () => {
    try {
      // Always use custom protocol for Electron app
      const isElectron = typeof window !== "undefined" && window.electron;
      const redirectTo = isElectron
        ? "focus-forge://auth/callback"
        : `${window.location.origin}/auth/callback`;

      console.log("OAuth redirect URL:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        return { error };
      }

      // Open the login URL in the system browser
      if (data?.url) {
        if (isElectron && window.electron?.openExternal) {
          await window.electron.openExternal(data.url);
        } else {
          window.location.href = data.url;
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
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
