"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
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

  console.log(data);
  return (
    <DashboardWidget title={title ?? `Tasks Completed Over Time`}>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 14 }}
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
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={3} // increase thickness
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidget>
  );
}
