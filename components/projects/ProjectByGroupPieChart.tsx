"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import DashboardWidget from "../ui/DashboardWidget";
import { useEffect, useState } from "react";
import { translate } from "@/lib/utils";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type GroupData = {
  [key: string]: string | number;
  count: number;
};

type Props = {
  field: "type" | "status" | "priority";
  title?: string;
};

export default function ProjectGroupByPieChart({ field, title }: Props) {
  const [data, setData] = useState<GroupData[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/projects/group-by?field=${field}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    }
    fetchData();
  }, [field]);

  if (!data) return null; // or a loading spinner

  return (
    <DashboardWidget title={title ?? `Projects by ${field}`}>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                percent,
                index,
                name,
                payload,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 45; // push 40px outside the pie
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fontSize={14}
                    fill="#666"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {translate(name)}: {payload.count}
                  </text>
                );
              }}
              outerRadius={90}
              fill="#8884d8"
              stroke="#333"
              nameKey={field}
              dataKey={"count"}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, translate(String(name))]}
              itemStyle={{ color: "var(--popover-foreground)" }}
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderRadius: 8,
                border: "1px solid var(--border)",
                padding: 10,
                fontSize: 14,
              }}
              wrapperStyle={{ color: "var(--popover-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidget>
  );
}
