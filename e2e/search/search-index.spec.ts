import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "../fixtures";

// Records are created through the API (as boron-mcp does) and found through
// the search box (as a user does). Each run uses its own token, so results
// never mix with seed data or earlier runs.

type Created = { id: string };

async function post(request: APIRequestContext, path: string, body: object, key: string) {
  const res = await request.post(path, { data: body });
  expect(res.status(), `POST ${path}`).toBe(201);
  return (await res.json())[key] as Created;
}

async function createProjectWithChildren(request: APIRequestContext, names: Record<string, string>, descriptions: Record<string, string> = {}) {
  const project = await post(request, "/api/projects", { name: names.project, description: descriptions.project ?? "" }, "project");
  // The task route returns the new task under the "project" key.
  const task = await post(request, "/api/tasks", { projectId: project.id, name: names.task, description: descriptions.task ?? "", status: "PLANNED", priority: "MEDIUM" }, "project");
  const milestone = await post(request, "/api/milestones", { projectId: project.id, name: names.milestone, description: descriptions.milestone ?? "" }, "milestone");
  const cost = await post(request, "/api/costs", { projectId: project.id, name: names.cost, description: descriptions.cost ?? "", amount: 12.5, type: "PARTS" }, "cost");
  return { project, task, milestone, cost };
}

type SearchResponse = { results: { title: string; content: string }[]; totalCount: number };

// Search through the search box and wait for the answer to this exact text,
// so an empty result means "nothing found", not "not loaded yet".
async function search(page: Page, text: string): Promise<SearchResponse> {
  await page.goto("/search");
  const response = page.waitForResponse(
    (r) => r.url().includes("/api/search") && new URL(r.url()).searchParams.get("search") === text
  );
  await page.getByPlaceholder("Search for anything...").fill(text);
  return (await response).json();
}

test.describe("Search index", () => {
  test("finds records written through the API by a phrase that spans Markdown formatting", async ({ page }) => {
    const token = `idx${Date.now()}`;
    const names = {
      project: `Formatted project ${token}`,
      task: `Formatted task ${token}`,
      milestone: `Formatted milestone ${token}`,
      cost: `Formatted cost ${token}`,
    };
    // Each description splits its phrase with different formatting.
    const descriptions = {
      project: `## Heading ${token}p\n\nThe **bold ${token}p** words`,
      task: `- first ${token}t item\n- [linked ${token}t](https://example.com) item`,
      milestone: `Some *italic ${token}m* and \`code ${token}m\` text`,
      cost: `~~struck ${token}c~~ then plain`,
    };
    // The phrase a reader sees, and the Markdown symbols that must not show.
    const phrases = {
      project: `Heading ${token}p The bold ${token}p words`,
      task: `first ${token}t item linked ${token}t item`,
      milestone: `Some italic ${token}m and code ${token}m text`,
      cost: `struck ${token}c then plain`,
    };
    const paths = { project: "/projects", task: "/tasks", milestone: "/milestones", cost: "/costs" };

    let created: Awaited<ReturnType<typeof createProjectWithChildren>> | undefined;
    try {
      created = await createProjectWithChildren(page.request, names, descriptions);

      for (const type of ["project", "task", "milestone", "cost"] as const) {
        const { results } = await search(page, phrases[type]);
        const link = page.getByRole("main").getByRole("link", { name: names[type] });
        await expect(link, `${type} found by "${phrases[type]}"`).toBeVisible();
        await expect(link).toHaveAttribute("href", `${paths[type]}/${created[type].id}`);
        // Exactly one result, shown as plain text.
        expect(results.map((r) => r.title)).toEqual([names[type]]);
        expect(results[0].content).toBe(phrases[type]);
        await expect(page.getByRole("main").getByText(phrases[type], { exact: true })).toBeVisible();
      }
    } finally {
      if (created) await page.request.delete(`/api/projects/${created.project.id}`);
    }
  });

  test("deleting a record, or its project, removes it from search", async ({ page }) => {
    const token = `del${Date.now()}`;
    const names = {
      project: `Doomed project ${token}`,
      task: `Doomed task ${token}`,
      milestone: `Doomed milestone ${token}`,
      cost: `Doomed cost ${token}`,
    };

    let projectId: string | undefined;
    try {
      const created = await createProjectWithChildren(page.request, names);
      projectId = created.project.id;
      const extraTask = await post(page.request, "/api/tasks", { projectId, name: `Lone task ${token}`, status: "PLANNED", priority: "MEDIUM" }, "project");

      // All five are searchable first, so their absence later means something.
      await search(page, token);
      await expect(page.getByRole("main").getByRole("link", { name: token })).toHaveCount(5);

      // Deleting one task removes only that task.
      expect((await page.request.delete(`/api/tasks/${extraTask.id}`)).ok()).toBe(true);
      const afterTask = await search(page, token);
      expect(afterTask.results.map((r) => r.title).sort()).toEqual(Object.values(names).sort());
      await expect(page.getByRole("main").getByRole("link", { name: token })).toHaveCount(4);

      // Deleting the project removes it and everything it contained.
      expect((await page.request.delete(`/api/projects/${projectId}`)).ok()).toBe(true);
      projectId = undefined;
      const after = await search(page, token);
      expect(after.totalCount).toBe(0);
      await expect(page.getByRole("main").getByRole("link", { name: token })).toHaveCount(0);
    } finally {
      if (projectId) await page.request.delete(`/api/projects/${projectId}`);
    }
  });
});
