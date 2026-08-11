import { format } from "date-fns";
import { test, expect } from "../fixtures";

test.describe("Tests Due Items", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows a task with a due date, then excludes it once completed", async ({
    page,
  }) => {
    const data = { name: "Due items target task" };

    // Create a task and give it a due date of today via the date picker.
    await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
    await page.getByRole("tab", { name: "Tasks" }).click();
    await page.getByRole("link", { name: "Create Task" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/tasks\/add$/);

    await page.locator('input[name="name"]').fill(data.name);

    const dueDateField = page.locator("label", { hasText: "Due Date" }).locator("xpath=..");
    await dueDateField.getByRole("button").click();
    const todayOfMonth = format(new Date(), "d");
    await page.getByRole("gridcell", { name: todayOfMonth, exact: true }).click();

    await page.locator('button[type="submit"]', { hasText: "Create" }).click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\?tab=tasks$/);

    // The task has a due date and isn't completed, so it shows up in Due Items.
    await page.goto("/due-items");
    await page.getByPlaceholder("Search due items...").fill(data.name);
    await expect(page.getByRole("link", { name: data.name })).toBeVisible();

    // Mark the task completed.
    await page.getByRole("link", { name: data.name }).click();
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);
    await page.getByRole("button", { name: "Edit" }).click();
    await expect(page).toHaveURL(
      /\/projects\/[a-z0-9]+\/tasks\/[a-z0-9]+\/edit\?returnTo=task$/
    );
    const statusField = page.locator("label", { hasText: "Status" }).locator("xpath=..");
    await statusField.locator('button[role="combobox"]').click();
    await page.getByRole("listbox").getByRole("option", { name: "Completed" }).click();
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);

    // Completed items are excluded from Due Items even though the due date is unchanged.
    await page.goto("/due-items");
    await page.getByPlaceholder("Search due items...").fill(data.name);
    await expect(page.getByRole("link", { name: data.name })).not.toBeVisible();
  });
});
