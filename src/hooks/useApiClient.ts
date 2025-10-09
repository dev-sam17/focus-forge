// hooks/useApiClient.ts
import { useCallback } from 'react'

const useApiClient = (userId?: string) => {
  const call = useCallback(async <T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const serverUrl = import.meta.env.VITE_API_URL;
      
      // Add userId as query parameter if user is available and endpoint doesn't already have userId
      let finalEndpoint = endpoint;
      if (userId && !endpoint.includes('userId=') && !endpoint.includes('/users/') && !endpoint.includes('/sessions/')) {
        const separator = endpoint.includes('?') ? '&' : '?';
        finalEndpoint = `${endpoint}${separator}userId=${userId}`;
      }

      const res = await fetch(`${serverUrl}/api${finalEndpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        ...(method !== "GET" ? { body: JSON.stringify(body) } : {}),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.error || "Unknown error" };
      }

      return { success: true, data: result.data };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [userId]);

  return call;
};

export default useApiClient;
