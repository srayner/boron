"use client";

import { NextPage } from "next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Flag } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import SearchInput from "@/components/ui/SearchInput";
import MilestonesTable from "@/components/milestones/MilestonesTable";
import PaginationControls from "@/components/ui/PaginationControls";
import { useDeleteEntity } from "@/hooks/useDeleteEntity";
import { Milestone } from "@/types/entities";

const MilestonesListPage: NextPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDue = searchParams.has("due");
  const headerText = isDue ? "Due Milestones" : "All Milestones";

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        skip: String(skip),
        orderBy: "dueDate",
        orderDir: "asc",
        search,
      });
      if (isDue === true) params.set("dueDateFilter", "with");
      const res = await fetch(`/api/milestones?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const { milestones, totalCount } = await res.json();
      setMilestones(milestones);
      setTotalCount(totalCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, searchParams.toString()]);

  const { deleteInfo, setDeleteInfo, handleConfirmDelete } = useDeleteEntity({
    refresh: fetchTasks,
  });

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
        {/* Right side */}
        <div className="flex items-center gap-2">
          <SearchInput
            search={search}
            placeholder={`Search ${headerText}...`}
            onSearchChange={(value) => {
              setSearch(value);
              const params = new URLSearchParams(searchParams.toString());
              params.set("search", value);
              params.set("page", "1"); // reset to first page on search
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
              setPage(1);
            }}
          />
        </div>
      </div>

      <Separator className="my-3" />

      <MilestonesTable
        milestones={milestones}
        onDelete={() => {}}
        returnTo="milestones"
        emptyMessage="No milestones found."
      />

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

      <ConfirmationModal
        open={!!deleteInfo}
        title={`Delete ${deleteInfo?.type ?? ""}`}
        message={`Are you sure you want to delete ${deleteInfo?.type}: ${deleteInfo?.item.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteInfo(null)}
      />
    </div>
  );
};

export default MilestonesListPage;
