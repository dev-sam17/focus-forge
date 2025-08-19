import TimeTrackingDashboard from "./time-tracking-dashboard";
import { useState, useEffect } from "react";
import { DashboardSkeleton } from "./ui/skeleton";
import { Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
        <div className="p-6 mt-5">
          <div className="max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="flex items-center justify-between mb-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Focus Forge
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated Background Orbs */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/15 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div> */}

      <div className="p-6 mt-5">
        <div className="max-w-7xl mx-auto">
          {/* Minimal Navbar Header */}
          <div className="flex items-center justify-between mb-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Focus Forge
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <TimeTrackingDashboard />
        </div>
      </div>
    </div>
  );
}
