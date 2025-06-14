import type { TaskStatus, TaskPriority } from "@prisma/client";

type SeedTask = {
  name: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
};

type SeedMilestone = {
  name: string;
  tasks?: SeedTask[];
};

type SeedProject = {
  name: string;
  type: string;
  milestones?: SeedMilestone[];
};

export const projects: SeedProject[] = [
  {
    name: "Argon - Inventory Management",
    type: "WEBAPP",
    milestones: [
      {
        name: "Manufacturers CRUD",
        tasks: [
          { name: "Create Manufacturer" },
          { name: "List Manufacturers" },
          { name: "Edit Manufacturer" },
          { name: "Delete Manufacturer" },
          { name: "Task to delete" },
          { name: "Task to be completed" },
          {
            name: "Task to be un-completed",
            status: "COMPLETED" as TaskStatus,
          },
          {
            name: "In Progress Task",
            status: "IN_PROGRESS",
          },
          {
            name: "Completed Task",
            status: "COMPLETED",
          },
        ],
      },
      {
        name: "Second Milestone",
      },
    ],
  },
];
