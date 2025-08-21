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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
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

    // Handle OAuth callback from Electron main process
    if (typeof window !== 'undefined' && window.electron?.onOAuthCallback) {
      window.electron.onOAuthCallback(async (url: string) => {
        try {
          console.log('Processing OAuth callback:', url);
          
          // Handle both hash-based and code-based OAuth flows
          if (url.includes('#')) {
            // Hash-based flow (access_token)
            const hashIndex = url.indexOf('#');
            const hash = url.substring(hashIndex + 1);
            window.location.hash = hash;
            await supabase.auth.getSession();
          } else if (url.includes('code=')) {
            // Code-based flow - extract parameters and let Supabase handle
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get('code');
            
            if (code) {
              // Use Supabase's session handling for the code exchange
              await supabase.auth.exchangeCodeForSession(code);
            }
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      });
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [api]);

  const signInWithGoogle = async () => {
    try {
      // Always use custom protocol for Electron app
      const isElectron = typeof window !== 'undefined' && window.electron;
      const redirectTo = isElectron 
        ? 'focus-forge://auth/callback'
        : `${window.location.origin}/auth/callback`;
        
      console.log('OAuth redirect URL:', redirectTo);
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
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

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
    }
  };

  const signInWithFacebook = async () => {
    try {
      // Always use custom protocol for Electron app
      const isElectron = typeof window !== 'undefined' && window.electron;
      const redirectTo = isElectron 
        ? 'focus-forge://auth/callback'
        : `${window.location.origin}/auth/callback`;
        
      console.log('OAuth redirect URL:', redirectTo);
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo,
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
