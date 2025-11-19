"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/types/entities";
import { TaskSummary } from "@/types/entities";

export function useDashboardTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks/summary");
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        const data = await res.json();
        setTasks(data.tasks || []);
        setSummary(data.summary || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return { tasks, summary, loading, error };
}