import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";

test.describe("Tests Project CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await navigateToProjectTasksTab(page);
  });

  test("adds a task not completed", async ({ page }) => {
    await addTask(page, "New not complete task", false);
    await assertNoCompletedAt(page);
  });

  test("adds a task completed", async ({ page }) => {
    await addTask(page, "New complete task", true);
    await viewTaskDetail(page, "New complete task");
    await assertCompletedToday(page);
  });

  test("edits a task transitioning to completed", async ({ page }) => {
    await viewTaskDetail(page, "Task to be completed");
    await editTask(page, "Status", "Completed");
    await assertCompletedToday(page);
  });

  test("edits a task transitioning from completed", async ({ page }) => {
    await viewTaskDetail(page, "Task to be un-completed");
    await editTask(page, "Status", "In Progress");
    await assertNoCompletedAt(page);
  });

  test("edits a not complete task without changing status", async ({ page }) => {
    await viewTaskDetail(page, "In Progress Task");
    await editTask(page, "Priority", "Low");
    await assertNoCompletedAt(page);
  });

  test("edits a complete task not changing status", async ({ page }) => {
    await viewTaskDetail(page, "Completed Task");
    const previous = await readCompletedAtText(page);
    await editTask(page, "Priority", "Low");
    await assertCompletedAtUnchanged(page, previous);
  });
});

async function navigateToProjectTasksTab(page: Page) {
  await page.getByRole("link", { name: "Argon - Inventory Management" }).click();
  await page.getByRole("tab", { name: "Tasks" }).click();
}

async function addTask(page: Page, name: string, completed: boolean) {
  // Click 'Create Tasks'
  await page.getByRole("link", { name: "Create Task" }).click();
  await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\/tasks\/add$/);

  // Enter the details
  await page.locator('input[name="name"]').fill(name);
  if (completed) {
    const statusField = page.locator("label", { hasText: "Status" }).locator("xpath=..");
    await statusField.locator('button[role="combobox"]').click();
    await page.getByRole("listbox").getByRole("option", { name: "Completed" }).click();
  }

  // Submit form
  await page.locator('button[type="submit"]', { hasText: "Create" }).click();

  // Check we redirected to project detail page.
  await expect(page).toHaveURL(/\/projects\/[a-z0-9]+\?tab=tasks$/);
}

async function viewTaskDetail(page: Page, taskName: string) {
  await page.getByRole("link", { name: taskName }).click();
  await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);
}

async function editTask(page: Page, fieldLabel: string, newValue: string) {
  // Click Edit button
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(
    /\/projects\/[a-z0-9]+\/tasks\/[a-z0-9]+\/edit\?returnTo=task$/
  );

  // Make change
  const field = page.locator("label", { hasText: fieldLabel }).locator("xpath=..");
  await field.locator('button[role="combobox"]').click();
  await page.getByRole("listbox").getByRole("option", { name: newValue }).click();

  // Submit form
  await page.locator('button[type="submit"]').click();

  // Assert redirected back to task detail page
  await expect(page).toHaveURL(/\/tasks\/[a-z0-9]+$/);
}

function completedAtLocator(page: Page) {
  return page.locator('dt:has-text("Completed at") + dd');
}

async function readCompletedAtText(page: Page): Promise<string> {
  const text = await completedAtLocator(page).innerText();
  return text.trim();
}

async function assertCompletedToday(page: Page) {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0"); // dd
  const month = now.toLocaleString("en-US", { month: "short" }); // mmm
  const year = now.getFullYear(); // YYYY
  const todayStr = `${day} ${month} ${year}`;

  await expect(completedAtLocator(page)).toBeVisible();
  const dateText = await completedAtLocator(page).innerText();
  const datePart = dateText.trim().substring(0, 11); // grab first 11 chars: dd mmm YYYY
  expect(datePart).toBe(todayStr);
}

async function assertNoCompletedAt(page: Page) {
  await expect(page.locator("dt", { hasText: "Completed at" })).toHaveCount(0);
}

async function assertCompletedAtUnchanged(page: Page, previous: string) {
  const current = await readCompletedAtText(page);
  expect(current).toBe(previous);
}
