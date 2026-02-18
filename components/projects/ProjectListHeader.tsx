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
import { ProjectStatus, ProjectType } from "@/types/entities";

const projectStatusNames: Record<ProjectStatus | "ALL", string> = {
  ALL: "All",
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

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
  status: ProjectStatus | "ALL";
  type: ProjectType | "ALL";
  sort: "name" | "updatedAt" | "priority";
  onSearchChange: (
    value: string,
    status: ProjectStatus | "ALL",
    type: ProjectType | "ALL",
    sort: "name" | "updatedAt" | "priority",
  ) => void;
};

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({
  search,
  status,
  type,
  sort,
  onSearchChange,
}) => {
  const [text, setText] = useState<string>(search);

  const onSearchTextChange = (newText: string) => {
    setText(newText);
    onSearchChange(newText, status, type, sort);
  };

  const onSelectStatus = (newStatus: ProjectStatus | "ALL") => {
    onSearchChange(text, newStatus, type, sort);
  };

  const onSelectType = (newType: ProjectType | "ALL") => {
    onSearchChange(text, status, newType, sort);
  };

  const onSelectSort = (newSort: "name" | "updatedAt" | "priority") => {
    onSearchChange(text, status, type, newSort);
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
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(projectStatusNames) as (ProjectStatus | "ALL")[]).map(
              (key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={status === key}
                  onCheckedChange={() => onSelectStatus(key)}
                >
                  {projectStatusNames[key]}
                </DropdownMenuCheckboxItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Type
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(projectTypeNames) as (ProjectType | "ALL")[]).map(
              (key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={type === key}
                  onCheckedChange={() => onSelectType(key)}
                >
                  {projectTypeNames[key]}
                </DropdownMenuCheckboxItem>
              ),
            )}
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
