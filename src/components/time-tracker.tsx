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
    workAdvance: 0,
    workDebt: 0,
  });

  // @ts-expect-error errors here
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
    console.log(res)
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{task.trackerName}</CardTitle>
          <Badge variant={isRunning ? "default" : "outline"} className="text-xs">
            {isRunning ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      </CardHeader>

      <CardContent className="pt-3 pb-2 px-3">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl font-mono font-bold flex items-center">
            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
            {formatTime(elapsedTime)}
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <span>Daily Target: </span>
            <span className="ml-1 font-medium">{task.targetHours} hours</span>
          </div>

          {workStats && (
            <div className="grid grid-cols-2 w-full gap-2 text-center">
              <div className="p-1.5 bg-red-50 rounded">
                <div className="text-[10px] text-gray-500">Work Debt</div>
                <div className="font-medium text-xs text-red-600">
                  {workStats.workDebt} hrs
                </div>
              </div>
              <div className="p-1.5 bg-green-50 rounded">
                <div className="text-[10px] text-gray-500">Work Advance</div>
                <div className="font-medium text-xs text-green-600">
                  {workStats.workAdvance} hrs
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-1.5 bg-gray-50 border-t p-2">
        <div className="flex justify-between w-full gap-2">
          <Button
            variant={isRunning ? "outline" : "default"}
            size="sm"
            onClick={handleStart}
            className="w-1/2 h-7 text-xs"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Disc className="h-3 w-3 mr-1" /> Started
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" /> Start
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            className="w-1/2 h-7 text-xs"
            disabled={elapsedTime === 0}
          >
            <Square className="h-3 w-3 mr-1" /> Stop
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="w-full h-7 text-xs"
        >
          <Archive className="h-3 w-3 mr-1" /> Archive Tracker
        </Button>
      </CardFooter>
    </Card>
  );
}
