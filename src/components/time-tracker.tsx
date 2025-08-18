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
import { Play, Square, Clock, Archive, Disc, Target, TrendingUp, TrendingDown } from "lucide-react";
import type { Tracker, ActiveSession, WorkStats } from "../lib/types";
import { formatTime } from "../lib/utils";
import useApiClient from "../hooks/useApiClient";

interface TimeTrackerProps {
  task: Tracker;
  session?: ActiveSession;
  onStart: () => void;
  onStop: (taskId: string, elapsedTime: number) => void;
  onArchive: (taskId: string) => void;
}

export default function TimeTracker({
  task,
  session,
  onStart,
  onStop,
  onArchive,
}: TimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [workStats, setWorkStats] = useState<WorkStats>({
    workAdvance: 0,
    workDebt: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const api = useApiClient();

  // Initialize from session if available
  useEffect(() => {
    if (session) {
      const startTimestamp = new Date(session.startTime).getTime();
      setElapsedTime(Date.now() - startTimestamp);
      setIsRunning(true);
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
    if (isRunning) {
      if (
        !confirm(
          "This tracker is currently running. Are you sure you want to archive it?"
        )
      ) {
        return;
      }
    }
    onArchive(task.id);
  };

  return (
    <Card className="anime-card glass border-0 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 group overflow-hidden">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-card rounded-xl m-px">
        
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold gradient-text">{task.trackerName}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            </div>
            <Badge 
              variant={isRunning ? "default" : "outline"} 
              className={`text-xs font-medium ${
                isRunning 
                  ? 'bg-gradient-to-r from-success to-success/80 text-white anime-glow border-0' 
                  : 'border-border/50'
              }`}
            >
              {isRunning ? (
                <>
                  <Disc className="w-3 h-3 mr-1 animate-spin" />
                  Active
                </>
              ) : (
                'Inactive'
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Timer Display */}
          <div className="text-center space-y-2">
            <div className="relative">
              <div className={`text-3xl font-mono font-bold flex items-center justify-center ${
                isRunning ? 'text-primary anime-glow' : 'text-foreground'
              }`}>
                <Clock className="mr-2 h-6 w-6" />
                {formatTime(elapsedTime)}
              </div>
              {isRunning && (
                <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Daily Goal: <span className="font-semibold text-foreground">{task.targetHours}h</span></span>
            </div>
          </div>

          {/* Work Days */}
          <div className="flex justify-center gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
              const workDaysArray = task.workDays.split(',').map(Number);
              const isActive = workDaysArray.includes(index);
              return (
                <div
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Work Stats */}
          {workStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-lg p-3 text-center space-y-1 border border-destructive/20">
                <div className="flex items-center justify-center gap-1 text-destructive">
                  <TrendingDown className="w-3 h-3" />
                  <span className="text-xs font-medium">Debt</span>
                </div>
                <div className="text-lg font-bold text-destructive">
                  {workStats.workDebt}h
                </div>
              </div>
              <div className="glass rounded-lg p-3 text-center space-y-1 border border-success/20">
                <div className="flex items-center justify-center gap-1 text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">Advance</span>
                </div>
                <div className="text-lg font-bold text-success">
                  {workStats.workAdvance}h
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 space-y-3">
          {/* Primary Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant={isRunning ? "outline" : "default"}
              size="sm"
              onClick={handleStart}
              className={`flex-1 h-10 font-medium transition-all duration-300 ${
                isRunning 
                  ? 'border-primary/50 text-primary hover:bg-primary/10' 
                  : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl hover:shadow-primary/25'
              }`}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Disc className="h-4 w-4 mr-2 animate-spin" /> 
                  Running
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> 
                  Start Timer
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              className="flex-1 h-10 font-medium border-destructive/50 text-destructive hover:bg-destructive/10 transition-all duration-300"
              disabled={elapsedTime === 0}
            >
              <Square className="h-4 w-4 mr-2" /> 
              Stop
            </Button>
          </div>
          
          {/* Archive Action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="w-full h-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
          >
            <Archive className="h-4 w-4 mr-2" /> 
            Archive Tracker
          </Button>
        </CardFooter>
        
      </div>
    </Card>
  );
}
