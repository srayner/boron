"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import DashboardWidget from "../ui/DashboardWidget";
import { useEffect, useState } from "react";

type TaskCompletionData = {
  date: string; // formatted date string, e.g. '2025-06-01'
  count: number;
};

type Props = {
  groupBy?: "day" | "month";
  title?: string;
  startDate: string; // ISO date string, e.g. '2025-01-01'
  endDate: string; // ISO date string, e.g. '2025-06-15'
};

export default function TasksCompletedOverTime({
  groupBy = "day",
  title,
  startDate,
  endDate,
}: Props) {
  const [data, setData] = useState<TaskCompletionData[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const params = new URLSearchParams({
        groupBy,
        start: startDate,
        end: endDate,
      });
      const res = await fetch(
        `/api/tasks/completed-over-time?${params.toString()}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setData(null);
      }
    }
    fetchData();
  }, [groupBy, startDate, endDate]);

  if (!data) return null; // Or a loading spinner

  return (
    <DashboardWidget title={title ?? `Tasks Created vs Completed`}>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 0,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray=""
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => {
                const d = new Date(date);
                return groupBy === "month"
                  ? d.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                    }) // e.g. "Jun 2025"
                  : d.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    }); // e.g. "Jun 13"
              }}
            />
            <YAxis width={25} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                color: "var(--popover-foreground)",
                backgroundColor: "var(--popover)",
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: 10,
                fontSize: 14,
              }}
              cursor={{ stroke: "#8884d8", strokeWidth: 2 }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#666", fontSize: "12px" }}>{value}</span>
              )}
              verticalAlign="top"
              height={36}
              align="right"
            />

            <Line
              type="monotone"
              dataKey="created"
              stroke="var(--chart-1)"
              strokeWidth={3} // increase thickness
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="var(--chart-2)"
              strokeWidth={3} // increase thickness
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidget>
  );
}
