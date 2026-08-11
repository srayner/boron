import { test, expect } from "../fixtures";

test.describe("Tests Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("finds a task by its description and excludes non-matching terms", async ({
    page,
  }) => {
    const data = {
      name: "Search target task",
      description: "zephyrus-inspection-procedure",
    };

    // Create a task with a unique description so it lands in the search index.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Tasks" }).click();
    await page.getByRole("link", { name: "Create Task" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/tasks\/add$/);

    await page.locator('input[name="name"]').fill(data.name);
    await page.locator('textarea[name="description"]').fill(data.description);
    await page.locator('button[type="submit"]', { hasText: "Create" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\?tab=tasks$/);

    // Searching for the unique description text finds the task and links to it.
    await page.goto("/search");
    await page.getByPlaceholder("Search for anything...").fill(data.description);
    await expect(page.getByRole("link", { name: data.name })).toBeVisible();
    await expect(page.getByRole("link", { name: data.name })).toHaveAttribute(
      "href",
      /\/tasks\/[a-z0-9]+$/
    );

    // Searching for something that matches nothing returns no results.
    await page
      .getByPlaceholder("Search for anything...")
      .fill("qqzzxx-nomatch-nonexistent");
    await expect(page.getByRole("link", { name: data.name })).not.toBeVisible();
  });
});
