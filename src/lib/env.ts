// Environment configuration for production builds
export const getEnvVar = (key: string, fallback?: string): string => {
  // In development, use Vite's import.meta.env
  if (import.meta.env.DEV) {
    return import.meta.env[key] || fallback || '';
  }
  
  // In production, try multiple sources
  const value = 
    import.meta.env[key] || 
    (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__ENV__?.[key]) ||
    fallback;
    
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
export const API_URL = getEnvVar('VITE_API_URL', 'http://localhost:3000');
