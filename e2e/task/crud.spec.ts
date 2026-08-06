import { test, expect } from "../fixtures";

test.describe("Tests Task CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("adds a task", async ({ page }) => {
    const data = { name: "New Task" };

    // Navigate to project 'Tasks' tab.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Tasks" }).click();

    // Click 'Create Tasks'
    await page.getByRole("link", { name: "Create Task" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/tasks\/add$/);

    // Enter the details and submit form.
    await page.locator('input[name="name"]').fill(data.name);
    await page.locator('button[type="submit"]', { hasText: "Create" }).click();

    // Check we redirected to project detail page.
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\?tab=tasks$/);

    // Check details of the project we added.
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("table").getByRole("cell", { name: data.name })).toBeVisible();
  });

  test("edits a task", async ({ page }) => {
    const newStatus = "Completed";

    // Navigate to task detail page.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Tasks" }).click();
    await page.getByRole("link", { name: "Create Manufacturer" }).click();
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);

    // Click Edit button
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page).toHaveURL(
      /\/projects\/[a-z0-9]+\/tasks\/[a-z0-9]+\/edit\?returnTo=task$/
    );

    // Enter updated details
    const statusField = page.locator("label", { hasText: "Status" }).locator("xpath=..");
    await statusField.locator('button[role="combobox"]').click();
    await page.getByRole("listbox").getByRole("option", { name: newStatus }).click();

    // Click submit
    await page.getByRole("button", { name: "Save" }).click();

    // Check new details exist (this assertion was missing in the original Cypress spec)
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);
    await expect(page.locator("dd.text-foreground", { hasText: newStatus })).toBeVisible();
  });

  test("deletes a task", async ({ page }) => {
    // Navigate to task detail page.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Tasks" }).click();
    await page.getByRole("link", { name: "Task to delete" }).click();
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);
  });
});
