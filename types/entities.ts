import { string } from "zod";

export type ProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ProjectType =
  | "AUTOMATION"
  | "DESIGN"
  | "GENERAL"
  | "ELECTRONICS"
  | "MAKER"
  | "REPAIR"
  | "WEBAPP"
  | "WEBSITE"
  | "WRITING"
  | "OTHER";
export type TaskStatus =
  | "TODO"
  | "INPROGRESS"
  | "BLOCKED"
  | "DONE"
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
  note: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
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
  completedAt: string;
  projectId: string;
  parentTask: Task;
  subTasks: Task[];
  archived: boolean;
  order: number;
  tags: Tag[];
  costs: Cost[];
  milestones: Milestone[];
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
  completionPercent: number;
  archived: boolean;
  tags: Tag[];
  tasks: Task[];
  costs: Cost[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}
