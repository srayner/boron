"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import DashboardWidget from "../ui/DashboardWidget";
import { useEffect, useState } from "react";
import { translate } from "@/lib/utils";

type GroupData = {
  [key: string]: string | number;
  count: number;
};

type Props = {
  field: "type" | "status" | "priority";
  title?: string;
};

export default function ProjectGroupByGraph({ field, title }: Props) {
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
          <BarChart data={data}>
            <XAxis
              dataKey={field}
              tickFormatter={(value) => translate(value)}
            />
            <YAxis width={25} allowDecimals={false} />
            <Bar dataKey="count" fill="var(--primary)">
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidget>
  );
}
