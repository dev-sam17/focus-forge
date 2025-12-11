import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Toggle } from "./ui/toggle";
import { User, LogOut, Timer, Activity } from "lucide-react";

export function ProfileDialog() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMonitorRunning, setIsMonitorRunning] = useState(false);
  const [idleThreshold, setIdleThreshold] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && window.electron?.activityMonitor) {
      window.electron.activityMonitor.isRunning().then((status) => {
        setIsMonitorRunning(status.running);
      });
    }
  }, [isOpen]);

  const handleToggleMonitor = async () => {
    if (!window.electron?.activityMonitor) return;

    setIsLoading(true);
    try {
      if (isMonitorRunning) {
        const result = await window.electron.activityMonitor.stop();
        if (result.success) {
          setIsMonitorRunning(false);
        }
      } else {
        const result = await window.electron.activityMonitor.start();
        if (result.success) {
          setIsMonitorRunning(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle activity monitor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateThreshold = async () => {
    if (!window.electron?.activityMonitor) return;

    setIsLoading(true);
    try {
      const result = await window.electron.activityMonitor.updateConfig({
        idleThresholdSeconds: idleThreshold,
      });
      if (result.success) {
        console.log("Threshold updated successfully");
      }
    } catch (error) {
      console.error("Failed to update threshold:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={user?.email || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>
            Manage your profile and activity monitoring preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={user?.email || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold text-base truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Activity Monitor Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Activity Monitor</h3>
            </div>

            {/* Monitor Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <Label className="text-sm font-medium">Monitoring Status</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isMonitorRunning ? "Currently tracking activity" : "Paused"}
                </p>
              </div>
              <Toggle
                pressed={isMonitorRunning}
                onPressedChange={handleToggleMonitor}
                disabled={isLoading}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {isMonitorRunning ? "ON" : "OFF"}
              </Toggle>
            </div>

            {/* Idle Threshold Setting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="threshold" className="text-sm font-medium">
                  Idle Threshold (seconds)
                </Label>
              </div>
              <div className="flex gap-2">
                <Input
                  id="threshold"
                  type="number"
                  min="10"
                  max="3600"
                  value={idleThreshold}
                  onChange={(e) => setIdleThreshold(Number(e.target.value))}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleUpdateThreshold}
                  disabled={isLoading}
                  size="sm"
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Time before being marked as inactive (
                {Math.floor(idleThreshold / 60)}m {idleThreshold % 60}s)
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
