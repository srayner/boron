type ReturnTarget =
  | "project:milestones"
  | "project:costs"
  | "project:tasks"
  | "project"
  | "projects"
  | "milestone"
  | "milestones"
  | "task"
  | "tasks"
  | "cost"
  | "costs";

type ReturnContext = {
  projectId?: string;
  milestoneId?: string;
  taskId?: string;
  costId?: string;
};

const returnMap: Record<ReturnTarget, (ctx: ReturnContext) => string> = {
  "project:milestones": (ctx) => `/projects/${ctx.projectId}?tab=milestones`,
  "project:costs": (ctx) => `/projects/${ctx.projectId}?tab=costs`,
  "project:tasks": (ctx) => `/projects/${ctx.projectId}?tab=tasks`,
  project: (ctx) => `/projects/${ctx.projectId}`,
  projects: () => `/projects`,
  milestone: (ctx) => `/milestones/${ctx.milestoneId}`,
  milestones: () => `/milestones`,
  task: (ctx) => `/tasks/${ctx.taskId}`,
  tasks: () => `/tasks`,
  cost: (ctx) => `/costs/${ctx.costId}`,
  costs: () => `/costs`,
};

export function getReturnUrl(
  returnTo: string | undefined,
  ctx: ReturnContext
): string {
  const key = returnTo as ReturnTarget;
  return returnMap[key]?.(ctx) ?? "/dashboard";
}
