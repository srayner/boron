import { test, expect } from "../fixtures";

test.describe("Tests Project CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("adds a project", async ({ page }) => {
    const data = { name: "New Project" };

    // Navigate to 'Add' page.
    await expect(page.locator('a[href="/projects/add"]')).toBeVisible();
    await page.locator('a[href="/projects/add"]').click();
    await expect(page).toHaveURL(/\/projects\/add/);

    // Enter the details and submit form.
    await page.locator('input[name="name"]').fill(data.name);
    await page.getByRole("button", { name: "Submit" }).click();

    // Check we redirected to project detail page.
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+$/);

    // Check details of the project we added.
    await expect(page.locator("h1")).toContainText(data.name);
  });

  test("edits a project", async ({ page }) => {
    const newType = "Web Application";

    await page.getByRole("link", { name: "New Project" }).first().click();
    await page.getByRole("button", { name: "Edit" }).click();

    const typeField = page.locator("label", { hasText: "Type" }).locator("xpath=..");
    await typeField.locator('button[role="combobox"]').click();
    await page.getByRole("listbox").getByRole("option", { name: newType }).click();

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.locator("dd.text-foreground", { hasText: newType })).toBeVisible();
  });

  test("deletes a project", async ({ page }) => {
    await page.getByRole("link", { name: "New Project" }).first().click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Yes" }).click();
  });
});
