"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";
import useApiClient from "../hooks/useApiClient";

interface TodayStats {
  date: string;
  hoursWorked: number;
  targetHours: number;
  progressPercentage: number;
  isWorkingDay: boolean;
  remainingHours: number;
  sessionCount: number;
  status: "in_progress" | "completed" | "not_started";
}

interface TodayStatsProps {
  selectedTask: string;
}

export default function TodayStatsComponent({ selectedTask }: TodayStatsProps) {
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [isTodayLoading, setIsTodayLoading] = useState(true);

  const { user } = useAuth();
  const api = useApiClient(user?.id);

  // Fetch today's stats from API
  const fetchTodayStats = async () => {
    if (!user?.id) return;

    setIsTodayLoading(true);
    try {
      const res = await api<TodayStats>(
        `/users/${user.id}/today${
          selectedTask !== "all" ? `?trackerId=${selectedTask}` : ""
        }`
      );
      if (res.success && res.data) {
        setTodayStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch today's stats:", error);
      setTodayStats(null);
    } finally {
      setIsTodayLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedTask]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Today's Progress</span>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTodayLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">
              Loading today's stats...
            </div>
          </div>
        ) : todayStats ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {todayStats.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(todayStats.progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {todayStats.hoursWorked.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Hours Worked</div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-accent">
                  {todayStats.targetHours.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Target Hours</div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">
                  {todayStats.remainingHours.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">
                  {todayStats.sessionCount}
                </div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
            </div>

            {/* Status and Working Day Info */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  todayStats.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : todayStats.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {todayStats.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Working Day:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  todayStats.isWorkingDay 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {todayStats.isWorkingDay ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available for today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
