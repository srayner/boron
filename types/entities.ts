export type ProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const projectTypes = [
  "AUTOMATION",
  "DESIGN",
  "GENERAL",
  "ELECTRONICS",
  "MAKER",
  "REPAIR",
  "WEBAPP",
  "WEBSITE",
  "WRITING",
  "OTHER",
] as const;
export type ProjectType = (typeof projectTypes)[number];

export const projectSortOptions = ["name", "updatedAt", "priority"] as const;
export type ProjectSortOption = (typeof projectSortOptions)[number];

export type TaskStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type CostType =
  | "PARTS"
  | "LABOR"
  | "SOFTWARE"
  | "TOOLS"
  | "CONSUMABLES"
  | "TRAVEL"
  | "MISC";
export type RelationshipType = "BLOCKS" | "DEPENDS_ON" | "RELATED";
export type MilestoneStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cost {
  id: string;
  amount: number;
  type: CostType;
  name?: string;
  description?: string;
  date: string;
  projectId: string;
  project: Project;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  order: number;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  projectId: string;
  project: Project;
  tasks: Task[];
  tags: Tag[];
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate: string;
  progress: number;
  completedAt: string;
  projectId: string;
  project: Project;
  parentTask: Task;
  subTasks: Task[];
  archived: boolean;
  order: number;
  tags: Tag[];
  costs: Cost[];
  milestone: Milestone | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  budget: number;
  actualCost: number;
  progress: number;
  archived: boolean;
  tags: Tag[];
  tasks: Task[];
  costs: Cost[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneSummary {
  hasAnyMilestones: boolean;
  hasCompletedMilestones: boolean;
  hasUndatedOpenMilestones: boolean;
  hasUpcomingMilestones: boolean;
  overdueCount: number;
}

export interface SystemSetting {
  key: string;
  value: number | string;
}

export interface UserPreference {
  key: string;
  value: number | string;
}
