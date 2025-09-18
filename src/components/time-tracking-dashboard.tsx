/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TimeTracker from "./time-tracker";
import ArchivedTracker from "./archived-tracker";
import type { Tracker, ActiveSession, NewTracker } from "../lib/types";
import AddTaskDialog from "./add-task";
import useApiClient from "../hooks/useApiClient";
import {
  WifiOff,
  ServerOff,
  Plus,
  Archive,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import StatisticsView from "./statistics-view";

interface TimeTrackingDashboardProps {
  onBackendStatusChange?: (available: boolean) => void;
}

export default function TimeTrackingDashboard({
  onBackendStatusChange,
}: TimeTrackingDashboardProps) {
  const [tasks, setTasks] = useState<Tracker[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Record<string, ActiveSession>
  >({});
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [userInactive, setUserInactive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Get the last selected tab from localStorage, default to "trackers"
    return localStorage.getItem('dashboard-active-tab') || 'trackers';
  });
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = window.electron.subscribeUserInactive(setUserInactive);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userInactive) {
      const stopAllSessions = async () => {
        try {
          if (Object.keys(activeSessions).length > 0) {
            const sessionsToStop = { ...activeSessions };
            setActiveSessions({});

            await Promise.all(
              Object.values(sessionsToStop).map((session) =>
                handleSessionEnd(session.trackerId)
              )
            );
            window.location.reload();
          }
        } catch (error) {
          console.error("Error stopping sessions:", error);
          // Refresh states in case of error
          await fetchActiveSessions();
          await fetchTasks();
        } finally {
          setUserInactive(false);
        }
      };

      stopAllSessions();
    }
  }, [userInactive]);

  const api = useApiClient();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchTasks = async () => {
    const res = await api<Tracker[]>(`/trackers?userId=${user?.id}`);
    if (res.success && res.data) {
      setTasks(res.data);
    }
  };

  const fetchActiveSessions = async () => {
    const res = await api<ActiveSession[]>(`/sessions/${user?.id}/active`);
    if (res.success && res.data) {
      setActiveSessions(
        res.data.reduce((acc, session) => {
          acc[session.trackerId] = session;
          return acc;
        }, {} as Record<string, ActiveSession>)
      );
    }
  };

  const checkConnectivity = async () => {
    try {
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const checkBackendHealth = async () => {
    try {
      await fetch(`${apiUrl}/ping`);
      setIsBackendAvailable(true);
      onBackendStatusChange?.(true);
    } catch {
      setIsBackendAvailable(false);
      onBackendStatusChange?.(false);
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      await checkConnectivity();
      if (isOnline) {
        await checkBackendHealth();
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && isBackendAvailable) {
      fetchTasks();
      fetchActiveSessions();
    }
  }, [isOnline, isBackendAvailable]);

  const handleAddTask = async (newTask: NewTracker) => {
    console.log({ newTask });
    const res = await api<Tracker>("/trackers", "POST", newTask);

    if (res.success) {
      fetchTasks();
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/archive`, "POST");

    if (res.success) {
      fetchTasks();
      fetchActiveSessions();
    }
  };

  const handleUnarchiveTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/unarchive`, "POST");

    if (res.success) {
      fetchTasks();
      fetchActiveSessions();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}`, "DELETE");

    if (res.success) {
      fetchTasks();
      fetchActiveSessions();
    }
  };

  const handleSessionStart = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/start`, "POST");

    if (res.success) {
      fetchActiveSessions();
      fetchTasks();
    }
  };

  const handleSessionEnd = async (taskId: string) => {
    const res = await api(`/trackers/${taskId}/stop`, "POST");

    if (res.success) {
      fetchActiveSessions();
      fetchTasks();
    }
  };

  const activeTasks = tasks.filter((task) => !task.archived);
  const archivedTasks = tasks.filter((task) => task.archived);

  // Handle tab change and save to localStorage
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('dashboard-active-tab', value);
  };

  // Show loading state
  if (!isOnline || !isBackendAvailable) {
    return (
      <div className="space-y-6 min-h-[calc(100vh-12rem)] anime-slide-up">
        {/* Connection Status */}
        <div className="flex justify-center">
          <div className="glass border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent rounded-xl p-6 max-w-md shadow-lg anime-scale-in">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon with animated glow */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center border border-destructive/30">
                  {!isOnline ? (
                    <WifiOff className="h-6 w-6 text-destructive animate-pulse" />
                  ) : (
                    <ServerOff className="h-6 w-6 text-destructive animate-pulse" />
                  )}
                </div>
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-destructive">
                {!isOnline ? "Connection Lost" : "Server Unavailable"}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {!isOnline
                  ? "Unable to connect to the internet. Please check your network connection and try again."
                  : "Cannot reach the server at this time. The service may be temporarily unavailable."}
              </p>

              {/* Status indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full border border-destructive/20">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-xs font-medium text-destructive">
                  {!isOnline ? "Offline" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-[calc(100vh-12rem)]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full anime-slide-up">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="glass bg-card/50 backdrop-blur-sm border-0 p-1 rounded-2xl shadow-lg">
            <TabsTrigger
              value="trackers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Active Trackers
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="archives"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archives
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="w-10 h-10 glass bg-card/50 hover:bg-card/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 group border border-border/30"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:rotate-180 transition-all duration-500" />
            </button>

            {/* Add Task Dialog in Tab Row */}
            <AddTaskDialog onAddTask={handleAddTask} />
          </div>
        </div>

        <TabsContent value="trackers" className="space-y-8 anime-slide-up">
          {/* Active Trackers Grid */}
          {activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <div className="glass rounded-2xl p-8 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto anime-float">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold gradient-text mb-2">
                    No Active Trackers
                  </h3>
                  <p className="text-muted-foreground">
                    Create your first time tracker to get started!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-6 auto-rows-fr"
              style={{
                gridTemplateColumns: "repeat(auto-fit, 250px)",
              }}
            >
              {activeTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="anime-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TimeTracker
                    task={task}
                    session={activeSessions[task.id]}
                    onStart={() => handleSessionStart(task.id)}
                    onStop={() => handleSessionEnd(task.id)}
                    onArchive={handleArchiveTask}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archives" className="space-y-8 anime-slide-up">
          {archivedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="glass rounded-2xl p-8 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Archive className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    No Archived Trackers
                  </h3>
                  <p className="text-muted-foreground/70">
                    Archived trackers will appear here when you archive them.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-6 auto-rows-fr"
              style={{
                gridTemplateColumns: "repeat(auto-fit, 250px)",
              }}
            >
              {archivedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="anime-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArchivedTracker
                    task={task}
                    onDelete={handleDeleteTask}
                    onUnarchive={handleUnarchiveTask}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="anime-slide-up">
          <StatisticsView tasks={activeTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
