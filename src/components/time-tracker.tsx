"use client";

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
import { Play, Square, Clock, Archive, Disc } from "lucide-react";
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
    work_advance: 0,
    work_debt: 0,
  });

  // @ts-expect-error errors here
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const api = useApiClient();

  // Initialize from session if available
  useEffect(() => {
    if (session) {
      setElapsedTime(Date.now() - session.start_time);
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.tracker_name}</CardTitle>
          <Badge variant={isRunning ? "default" : "outline"}>
            {isRunning ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">{task.description}</p>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl font-mono font-bold flex items-center">
            <Clock className="mr-2 h-6 w-6 text-gray-400" />
            {formatTime(elapsedTime)}
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <span>Daily Target: </span>
            <span className="ml-1 font-medium">{task.target_hours} hours</span>
          </div>

          {workStats && (
            <div className="grid grid-cols-2 w-full gap-4 text-center">
              <div className="p-2 bg-red-50 rounded-md">
                <div className="text-xs text-gray-500">Work Debt</div>
                <div className="font-semibold text-red-600">
                  {workStats.work_debt} hrs
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-md">
                <div className="text-xs text-gray-500">Work Advance</div>
                <div className="font-semibold text-green-600">
                  {workStats.work_advance} hrs
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 bg-gray-50 border-t">
        <div className="flex justify-between w-full">
          <Button
            variant={isRunning ? "outline" : "default"}
            size="sm"
            onClick={handleStart}
            className="w-1/2 mr-2"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Disc className="h-4 w-4 mr-2" /> Started
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Start
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            className="w-1/2"
            disabled={elapsedTime === 0}
          >
            <Square className="h-4 w-4 mr-2" /> Stop
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="w-full"
        >
          <Archive className="h-4 w-4 mr-2" /> Archive Tracker
        </Button>
      </CardFooter>
    </Card>
  );
}
