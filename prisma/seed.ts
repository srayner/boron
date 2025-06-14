import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createTask } from "@/services/tasks";
import { createMilestone } from "@/services/milestones";
import { createProject } from "@/services/projects";
import { projects } from "./seedData";

const prisma = new PrismaClient();

async function clearData() {
  // Models should be cleared in the correct order, dependencies first.
  const models: (keyof PrismaClient)[] = [
    "cost",
    "task",
    "milestone",
    "project",
    "user",
    "account",
  ];

  for (const model of models) {
    await (prisma[model] as any).deleteMany({});
  }

  console.log("Data has been cleared!");
}

async function seedUsers() {
  const hashedUserPassword = await bcrypt.hash(
    process.env.USER_PASSWORD_USER || "",
    10
  );
  const hashedAdminPassword = await bcrypt.hash(
    process.env.USER_PASSWORD_ADMIN || "",
    10
  );

  const now = new Date();
  await prisma.user.createMany({
    data: [
      {
        name: "Example User",
        email: "user@example.com",
        emailVerified: now,
        password: hashedUserPassword,
        role: "USER",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        emailVerified: now,
        password: hashedAdminPassword,
        role: "ADMIN",
      },
    ],
  });

  console.log("Users have been created with hashed passwords!");
}

export async function seedProjects() {
  for (const project of projects) {
    const createdProject = await createProject({
      name: project.name,
      type: project.type,
    });

    for (const milestone of project.milestones ?? []) {
      const createdMilestone = await createMilestone({
        name: milestone.name,
        projectId: createdProject.id,
      });

      for (const task of milestone.tasks ?? []) {
        await createTask({
          name: task.name,
          projectId: createdProject.id,
          milestoneId: createdMilestone.id,
          status: task.status ?? "IN_PROGRESS",
          priority: task.priority ?? "MEDIUM",
          progress: task.progress ?? 0,
        });
      }
    }
  }

  console.log("Projects have been seeded!");
}

async function main() {
  await clearData();
  await seedProjects();
  await seedUsers();

  console.log("All data has been seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
