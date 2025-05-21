"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TimeTracker from "./time-tracker";
import ArchivedTracker from "./archived-tracker";
// import StatisticsView from "./statistics-view";
import type { Tracker, ActiveSession, NewTracker } from "../lib/types";
import AddTaskDialog from "./add-task";
import useApiClient from "../hooks/useApiClient";

export default function TimeTrackingDashboard() {
  const [tasks, setTasks] = useState<Tracker[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Record<string, ActiveSession>
  >({});

  const api = useApiClient();

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

  useEffect(() => {
    fetchTasks();
    fetchActiveSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="space-y-6">
      <Tabs defaultValue="trackers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="trackers">Trackers</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
          {/* <TabsTrigger value="statistics">Statistics</TabsTrigger> */}
        </TabsList>

        <TabsContent value="trackers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-12 text-gray-500">
              No archived trackers found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
