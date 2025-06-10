import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

async function seedProjects() {
  const projects = [
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
          ],
        },
        {
          name: "Second Milestone",
        },
      ],
    },
  ];

  for (const projectData of projects) {
    const createdProject = await prisma.project.create({
      data: {
        name: projectData.name,
      },
    });
    if (projectData.milestones) {
      for (const milestoneData of projectData.milestones) {
        const createdMilestone = await prisma.milestone.create({
          data: {
            name: milestoneData.name,
            projectId: createdProject.id,
          },
        });
        if (milestoneData.tasks) {
          for (const taskData of milestoneData.tasks) {
            const createdTask = await prisma.task.create({
              data: {
                name: taskData.name,
                projectId: createdProject.id,
                milestoneId: createdMilestone.id,
              },
            });
          }
        }
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
