// hooks/useApiClient.ts
const useApiClient = () => {
  const call = async <T>(
    endpoint: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: unknown
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const serverUrl = import.meta.env.VITE_API_URL;

      const res = await fetch(`${serverUrl}/api${endpoint}`, {
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
  };

  return call;
};

export default useApiClient;
