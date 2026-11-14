import { test, expect } from "../fixtures";

// Descriptions written through the API/MCP are Markdown; the detail page must
// show them formatted, not as raw symbols. The display component is shared by
// the project, task and milestone pages, so one page is checked here.
test("task page shows a description written through the API as formatted Markdown", async ({ page }) => {
  const token = `md${Date.now()}`;
  const projects = await (await page.request.get("/api/projects?limit=1")).json();
  const projectId = projects.projects[0].id;

  const res = await page.request.post("/api/tasks", {
    data: {
      projectId,
      name: `Markdown task ${token}`,
      description: `## Steps ${token}\n\n- **inspect** the valve\n- replace the seal\n\n1. order parts\n2. book engineer`,
      status: "PLANNED",
      priority: "MEDIUM",
    },
  });
  expect(res.status()).toBe(201);
  // The task route returns the new task under the "project" key.
  const taskId = (await res.json()).project.id;

  try {
    await page.goto(`/tasks/${taskId}`);
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { level: 2, name: `Steps ${token}` })).toBeVisible();
    await expect(main.locator(".markdown ul > li")).toHaveText(["inspect the valve", "replace the seal"]);
    await expect(main.locator(".markdown ol > li")).toHaveText(["order parts", "book engineer"]);
    await expect(main.locator(".markdown strong")).toHaveText("inspect");
    // No raw Markdown symbols reach the page.
    await expect(main.getByText(`## Steps ${token}`)).toHaveCount(0);
    await expect(main.getByText("**inspect**")).toHaveCount(0);
  } finally {
    await page.request.delete(`/api/tasks/${taskId}`);
  }
});
