"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  // ChartTooltip, ChartTooltipContent
} from "../ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface TaskDistributionChartProps {
  timeRange: string;
}

export default function TaskDistributionChart({
  timeRange,
}: TaskDistributionChartProps) {
  const [data, setData] = useState<unknown[]>([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    // In a real app, this would be an API call with timeRange as parameter
    // Mock data generation
    const generateData = () => {
      return [
        { name: "Project Alpha", value: Math.floor(Math.random() * 40) + 10 },
        { name: "Project Beta", value: Math.floor(Math.random() * 30) + 5 },
        { name: "Documentation", value: Math.floor(Math.random() * 20) + 5 },
        { name: "Meetings", value: Math.floor(Math.random() * 15) + 5 },
        { name: "Other", value: Math.floor(Math.random() * 10) + 2 },
      ];
    };

    setData(generateData());
  }, [timeRange]);

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
          {/* <ChartTooltip
            content={
              <ChartTooltipContent
                className="bg-white p-2 border rounded shadow-sm"
                items={({ payload }) => {
                  return (
                    payload?.map((entry, index) => ({
                      label: entry.name,
                      value: `${entry.value} hours`,
                      color: COLORS[index % COLORS.length],
                    })) || []
                  );
                }}
              />
            }
          /> */}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
