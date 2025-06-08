"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatDate, translate } from "@/lib/utils";
import Link from "next/link";
import PaginationControls from "@/components/ui/PaginationControls";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DueItemsListHeader from "@/components/dueItems/DueItemsListHeader";
import { CheckSquare, Flag, Folders } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DueItemType = "Project" | "Milestone" | "Task";
interface DueItem {
  id: string;
  type: DueItemType;
  status: string;
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

  const initialSort = searchParams.get("sort") ?? "dueDate";
  const [sort, setSort] = useState<string>(initialSort);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchDueItems = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
        orderBy: sort,
        orderDir: "asc",
        search,
      });
      const res = await fetch(`/api/due-items?${params.toString()}`);
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
  }, [page, search, sort]);

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

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSortChange(value: string) {
    setSort(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="max-w-4xl mx-auto my-4">
      <DueItemsListHeader
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
      />
      {dueItems.map((dueItem) => {
        return (
          <div
            key={dueItem.id}
            className="flex flex-col gap-4 my-4 max-w-4xl mx-auto"
          >
            <div>
              <Link
                href={`${getBasePath(dueItem.type)}/${dueItem.id}`}
                className="flex items-center gap-2 text-2xl text-primary"
              >
                {dueItem.type === "Project" && <Folders className="w-5 h-5" />}
                {dueItem.type === "Milestone" && <Flag className="w-5 h-5" />}
                {dueItem.type === "Task" && <CheckSquare className="w-5 h-5" />}
                {dueItem.name}
              </Link>
              <Badge className="bg-orange-100 text-orange-700">
                {translate(dueItem.status)}
              </Badge>
            </div>
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
