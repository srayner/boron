"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Flag } from "lucide-react";
import { NextPage } from "next";
import CostsTable from "@/components/costs/CostsTable";
import { Cost } from "@/types/entities";
import { useEffect, useState } from "react";
import PaginationControls from "@/components/ui/PaginationControls";

const CostsListPage: NextPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const headerText = "All Costs";

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search] = useState(initialSearch);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [costs, setCosts] = useState<Cost[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `/api/costs?limit=${limit}&skip=${skip}&orderBy=date&orderDir=desc&search=${search}`
      );
      if (!res.ok) throw new Error("Failed to fetch costs");
      const { costs, totalCount } = await res.json();
      setCosts(costs);
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

      <CostsTable costs={costs} onDelete={() => {}} returnTo="costs" />

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

export default CostsListPage;
