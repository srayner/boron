"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PaginationControls from "@/components/ui/PaginationControls";
import { Folders, Flag, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchEntityType = "project" | "milestone" | "task" | "cost";

interface SearchResult {
  id: string;
  entityId: string;
  entityType: SearchEntityType;
  title: string;
  content: string;
  date: string;
}

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const [input, setInput] = useState("");

  const limit = 10;
  const skip = (page - 1) * limit;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const debounceRef = useRef<number | null>(null);

  const fetchSearchResults = async () => {
    try {
      const params = new URLSearchParams({
        search,
        limit: limit.toString(),
        skip: skip.toString(),
        orderBy: "date",
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();
      setResults(data.results ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [page, search]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);

      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        setSearch(value);
        setPage(1);

        const params = new URLSearchParams(searchParams.toString());
        params.set("search", value);
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, 250);
    },
    [router, searchParams, pathname]
  );

  // Map entityType to path and icon, similar to Due Items
  const basePaths: Record<SearchEntityType, string> = {
    project: "/projects",
    milestone: "/milestones",
    task: "/tasks",
    cost: "/costs",
  };

  function getIcon(type: SearchEntityType) {
    switch (type) {
      case "project":
        return <Folders className="w-5 h-5" />;
      case "milestone":
        return <Flag className="w-5 h-5" />;
      case "task":
        return <CheckSquare className="w-5 h-5" />;
      case "cost":
        return <></>; // optionally add an icon for costs
      default:
        return <></>;
    }
  }

  return (
    <div className="max-w-4xl mx-auto my-4">
      <Input
        type="search"
        placeholder="Search for anything..."
        className="flex-1"
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
      />

      {results.map((result) => (
        <div
          key={result.id}
          className="flex flex-col gap-2 my-4 max-w-4xl mx-auto"
        >
          <Link
            href={`${basePaths[result.entityType]}/${result.entityId}`}
            className="flex items-center gap-2 text-2xl text-primary"
          >
            {getIcon(result.entityType)}
            {result.title}
          </Link>
          <div className="text-foreground">{result.content}</div>
          <div className="text-muted-foreground text-sm">
            Updated {new Date(result.date).toLocaleDateString()}
          </div>
          <hr className="mt-4" />
        </div>
      ))}

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
