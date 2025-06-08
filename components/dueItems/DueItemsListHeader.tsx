"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const sortNames: Record<string, string> = {
  dueDate: "Due Date",
  name: "Name",
};

type DueItemsListHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
};

const DueItemsListHeader: React.FC<DueItemsListHeaderProps> = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
}) => {
  const [selectedSort, setSelectedSort] = useState<string>("name");

  // Sync local state when props change
  useEffect(() => {
    setSelectedSort(sort);
  }, [sort]);

  const onSelectSort = (newSelectedSort: string) => {
    setSelectedSort(newSelectedSort);
    onSortChange(newSelectedSort);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
      {/* Left side: Search */}
      <Input
        type="search"
        placeholder="Search due items..."
        className="flex-1"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Right side: Controls */}
      <div className="flex gap-2 flex-wrap">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(sortNames).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={selectedSort === key}
                onCheckedChange={() => onSelectSort(key)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DueItemsListHeader;
