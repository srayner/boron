"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { ProjectType } from "@/types/entities";

const projectTypeNames: Record<ProjectType | "ALL", string> = {
  ALL: "All",
  AUTOMATION: "Automation",
  DESIGN: "Design",
  GENERAL: "General",
  ELECTRONICS: "Electronics",
  MAKER: "Maker",
  REPAIR: "Repair",
  WEBAPP: "Web App",
  WEBSITE: "Website",
  WRITING: "Writing",
  OTHER: "Other",
};

type ProjectListHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
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
        placeholder="Search projects..."
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
            {Object.entries(projectTypeNames).map(([key, label]) => (
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

        {/* Create Button */}
        <Button variant="default">+ New Project</Button>
      </div>
    </div>
  );
};

export default ProjectListHeader;
