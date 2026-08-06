import { test, expect } from "../fixtures";

test.describe("Tests Costs CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("adds a cost", async ({ page }) => {
    const data = { name: "New Cost", amount: "5.50" };

    // Navigate to project 'Costs' tab.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Costs" }).click();

    // Click 'Create Cost'
    await page.getByRole("link", { name: "Create Cost" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/costs\/add$/);

    // Enter the details and submit form.
    await page.locator('input[name="name"]').fill(data.name);
    await page.locator('input[name="amount"]').fill(data.amount);
    await page.locator('button[type="submit"]', { hasText: "Create" }).click();

    // Check we redirected to project detail page.
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\?tab=costs$/);

    // Check details of the project we added.
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("table").getByRole("cell", { name: data.name })).toBeVisible();
  });

  test("edits a cost", async ({ page }) => {
    const newData = { name: "Updated Cost", amount: "6.59" };

    // Navigate to cost detail page.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Costs" }).click();
    await page.getByRole("link", { name: "New Cost" }).click();
    await expect(page).toHaveURL(/\/costs\/[a-z0-9]+$/);

    // Click Edit button
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/costs\/[a-z0-9]+\/edit\?returnTo=cost$/);

    // Enter the details and submit form.
    await page.locator('input[name="name"]').fill(newData.name);
    await page.locator('input[name="amount"]').fill(newData.amount);
    await page.locator('button[type="submit"]', { hasText: "Save" }).click();

    // Check new details exist
    await expect(page).toHaveURL(/\/costs\/[a-z0-9]+$/);
    await expect(page.locator("h1")).toContainText(newData.name);
    await expect(page.locator("dd.text-foreground", { hasText: newData.amount })).toBeVisible();
  });

  test("deletes a cost", async ({ page }) => {
    // Navigate to cost detail page.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Costs" }).click();
    await page.getByRole("link", { name: "Updated Cost" }).click();
    await expect(page).toHaveURL(/\/costs\/[a-z0-9]+$/);

    // Click Delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Confirm by clicking 'Yes' button
    await page.getByRole("button", { name: "Yes" }).click();
  });
});
