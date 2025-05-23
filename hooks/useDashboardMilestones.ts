"use client";

import { useEffect, useState } from "react";
import type { Milestone } from "@/types/entities";
import { MilestoneSummary } from "@/types/entities";

export function useDashboardMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [summary, setSummary] = useState<MilestoneSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await fetch("/api/milestones/summary");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const data = await res.json();
        setMilestones(data.milestones || []);
        setSummary(data.summary || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMilestones();
  }, []);

  return { milestones, summary, loading, error };
}
