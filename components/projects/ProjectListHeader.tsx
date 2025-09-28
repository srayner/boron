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
import { projectTypes, ProjectType } from "@/types/entities";

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
  type: ProjectType | "ALL";
  sort: "name" | "updatedAt" | "priority";
  onSearchChange: (
    value: string,
    type: ProjectType | "ALL",
    sort: "name" | "updatedAt" | "priority"
  ) => void;
};

const typeOptions: (ProjectType | "ALL")[] = ["ALL", ...projectTypes];
const sortOptions = ["name", "updatedAt", "priority"];

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
  search,
  type,
  sort,
  onSearchChange,
}) => {
  const [text, setText] = useState<string>(search);

  const onSearchTextChange = (newText: string) => {
    setText(newText);
    onSearchChange(newText, type, sort);
  };

  const onSelectType = (newType: string) => {
    onSearchChange(text, newType, sort);
  };

  const onSelectSort = (newSort: string) => {
    onSearchChange(text, type, newSort);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
      {/* Left side: Search */}
      <Input
        type="search"
        placeholder="Search projects..."
        className="flex-1"
        value={text}
        onChange={(e) => onSearchTextChange(e.target.value)}
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
          <DropdownMenuContent align="end">
            {Object.entries(projectTypeNames).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={type === key}
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
              checked={sort === "name"}
              onCheckedChange={() => onSelectSort("name")}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sort === "priority"}
              onCheckedChange={() => onSelectSort("priority")}
            >
              Priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sort === "updatedAt"}
              onCheckedChange={() => onSelectSort("updatedAt")}
            >
              Last Updated
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Button */}
        <Button variant="default">+ New Project</Button>
      </div>
    </div>
  );
};

export default ProjectListHeader;
