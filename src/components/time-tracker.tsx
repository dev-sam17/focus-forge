"use client";

// Anime-styled Time Tracker Card Component

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Play,
  Square,
  Clock,
  Archive,
  Disc,
  Target,
  TrendingUp,
  TrendingDown,
  Edit,
} from "lucide-react";
import type { Tracker, ActiveSession, WorkStats } from "../lib/types";
import { formatTime } from "../lib/utils";
import useApiClient from "../hooks/useApiClient";
import { useAuth } from "../contexts/AuthContext";

interface TimeTrackerProps {
  task: Tracker;
  session?: ActiveSession;
  onStart: () => void;
  onStop: (taskId: string, elapsedTime: number) => void;
  onArchive: (taskId: string) => void;
  onEdit: (taskId: string) => void;
}

export default function TimeTracker({
  task,
  session,
  onStart,
  onStop,
  onArchive,
  onEdit,
}: TimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [workStats, setWorkStats] = useState<WorkStats>({
    workAdvance: 0,
    workDebt: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const api = useApiClient(user?.id);

  // Initialize from session if available and sync isRunning state
  useEffect(() => {
    if (session) {
      const startTimestamp = new Date(session.startTime).getTime();
      setElapsedTime(Date.now() - startTimestamp);
      setIsRunning(true);
    } else {
      // If session is removed (e.g., by auto-stop), update local state
      setIsRunning(false);
      setElapsedTime(0);
    }
  }, [session]);

  const fetchWorkStats = async () => {
    const res = await api<WorkStats>(`/trackers/${task.id}/stats`);
    // @ts-expect-error errors here
    setWorkStats(res.data);
  };

  // Fetch financial data
  useEffect(() => {
    fetchWorkStats();

    const interval = setInterval(fetchWorkStats, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - elapsedTime;

      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    onStart();
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop(task.id, elapsedTime);
    setElapsedTime(0);
  };

  const handleArchive = () => {
    setShowArchiveDialog(true);
  };

  const confirmArchive = () => {
    setShowArchiveDialog(false);
    onArchive(task.id);
  };

  const cancelArchive = () => {
    setShowArchiveDialog(false);
  };

  const handleEdit = () => {
    onEdit(task.id);
  };

  return (
    <>
      <Card className="anime-card glass border-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 group overflow-hidden min-h-[400px] max-h-[450px]">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-card rounded-xl m-px h-full flex flex-col">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 border-b border-border/50 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="space-y-1 min-w-0 flex-1">
                <CardTitle className="text-base font-semibold gradient-text truncate">
                  {task.trackerName}
                </CardTitle>
                <div className="h-4">
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description || ""}
                  </p>
                </div>
              </div>
              <Badge
                variant={isRunning ? "default" : "outline"}
                className={`text-xs font-medium ${
                  isRunning
                    ? "bg-gradient-to-r from-success to-success/80 text-white anime-glow border-0"
                    : "border-border/50"
                }`}
              >
                {isRunning ? (
                  <>
                    <Disc className="w-3 h-3 mr-1 animate-spin" />
                    Active
                  </>
                ) : (
                  "Inactive"
                )}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-3 flex-1 flex flex-col overflow-hidden">
            <div className="space-y-3 flex-1 min-h-0">
              {/* Timer Display */}
              <div className="text-center space-y-1">
                <div className="relative">
                  <div
                    className={`text-2xl font-mono font-bold flex items-center justify-center ${
                      isRunning ? "text-primary anime-glow" : "text-foreground"
                    }`}
                  >
                    <Clock className="mr-1 h-4 w-4" />
                    {formatTime(elapsedTime)}
                  </div>
                  {isRunning && (
                    <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl animate-pulse" />
                  )}
                </div>

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span>
                    Goal:{" "}
                    <span className="font-semibold text-foreground">
                      {task.targetHours}h
                    </span>
                  </span>
                </div>
              </div>

              {/* Work Days */}
              <div className="flex justify-center gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                  const workDaysArray = task.workDays.split(",").map(Number);
                  const isActive = workDaysArray.includes(index);
                  return (
                    <div
                      key={index}
                      className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Work Stats - Compact version */}
            {workStats && (
              <div className="grid grid-cols-2 gap-2 mt-2 flex-shrink-0">
                <div className="glass rounded-md p-1.5 text-center space-y-0.5 border border-destructive/20">
                  <div className="flex items-center justify-center gap-1 text-destructive">
                    <TrendingDown className="w-3 h-3" />
                    <span className="text-xs font-medium">Debt</span>
                  </div>
                  <div className="text-sm font-bold text-destructive">
                    {workStats.workDebt}h
                  </div>
                </div>
                <div className="glass rounded-md p-1.5 text-center space-y-0.5 border border-success/20">
                  <div className="flex items-center justify-center gap-1 text-success">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">Advance</span>
                  </div>
                  <div className="text-sm font-bold text-success">
                    {workStats.workAdvance}h
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 pt-2 space-y-2 flex-shrink-0 border-t border-border/30">
            {/* Primary Actions */}
            <div className="flex gap-2 w-full">
              <Button
                variant={isRunning ? "outline" : "default"}
                size="sm"
                onClick={handleStart}
                className={`flex-1 h-8 font-medium transition-all duration-300 text-xs ${
                  isRunning
                    ? "border-primary/50 text-primary hover:bg-primary/10"
                    : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl hover:shadow-primary/25"
                }`}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Disc className="h-3 w-3 mr-1 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="flex-1 h-8 font-medium border-destructive/50 text-destructive hover:bg-destructive/10 transition-all duration-300 text-xs"
                disabled={elapsedTime === 0}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>

            {/* Secondary Actions - Minimal buttons */}
            <div className="flex gap-1 w-full justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
                title="Edit tracker"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
                title="Archive tracker"
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Archive Tracker</DialogTitle>
            <DialogDescription>
              {isRunning
                ? "This tracker is currently running. Are you sure you want to archive it?"
                : `Are you sure you want to archive "${task.trackerName}"? You can restore it from the Archives tab later.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelArchive}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmArchive}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
