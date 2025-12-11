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
import { LogOut, Timer, Activity, Clock } from "lucide-react";

const STORAGE_KEYS = {
  IDLE_THRESHOLD: "focus-forge-idle-threshold",
  MONITOR_ENABLED: "focus-forge-monitor-enabled",
  AUTOSTOP_ENABLED: "focus-forge-autostop-enabled",
  AUTOSTOP_DURATION: "focus-forge-autostop-duration",
};

export function ProfileDialog() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMonitorRunning, setIsMonitorRunning] = useState(false);
  const [idleThreshold, setIdleThreshold] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.IDLE_THRESHOLD);
    return stored ? Number(stored) : 60;
  });
  const [autoStopEnabled, setAutoStopEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTOSTOP_ENABLED);
    return stored === "true";
  });
  const [autoStopDuration, setAutoStopDuration] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTOSTOP_DURATION);
    return stored ? Number(stored) : 60;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize activity monitor config from localStorage on mount
  useEffect(() => {
    const initializeMonitorConfig = async () => {
      if (window.electron?.activityMonitor) {
        const storedThreshold = localStorage.getItem(
          STORAGE_KEYS.IDLE_THRESHOLD
        );
        if (storedThreshold) {
          await window.electron.activityMonitor.updateConfig({
            idleThresholdSeconds: Number(storedThreshold),
          });
        }
      }
    };

    initializeMonitorConfig();
  }, []);

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
        localStorage.setItem(
          STORAGE_KEYS.IDLE_THRESHOLD,
          String(idleThreshold)
        );
      }
    } catch (error) {
      console.error("Failed to update threshold:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoStopToggle = (enabled: boolean) => {
    setAutoStopEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.AUTOSTOP_ENABLED, String(enabled));

    window.dispatchEvent(
      new CustomEvent("autostop-settings-changed", {
        detail: { enabled, duration: autoStopDuration },
      })
    );
  };

  const handleAutoStopDurationChange = (duration: number) => {
    setAutoStopDuration(duration);
    localStorage.setItem(STORAGE_KEYS.AUTOSTOP_DURATION, String(duration));

    if (autoStopEnabled) {
      window.dispatchEvent(
        new CustomEvent("autostop-settings-changed", {
          detail: { enabled: autoStopEnabled, duration },
        })
      );
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
        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {/* Activity Monitor Indicator */}
            {isMonitorRunning && (
              <div className="relative">
                <Activity className="h-3 w-3 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm animate-pulse" />
              </div>
            )}
            {/* Auto-Stop Timer Indicator */}
            {autoStopEnabled && (
              <div className="relative">
                <Clock className="h-3 w-3 text-accent animate-pulse" />
                <div className="absolute inset-0 bg-accent/30 rounded-full blur-sm animate-pulse" />
              </div>
            )}
          </div>
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
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={user?.email || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">
                {user?.user_metadata?.full_name || "User"}
              </DialogTitle>
              <DialogDescription className="text-xs truncate">
                {user?.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Activity Monitor Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Activity Monitor</h3>
            </div>

            {/* Monitor Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md">
              <div className="flex-1">
                <Label className="text-xs font-medium">Status</Label>
                <p className="text-[10px] text-muted-foreground">
                  {isMonitorRunning ? "Active" : "Paused"}
                </p>
              </div>
              <Toggle
                pressed={isMonitorRunning}
                onPressedChange={handleToggleMonitor}
                disabled={isLoading}
                size="sm"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-7 px-2 text-xs"
              >
                {isMonitorRunning ? "ON" : "OFF"}
              </Toggle>
            </div>

            {/* Idle Threshold Setting */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="threshold" className="text-xs font-medium">
                  Idle Threshold
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
                  className="flex-1 h-8 text-xs"
                  disabled={isLoading}
                  placeholder="Seconds"
                />
                <Button
                  onClick={handleUpdateThreshold}
                  disabled={isLoading}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Apply
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {Math.floor(idleThreshold / 60)}m {idleThreshold % 60}s before
                inactive
              </p>
            </div>
          </div>

          {/* Auto-Stop Timer Section */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Auto-Stop Timer</h3>
            </div>

            {/* Auto-Stop Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md">
              <div className="flex-1">
                <Label className="text-xs font-medium">Auto-Stop</Label>
                <p className="text-[10px] text-muted-foreground">
                  {autoStopEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <Toggle
                pressed={autoStopEnabled}
                onPressedChange={handleAutoStopToggle}
                size="sm"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-7 px-2 text-xs"
              >
                {autoStopEnabled ? "ON" : "OFF"}
              </Toggle>
            </div>

            {/* Duration Input - Only show when enabled */}
            {autoStopEnabled && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="autostop-duration"
                  className="text-xs font-medium"
                >
                  Duration (minutes)
                </Label>
                <Input
                  id="autostop-duration"
                  type="number"
                  min="1"
                  max="480"
                  value={autoStopDuration}
                  onChange={(e) =>
                    handleAutoStopDurationChange(Number(e.target.value))
                  }
                  className="h-8 text-xs"
                  placeholder="Minutes"
                />
                <p className="text-[10px] text-muted-foreground">
                  All trackers will stop after {autoStopDuration} minute
                  {autoStopDuration !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-3 border-t">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full h-8 text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
