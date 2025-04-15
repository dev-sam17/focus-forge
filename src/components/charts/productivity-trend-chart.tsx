"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
} from "../ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ProductivityTrendChartProps {
  taskId: string;
  timeRange: string;
}

export default function ProductivityTrendChart({
  taskId,
  timeRange,
}: ProductivityTrendChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call with taskId and timeRange as parameters
    // Mock data generation
    const generateData = () => {
      const days =
        timeRange === "day"
          ? 24
          : // Hours in a day
          timeRange === "week"
          ? 7
          : timeRange === "month"
          ? 30
          : 12; // Months in a year

      const result = [];
      const now = new Date();

      let previousProductivity = 50 + Math.random() * 20;

      for (let i = 0; i < days; i++) {
        const date = new Date(now);

        let label;
        if (timeRange === "day") {
          date.setHours(date.getHours() - i);
          label = date.toLocaleTimeString("en-US", { hour: "2-digit" });
        } else if (timeRange === "year") {
          date.setMonth(date.getMonth() - i);
          label = date.toLocaleDateString("en-US", { month: "short" });
        } else {
          date.setDate(date.getDate() - i);
          label = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }

        // Generate productivity score with some continuity
        const change = (Math.random() - 0.5) * 15;
        previousProductivity = Math.max(
          0,
          Math.min(100, previousProductivity + change)
        );

        result.unshift({
          date: label,
          productivity: Number.parseFloat(previousProductivity.toFixed(1)),
        });
      }

      return result;
    };

    setData(generateData());
  }, [taskId, timeRange]);

  return (
    <ChartContainer>
      <ChartLegend>
        <ChartLegendItem name="Productivity Score" color="#10b981" />
      </ChartLegend>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[0, 100]}
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="bg-white p-2 border rounded shadow-sm"
                items={({ payload }) => {
                  return (
                    payload?.map((entry) => ({
                      label: "Productivity",
                      value: `${entry.value}%`,
                      color: "#10b981",
                    })) || []
                  );
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="productivity"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
