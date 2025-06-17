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

type ProgressData = {
  percentRange: string; // "0%", "10%", ...
  count: number;
};

export default function ProjectProgressGraph() {
  const [data, setData] = useState<ProgressData[]>([]);

  useEffect(() => {
    async function fetchProgress() {
      const res = await fetch("/api/projects/progress-summary");
      if (res.ok) {
        const { data } = await res.json();

        // Expected ranges as percentages
        const allRanges = [
          "0%",
          "10%",
          "20%",
          "30%",
          "40%",
          "50%",
          "60%",
          "70%",
          "80%",
          "90%",
          "100%",
        ];

        // Convert your API percentRange (like '0-9') to the format '0%', '10%' etc.
        // So first map the API data keys from '0-9' -> '0%', '10-19' -> '10%', etc.
        // Then fill missing ranges with count=0

        // Helper to convert API percentRange to label
        function convertRangeToPercentLabel(range: string) {
          if (range === "100") return "100%";
          const start = range.split("-")[0];
          return `${start}%`;
        }

        // Map API data keys to percentage labels
        const mappedWithPercentLabels = data.map((d: ProgressData) => ({
          percentRange: convertRangeToPercentLabel(d.percentRange),
          count: d.count,
        }));

        const filledData: ProgressData[] = allRanges.map((range) => {
          const found = mappedWithPercentLabels.find(
            (d: ProgressData) => d.percentRange === range
          );
          return found ?? { percentRange: range, count: 0 };
        });

        setData(filledData);
      }
    }
    fetchProgress();
  }, []);

  return (
    <DashboardWidget title="Project Progress">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <XAxis dataKey="percentRange" tick={{ fontSize: 12 }} />
            <YAxis
              width={25}
              padding={{ top: 5 }}
              allowDecimals={false}
              tick={{ fontSize: 12 }}
            />
            <Bar dataKey="count" fill="var(--primary)">
              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardWidget>
  );
}
