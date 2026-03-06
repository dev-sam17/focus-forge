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
import type { Tracker, WorkStats } from "../lib/types";
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
  // Initialize states with default values first
  const [selectedTask, setSelectedTask] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('week');
  const [activeTab, setActiveTab] = useState<string>('today');
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [targetHours, setTargetHours] = useState<number>(6);
  const [totalHours, setTotalHours] = useState<TotalHours | null>(null);
  const [trackerHours, setTrackerHours] = useState<TrackerHours[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>(
    []
  );
  const [trackerStats, setTrackerStats] = useState<WorkStats | null>(null);

  const { user } = useAuth();
  const api = useApiClient(user?.id);

  // Initialize from localStorage only once on component mount
  useEffect(() => {
    if (!initialized) {
      const savedTask = localStorage.getItem('statistics-selected-task');
      const savedTimeRange = localStorage.getItem('statistics-time-range');
      const savedTab = localStorage.getItem('statistics-active-tab');

      if (savedTask) setSelectedTask(savedTask);
      if (savedTimeRange) setTimeRange(savedTimeRange);
      if (savedTab) setActiveTab(savedTab);

      setInitialized(true);
    }
  }, [initialized]);

  // Fetch daily totals from API
  const fetchDailyTotals = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const res = await api<DailyTotal[]>(
        `/users/${user.id}/daily-totals/${timeRange}?trackerId=${selectedTask === "all" ? "" : selectedTask
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
        `/users/${user.id}/total-hours/${timeRange}?trackerId=${selectedTask !== "all" ? selectedTask : ""
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
        `/users/${user.id}/productivity-trend/${timeRange}?trackerId=${selectedTask !== "all" ? selectedTask : ""
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

  const fetchTrackerStats = async () => {
    if (!user?.id || selectedTask === "all") {
      setTrackerStats(null);
      return;
    }

    try {
      const res = await api<WorkStats>(`/trackers/${selectedTask}/stats`);
      if (res.success && res.data) {
        setTrackerStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tracker stats:", error);
      setTrackerStats(null);
    }
  };

  // Handle task selection change and save to localStorage
  const handleTaskChange = (value: string) => {
    setSelectedTask(value);
    localStorage.setItem('statistics-selected-task', value);
    if (value === "all" && activeTab === "total") {
      setActiveTab("today");
      localStorage.setItem('statistics-active-tab', "today");
    }
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
    // Only fetch data after initialization is complete
    if (initialized) {
      fetchDailyTotals();
      fetchTotalHours();
      fetchTrackerHours();
      fetchProductivityData();
      fetchTrackerStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, timeRange, selectedTask, initialized]);

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
        <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
          {selectedTask !== "all" && (
            <TabsTrigger value="total">Total</TabsTrigger>
          )}
          <TabsTrigger value="today">Today's Stats</TabsTrigger>
          <TabsTrigger value="daily">Daily Hours</TabsTrigger>
          <TabsTrigger value="distribution">Hours Distribution</TabsTrigger>
          <TabsTrigger value="productivity">Productivity Trend</TabsTrigger>
        </TabsList>

        {selectedTask !== "all" && (
          <TabsContent value="total">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Task Statistics</span>
                  <WorkDays
                    workDays={
                      tasks.find((t) => t.id === selectedTask)?.workDays ?? ""
                    }
                    isAll={false}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackerStats ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-5 space-y-2 border border-border/30">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Total Days Worked
                      </div>
                      <div className="text-3xl font-bold">{trackerStats.totalWorkDays || 0}</div>
                    </div>
                    <div className="glass rounded-xl p-5 space-y-2 border border-border/30">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Total Hours Worked
                      </div>
                      <div className="text-3xl font-bold">{trackerStats.totalWorkHours || 0}h</div>
                    </div>
                    <div className="glass rounded-xl p-5 space-y-2 border border-border/30">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Target Hours
                      </div>
                      <div className="text-3xl font-bold">{trackerStats.targetWorkHours || 0}h</div>
                    </div>
                    <div className="glass rounded-xl p-5 space-y-2 border border-success/30 bg-success/5">
                      <div className="text-sm font-medium text-success flex items-center gap-2">
                        Advance Buffer
                      </div>
                      <div className="text-3xl font-bold text-success">+{trackerStats.workAdvance}h</div>
                      <p className="text-xs text-success/70">Extra hours forged</p>
                    </div>
                    <div className="glass rounded-xl p-5 space-y-2 border border-destructive/30 bg-destructive/5 sm:col-span-2 md:col-span-1">
                      <div className="text-sm font-medium text-destructive flex items-center gap-2">
                        Work Debt
                      </div>
                      <div className="text-3xl font-bold text-destructive">-{trackerStats.workDebt}h</div>
                      <p className="text-xs text-destructive/70">Hours remaining to meet target</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">
                      Loading total statistics...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
            className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 ${isActive
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
