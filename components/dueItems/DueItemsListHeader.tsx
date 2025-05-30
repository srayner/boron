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
import { useState } from "react";

const typeNames: Record<string, string> = {
  ALL: "All",
  PROJECT: "Project",
  AUTOMATION: "Milestone",
  DESIGN: "Task",
};

type DueItemsListHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

const DueItemsListHeader: React.FC<DueItemsListHeaderProps> = ({
  search,
  onSearchChange,
}) => {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("name");

  const onSelectType = (newSelectedType: string) => {
    setSelectedType(newSelectedType);
  };

  const onSelectSort = (newSelectedSort: string) => {
    setSelectedSort(newSelectedSort);
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
        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Type
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(typeNames).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={selectedType === key}
                onCheckedChange={() => onSelectType(key)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={selectedSort === "name"}
              onCheckedChange={() => onSelectSort("name")}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedSort === "updatedAt"}
              onCheckedChange={() => onSelectSort("updatedAt")}
            >
              Last Updated
            </DropdownMenuCheckboxItem>
            {/* Priority can’t be sorted unless it's a separate sortable field */}
            {/* <DropdownMenuItem>Priority</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DueItemsListHeader;
