"use client";

import { useEffect, useState } from "react";
import { ChartContainer } from "../ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

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

interface TaskDistributionChartProps {
  totalHours: TotalHours | null;
  trackerHours: TrackerHours[];
  selectedTask: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function TaskDistributionChart({
  totalHours,
  trackerHours,
  selectedTask,
}: TaskDistributionChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
  ];

  useEffect(() => {
    if (selectedTask === "all") {
      // Show individual tracker hours
      if (trackerHours.length === 0) {
        setData([]);
        return;
      }

      const chartData: ChartData[] = trackerHours
        .filter((tracker) => tracker.totalHours > 0) // Hide trackers with 0 hours
        .map((tracker, index) => ({
          name: tracker.trackerName,
          value: Number(tracker.totalHours.toFixed(1)),
          color: COLORS[index % COLORS.length],
        }));

      setData(chartData);
    } else {
      // Show hours worked vs target/remaining for individual tracker
      if (!totalHours) {
        setData([]);
        return;
      }

      const chartData: ChartData[] = [
        {
          name: "Hours Worked",
          value: Number(totalHours.totalHoursWorked.toFixed(1)),
          color: "#3b82f6", // Blue
        },
        {
          name: totalHours.isAhead ? "Extra Hours" : "Remaining Hours",
          value: Number(Math.abs(totalHours.hoursDifference).toFixed(1)),
          color: totalHours.isAhead ? "#10b981" : "#ef4444", // Green if ahead, Red if behind
        },
      ];

      // Only show remaining/extra hours if there's a difference
      if (totalHours.hoursDifference === 0) {
        setData([chartData[0]]); // Only show hours worked
      } else {
        setData(chartData);
      }
    }
  }, [totalHours, trackerHours, selectedTask]);

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl px-3 py-2 text-sm">
          <p className="font-medium text-foreground mb-1 text-xs">
            {data.name}
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-xs text-muted-foreground">
              {data.value} hours
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show message if no data available
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">
            {selectedTask === "all"
              ? "Start tracking time on your tasks to see the distribution"
              : "Start tracking time to see your hours distribution"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer>
      {selectedTask !== "all" && totalHours && (
        <div className="mb-4 text-center">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total Worked</p>
              <p className="text-lg font-semibold text-blue-600">
                {totalHours.totalHoursWorked.toFixed(1)}h
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-lg font-semibold text-muted-foreground">
                {totalHours.totalTargetHours.toFixed(1)}h
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-sm font-medium ${
                totalHours.isAhead ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalHours.isAhead ? "🎉 " : "⏰ "}
              {totalHours.isAhead
                ? `${totalHours.hoursDifference.toFixed(1)}h ahead of target!`
                : `${Math.abs(totalHours.hoursDifference).toFixed(
                    1
                  )}h behind target`}
            </p>
          </div>
        </div>
      )}

      {selectedTask === "all" && (
        <div className="mb-4 text-center">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Total Hours Across All Tasks
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {totalHours?.totalHoursWorked.toFixed(1) || 0}h
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Total Target Hours Across All Tasks
              </p>
              <p className="text-lg font-semibold text-muted-foreground">
                {totalHours?.totalTargetHours.toFixed(1) || 0}h
              </p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer
        width="100%"
        height={selectedTask === "all" ? "80%" : "70%"}
      >
        <PieChart margin={{ top: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend margin={{ top: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
