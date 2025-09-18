import { useState, useEffect } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Dashboard from "../components/Dashboard";
import TitleBar from "../components/titlebar";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check backend health
    const checkBackend = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ping`);
        setIsBackendAvailable(response.ok);
      } catch {
        setIsBackendAvailable(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <AuthProvider>
      <TitleBar
        isOnline={isOnline}
        isBackendAvailable={isBackendAvailable}
        showBackButton={true}
        onBackClick={() => window.history.back()}
      />
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}
