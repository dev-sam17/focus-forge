"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TimeTracker from "./time-tracker";
import ArchivedTracker from "./archived-tracker";
// import StatisticsView from "./statistics-view";
import type { Tracker, ActiveSession, NewTracker } from "../lib/types";
import AddTaskDialog from "./add-task";
import useApiClient from "../hooks/useApiClient";
import { Alert, AlertDescription } from "./ui/alert";

export default function TimeTrackingDashboard() {
  const [tasks, setTasks] = useState<Tracker[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Record<string, ActiveSession>
  >({});
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [userInactive, setUserInactive] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = window.electron.subscribeUserInactive(setUserInactive);
    return () => unsubscribe();
  }, []);
  
 

  useEffect(() => {
    if (userInactive) {
      const stopAllSessions = async () => {
        try {
         if(Object.keys(activeSessions).length > 0) {
           const sessionsToStop = { ...activeSessions };
           setActiveSessions({});
 
           await Promise.all(
             Object.values(sessionsToStop).map(session => 
               handleSessionEnd(session.trackerId)
             )
           );
           window.location.reload();
         }
        } catch (error) {
          console.error('Error stopping sessions:', error);
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
    const res = await api<Tracker[]>("/trackers");
    console.log(res);
    if (res.success && res.data) {
      setTasks(res.data);
    }
  };

  const fetchActiveSessions = async () => {
    const res = await api<ActiveSession[]>("/sessions/active");
    console.log(res);
    if (res.success && res.data) {
      setActiveSessions(
        res.data.reduce((acc, session) => {
          acc[session.trackerId] = session;
          return acc;
        }, {})
      );
    }
  };

  const checkConnectivity = async () => {
    try {
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const checkBackendHealth = async () => {
    try {
      await fetch(`${apiUrl}/ping`)
      setIsBackendAvailable(true);
    } catch {
      setIsBackendAvailable(false);
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

  return (
    <div className="space-y-6 min-h-[calc(100vh-12rem)]">
      {!isOnline && (
        <Alert variant="destructive">
          <AlertDescription>
            No internet connection. Please check your network connection.
          </AlertDescription>
        </Alert>
      )}
      {isOnline && !isBackendAvailable && (
        <Alert variant="destructive">
          <AlertDescription>
            Cannot connect to server. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      {isOnline && isBackendAvailable && (
        <Tabs defaultValue="trackers" className="w-full">
          <TabsList className="mb-4 bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="trackers">Trackers</TabsTrigger>
            <TabsTrigger value="archives">Archives</TabsTrigger>
            {/* <TabsTrigger value="statistics">Statistics</TabsTrigger> */}
          </TabsList>

          <TabsContent value="trackers" className="space-y-6">
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
              {activeTasks.map((task) => (
                <TimeTracker
                  key={task.id}
                  task={task}
                  session={activeSessions[task.id]}
                  onStart={() => handleSessionStart(task.id)}
                  onStop={() => handleSessionEnd(task.id)}
                  onArchive={handleArchiveTask}
                />
              ))}
            </div>
            <AddTaskDialog onAddTask={handleAddTask} />
          </TabsContent>

          <TabsContent value="archives" className="space-y-6">
            {archivedTasks.length === 0 ? (
              <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
                No archived trackers found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                {archivedTasks.map((task) => (
                  <ArchivedTracker
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* <TabsContent value="statistics">
            <StatisticsView tasks={tasks} />
          </TabsContent> */}
        </Tabs>
      )}
    </div>
  );
}
