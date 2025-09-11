"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Tracker } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";
import useApiClient from "../hooks/useApiClient";
import DailyHoursChart from "./charts/daily-hours-chart";
import TaskDistributionChart from "./charts/task-distribution-chart";
import ProductivityTrendChart from "./charts/productivity-trend-chart";

interface StatisticsViewProps {
  tasks: Tracker[];
}

interface DailyTotal {
  date: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
}

export default function StatisticsView({ tasks }: StatisticsViewProps) {
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [targetHours, setTargetHours] = useState<number>(6);

  const { user } = useAuth();
  const api = useApiClient();

  // Fetch daily totals from API
  const fetchDailyTotals = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const res = await api<DailyTotal[]>(
        `/users/${user.id}/daily-totals/${timeRange}?trackerId=${
          selectedTask === "all" ? "" : selectedTask
        }`
      );
      if (res.success && res.data) {
        setDailyTotals(res.data);
        const target =
          selectedTask === "all"
            ? 8
            : tasks.find((task) => task.id === selectedTask)?.targetHours || 0;
        setTargetHours(target);
      }
    } catch (error) {
      console.error("Failed to fetch daily totals:", error);
      setDailyTotals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyTotals();
  }, [user?.id, timeRange, selectedTask]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="w-full sm:w-1/2">
          <Select value={selectedTask} onValueChange={setSelectedTask}>
            <SelectTrigger>
              <SelectValue placeholder="Select Task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.trackerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Daily Hours</TabsTrigger>
          <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
          <TabsTrigger value="productivity">Productivity Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Hours Worked</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">
                    Loading chart data...
                  </div>
                </div>
              ) : (
                <DailyHoursChart
                  taskId={selectedTask}
                  timeRange={timeRange}
                  dailyTotals={dailyTotals}
                  targetHours={targetHours}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">
                    Loading chart data...
                  </div>
                </div>
              ) : (
                <TaskDistributionChart timeRange={timeRange} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">
                    Loading chart data...
                  </div>
                </div>
              ) : (
                <ProductivityTrendChart
                  taskId={selectedTask}
                  timeRange={timeRange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
