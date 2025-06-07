"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import PaginationControls from "@/components/ui/PaginationControls";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DueItemsListHeader from "@/components/dueItems/DueItemsListHeader";
import { CheckSquare, Flag, Folders } from "lucide-react";

type DueItemType = "Project" | "Milestone" | "Task";
interface DueItem {
  id: string;
  type: DueItemType;
  name: string;
  description: string;
  dueDate: string;
  updatedAt: string;
}

export default function DueItemsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchDueItems = async () => {
    try {
      const res = await fetch(
        `/api/due-items?limit=${limit}&skip=${skip}&orderBy=dueDate&orderDir=asc&search=${search}`
      );
      if (!res.ok) throw new Error("Failed to fetch due items");
      const { dueItems, totalCount } = await res.json();
      setDueItems(dueItems);
      setTotalCount(totalCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDueItems();
  }, [page, search]);

  const basePaths: Record<DueItemType, string> = {
    Project: "/projects",
    Milestone: "/milestones",
    Task: "/tasks",
  };

  function getBasePath(type: string): string {
    if (type === "Project" || type === "Milestone" || type === "Task") {
      return basePaths[type];
    }
    throw new Error(`Unknown dueItem type: ${type}`);
  }

  return (
    <div className="max-w-4xl mx-auto my-4">
      <DueItemsListHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          const params = new URLSearchParams(searchParams.toString());
          params.set("search", value);
          params.set("page", "1"); // reset to first page on search
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          setPage(1);
        }}
      />
      {dueItems.map((dueItem) => {
        return (
          <div
            key={dueItem.id}
            className="flex flex-col gap-4 my-4 max-w-4xl mx-auto"
          >
            <Link
              href={`${getBasePath(dueItem.type)}/${dueItem.id}`}
              className="flex items-center gap-2 text-2xl text-primary"
            >
              {dueItem.type === "Project" && <Folders className="w-5 h-5" />}
              {dueItem.type === "Milestone" && <Flag className="w-5 h-5" />}
              {dueItem.type === "Task" && <CheckSquare className="w-5 h-5" />}
              {dueItem.name}
            </Link>
            <div className="text-foreground">{dueItem.description}</div>
            <div className="flex gap-4 text-muted-foreground">
              <span>Due on {formatDate(dueItem.dueDate)}</span>
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(dueItem.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <hr className="mt-4" />
          </div>
        );
      })}
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
}
