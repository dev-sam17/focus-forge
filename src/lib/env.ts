// Environment configuration for production builds
export const getEnvVar = (key: string, fallback?: string): string => {
  // In development, use Vite's import.meta.env
  if (import.meta.env.DEV) {
    return import.meta.env[key] || fallback || "";
  }

  // In production, try multiple sources
  const value =
    import.meta.env[key] ||
    (typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).__ENV__?.[key]) ||
    fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

// Environment detection
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;
export const isElectron = () =>
  typeof window !== "undefined" && !!window.electron;

// OAuth redirect URL configuration
export const getOAuthRedirectUrl = () => {
  if (isElectron()) {
    // In Electron (both dev and prod), always use custom protocol
    // This allows the external browser flow to deep-link back to the app
    // and the in-window popup flow to intercept the redirect.
    return `focus-forge://auth/callback`;
  }

  // For pure web development fallback
  return `http://localhost:5123/auth/callback`;
};

export const SUPABASE_URL = getEnvVar("VITE_SUPABASE_URL");
export const SUPABASE_ANON_KEY = getEnvVar("VITE_SUPABASE_ANON_KEY");
export const API_URL = getEnvVar("VITE_API_URL", "http://localhost:3000");
