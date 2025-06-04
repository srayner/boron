"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Flag } from "lucide-react";
import { NextPage } from "next";
import TasksTable from "@/components/tasks/TasksTable";
import { useEffect, useState } from "react";
import { Task } from "@/types/entities";
import PaginationControls from "@/components/ui/PaginationControls";

const TasksListPage: NextPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDue = searchParams.has("due");
  const headerText = isDue ? "Due Tasks" : "All Tasks";

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search] = useState(initialSearch);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `/api/tasks?limit=${limit}&skip=${skip}&orderBy=dueDate&orderDir=desc&search=${search}`
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const { tasks, totalCount } = await res.json();
      setTasks(tasks);
      setTotalCount(totalCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <Flag className="h-12 w-12 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">
              {headerText}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground"></div>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      <TasksTable tasks={tasks} onDelete={() => {}} returnTo="milestones" />

      <PaginationControls
        currentPage={page}
        pageSize={limit}
        totalCount={totalCount ?? 0}
        onPageChange={(newPage) => {
          setPage(newPage);
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", newPage.toString());
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      />
    </div>
  );
};

export default TasksListPage;
