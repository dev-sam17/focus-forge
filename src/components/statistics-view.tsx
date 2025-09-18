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
import TodayStatsComponent from "./today-stats";

interface StatisticsViewProps {
  tasks: Tracker[];
}

interface DailyTotal {
  date: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
}

interface TotalHours {
  totalHoursWorked: number;
  totalTargetHours: number;
  hoursDifference: number;
  isAhead: boolean;
  status: string;
  sessionCount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

interface TrackerHours {
  trackerId: string;
  trackerName: string;
  totalHours: number;
  targetHours: number;
}

interface ProductivityData {
  date: string;
  score: number;
}

export default function StatisticsView({ tasks }: StatisticsViewProps) {
  const [selectedTask, setSelectedTask] = useState<string>(() => {
    // Get the last selected task from localStorage, default to "all"
    return localStorage.getItem('statistics-selected-task') || 'all';
  });
  const [timeRange, setTimeRange] = useState<string>(() => {
    // Get the last selected time range from localStorage, default to "week"
    return localStorage.getItem('statistics-time-range') || 'week';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Get the last selected tab from localStorage, default to "today"
    return localStorage.getItem('statistics-active-tab') || 'today';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [targetHours, setTargetHours] = useState<number>(6);
  const [totalHours, setTotalHours] = useState<TotalHours | null>(null);
  const [trackerHours, setTrackerHours] = useState<TrackerHours[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>(
    []
  );

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
      }
    } catch (error) {
      console.error("Failed to fetch daily totals:", error);
      setDailyTotals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch total hours from API
  const fetchTotalHours = async () => {
    if (!user?.id) return;

    try {
      const res = await api<TotalHours>(
        `/users/${user.id}/total-hours/${timeRange}?trackerId=${
          selectedTask !== "all" ? selectedTask : ""
        }`
      );
      if (res.success && res.data) {
        setTotalHours(res.data);
        if (selectedTask === "all") {
          switch (timeRange) {
            case "week":
              setTargetHours(
                Number((res.data.totalTargetHours / 7).toFixed(1))
              );
              break;
            case "month":
              setTargetHours(
                Number((res.data.totalTargetHours / 30).toFixed(1))
              );
              break;
            case "year":
              setTargetHours(
                Number((res.data.totalTargetHours / 365).toFixed(1))
              );
              break;
          }
        } else {
          setTargetHours(
            tasks.find((task) => task.id === selectedTask)?.targetHours || 0
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch total hours:", error);
      setTotalHours(null);
    }
  };

  // Fetch hours per tracker (only when "all" is selected)
  const fetchTrackerHours = async () => {
    if (!user?.id || selectedTask !== "all") {
      setTrackerHours([]);
      return;
    }

    try {
      // Call the API for each tracker to get individual hours
      const trackerPromises = tasks.map(async (task) => {
        const res = await api<TotalHours>(
          `/users/${user.id}/total-hours/${timeRange}?trackerId=${task.id}`
        );
        if (res.success && res.data) {
          return {
            trackerId: task.id,
            trackerName: task.trackerName,
            totalHours: res.data.totalHoursWorked,
            targetHours: task.targetHours,
          };
        }
        return null;
      });

      const results = await Promise.all(trackerPromises);
      const validResults = results.filter(
        (result): result is TrackerHours => result !== null
      );
      setTrackerHours(validResults);
    } catch (error) {
      console.error("Failed to fetch tracker hours:", error);
      setTrackerHours([]);
    }
  };

  // Fetch productivity trend data
  const fetchProductivityData = async () => {
    if (!user?.id) return;

    try {
      const res = await api<ProductivityData[]>(
        `/users/${user.id}/productivity-trend/${timeRange}?trackerId=${
          selectedTask !== "all" ? selectedTask : ""
        }`
      );
      if (res.success && res.data) {
        setProductivityData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch productivity data:", error);
      setProductivityData([]);
    }
  };

  // Handle task selection change and save to localStorage
  const handleTaskChange = (value: string) => {
    setSelectedTask(value);
    localStorage.setItem('statistics-selected-task', value);
  };

  // Handle time range change and save to localStorage
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    localStorage.setItem('statistics-time-range', value);
  };

  // Handle tab change and save to localStorage
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('statistics-active-tab', value);
  };

  useEffect(() => {
    fetchDailyTotals();
    fetchTotalHours();
    fetchTrackerHours();
    fetchProductivityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, timeRange, selectedTask]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="w-full sm:w-1/2">
          <Select value={selectedTask} onValueChange={handleTaskChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trackers</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.trackerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="today">Today's Stats</TabsTrigger>
          <TabsTrigger value="daily">Daily Hours</TabsTrigger>
          <TabsTrigger value="distribution">Hours Distribution</TabsTrigger>
          <TabsTrigger value="productivity">Productivity Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodayStatsComponent selectedTask={selectedTask} />
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daily Hours Worked</span>
                <WorkDays
                  workDays={
                    tasks.find((t) => t.id === selectedTask)?.workDays ?? ""
                  }
                  isAll={selectedTask === "all"}
                />
              </CardTitle>
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
              <CardTitle className="flex items-center justify-between">
                <span>Hours Distribution</span>
                <WorkDays
                  workDays={
                    tasks.find((t) => t.id === selectedTask)?.workDays ?? ""
                  }
                  isAll={selectedTask === "all"}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">
                    Loading chart data...
                  </div>
                </div>
              ) : (
                <TaskDistributionChart
                  totalHours={totalHours}
                  trackerHours={trackerHours}
                  selectedTask={selectedTask}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productivity Trend</span>
                <WorkDays
                  workDays={
                    tasks.find((t) => t.id === selectedTask)?.workDays ?? ""
                  }
                  isAll={selectedTask === "all"}
                />
              </CardTitle>
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
                  productivityData={productivityData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkDays({ workDays, isAll }: { workDays: string; isAll: boolean }) {
  if (isAll) return null;
  return (
    <div className="flex gap-1 justify-end">
      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
        const workDaysArray = workDays.split(",").map(Number);
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
  );
}
