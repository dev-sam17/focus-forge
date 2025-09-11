"use client";

import { useEffect, useState } from "react";
import { ChartContainer, ChartLegend, ChartLegendItem } from "../ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";

interface DailyTotal {
  date: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
}

interface DailyHoursChartProps {
  taskId: string;
  timeRange: string;
  dailyTotals: DailyTotal[];
  targetHours: number;
}

interface ChartData {
  date: string;
  hours: number;
}

export default function DailyHoursChart({
  taskId,
  timeRange,
  dailyTotals,
  targetHours,
}: DailyHoursChartProps) {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Transform API data for chart display
    const transformData = () => {
      if (!dailyTotals || dailyTotals.length === 0) {
        return [];
      }

      // Convert API data to chart format
      const chartData: ChartData[] = dailyTotals.map((total) => {
        const date = new Date(total.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return {
          date: formattedDate,
          hours: Number.parseFloat(total.totalHours.toFixed(1)),
        };
      });

      // Sort by date to ensure proper order
      chartData.sort((a, b) => {
        const dateA = new Date(a.date + ", 2024");
        const dateB = new Date(b.date + ", 2024");
        return dateA.getTime() - dateB.getTime();
      });

      return chartData;
    };

    setData(transformData());
  }, [dailyTotals, taskId, timeRange]);

  // Show message if no data available
  if (!dailyTotals || dailyTotals.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">
            Start tracking time to see your daily hours chart
          </p>
        </div>
      </div>
    );
  }

  // Custom tooltip content
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/70 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl px-3 py-2 text-sm">
          <p className="font-medium text-foreground mb-1 text-xs">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">
                {payload[0].value} hrs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">
                Target: {targetHours} hrs
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartLegend>
        <ChartLegendItem name="Hours Worked" color="#3b82f6" />
        <ChartLegendItem name="Target Hours" color="#ef4444" />
      </ChartLegend>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
          />
          <ReferenceLine
            y={targetHours}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: "Target",
              position: "insideBottomRight",
              fill: "#ef4444",
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            animationDuration={150}
          />
          <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
