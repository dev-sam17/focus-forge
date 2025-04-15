"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  // ChartTooltip,
  // ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
} from "../ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DailyHoursChartProps {
  taskId: string;
  timeRange: string;
}

export default function DailyHoursChart({
  taskId,
  timeRange,
}: DailyHoursChartProps) {
  const [data, setData] = useState<unknown[]>([]);
  const [targetHours, setTargetHours] = useState<number>(0);

  useEffect(() => {
    // In a real app, this would be an API call with taskId and timeRange as parameters
    // Mock data generation
    const generateData = () => {
      const days =
        timeRange === "day"
          ? 1
          : timeRange === "week"
          ? 7
          : timeRange === "month"
          ? 30
          : 365;

      const result: Array<{ date: string; hours: number }> = [];
      const now = new Date();

      // Set a mock target hours based on taskId
      const mockTargetHours =
        taskId === "all"
          ? 6
          : taskId === "task-1"
          ? 4
          : taskId === "task-2"
          ? 6
          : 2;
      setTargetHours(mockTargetHours);

      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        // Generate random hours between 0-8 hours
        const hours = Math.random() * 8;

        result.unshift({
          date: formattedDate,
          hours: Number.parseFloat(hours.toFixed(1)),
        });
      }

      return result.slice(0, 7); // Only show last 7 days for any time range
    };

    setData(generateData());
  }, [taskId, timeRange]);

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
          {/* <ChartTooltip
            content={
              <ChartTooltipContent
                className="bg-white p-2 border rounded shadow-sm"
                items={({ payload }) => {
                  return [
                    ...(payload?.map((entry: { value: any; }) => ({
                      label: "Hours",
                      value: `${entry.value} hrs`,
                      color: "#3b82f6",
                    })) || []),
                    {
                      label: "Target",
                      value: `${targetHours} hrs`,
                      color: "#ef4444",
                    },
                  ];
                }}
              />
            }
          /> */}
          <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
