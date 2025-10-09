"use client";

import { useEffect, useState } from "react";
import { ChartContainer, ChartLegend, ChartLegendItem } from "../ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface ProductivityData {
  date: string;
  score: number;
}

interface ProductivityTrendChartProps {
  taskId: string;
  timeRange: string;
  productivityData: ProductivityData[];
}

interface ChartData {
  date: string;
  productivity: number;
}

export default function ProductivityTrendChart({
  taskId,
  timeRange,
  productivityData,
}: ProductivityTrendChartProps) {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Transform API data for chart display
    const transformData = () => {
      if (!productivityData || productivityData.length === 0) {
        return [];
      }

      // Convert API data to chart format
      const chartData: ChartData[] = productivityData.map((item) => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return {
          date: formattedDate,
          productivity: item.score,
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
  }, [productivityData, taskId, timeRange]);

  // Custom tooltip
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
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl px-3 py-2 text-sm">
          <p className="font-medium text-foreground mb-1 text-xs">{`Date: ${label}`}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">
              Score: {payload[0].value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show message if no data available
  if (!productivityData || productivityData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No productivity data available</p>
          <p className="text-sm">
            Start tracking time to see your productivity trends
          </p>
        </div>
      </div>
    );
  }

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
            domain={[0, 150]}
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="productivity"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <ReferenceLine
            y={100}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: "Ideal Score",
              position: "insideBottomRight",
              fill: "#ef4444",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
