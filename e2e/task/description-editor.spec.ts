import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "../fixtures";

// The description editor is one shared component; it is tested through the
// task forms, and every form is checked once for having it.

async function firstProjectId(request: APIRequestContext) {
  const { projects } = await (await request.get("/api/projects?limit=1")).json();
  return projects[0].id as string;
}

async function createTask(request: APIRequestContext, projectId: string, description: string) {
  const res = await request.post("/api/tasks", {
    data: { projectId, name: `Editor test ${Date.now()}`, description, status: "PLANNED", priority: "MEDIUM" },
  });
  expect(res.status()).toBe(201);
  // The task route returns the new task under the "project" key.
  return (await res.json()).project.id as string;
}

async function storedDescription(request: APIRequestContext, taskId: string) {
  return (await (await request.get(`/api/tasks/${taskId}`)).json()).task.description as string;
}

function editor(page: Page) {
  return page.getByRole("textbox", { name: "Description" });
}

// Toolbar controls by their accessible name (formatting toggles are radios).
function tool(page: Page, name: string) {
  return page.locator(".mdxeditor-toolbar").getByLabel(name, { exact: true });
}

// Select exact text in the editor, as a mouse drag would.
async function selectText(page: Page, text: string) {
  await editor(page).evaluate((el, target) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const at = node.textContent!.indexOf(target);
      if (at < 0) continue;
      const range = document.createRange();
      range.setStart(node, at);
      range.setEnd(node, at + target.length);
      el.focus();
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      // The browser queues a selectionchange task, which the editor
      // handles; resolve in a task queued after it.
      return new Promise((resolve) => setTimeout(resolve));
    }
    throw new Error(`"${target}" not found in the editor`);
  }, text);
}

async function saveEditForm(page: Page) {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).not.toHaveURL(/\/edit$/);
}

test.describe("Description editor", () => {
  // Criterion 2: every add and edit form has the labelled editor and toolbar.
  test("every project, task and milestone form has the labelled editor and toolbar", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const taskId = await createTask(page.request, projectId, "");
    const milestone = await (await page.request.post("/api/milestones", { data: { projectId, name: `Editor milestone ${Date.now()}` } })).json();
    const milestoneId = milestone.milestone.id;
    try {
      const forms = [
        "/projects/add",
        `/projects/${projectId}/edit`,
        `/projects/${projectId}/tasks/add`,
        `/projects/${projectId}/tasks/${taskId}/edit`,
        `/projects/${projectId}/milestones/add`,
        `/projects/${projectId}/milestones/${milestoneId}/edit`,
      ];
      for (const url of forms) {
        await page.goto(url);
        await expect(editor(page), url).toBeVisible();
        for (const name of ["Bold", "Italic", "Inline code format", "Bulleted list", "Numbered list", "Create link", "Insert Code Block"]) {
          await expect(tool(page, name), `${url} ${name}`).toBeVisible();
        }
        await expect(page.getByRole("combobox", { name: "Block type" }), url).toBeVisible();
      }
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
      await page.request.delete(`/api/milestones/${milestoneId}`);
    }
  });

  // Criteria 2 and 3: the toolbar works from the keyboard, its formatting is
  // saved as plain Markdown, and reopening the form shows it formatted again.
  test("toolbar formatting, used from the keyboard, is saved as Markdown and reopens formatted", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const taskId = await createTask(page.request, projectId, "");
    try {
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      const box = editor(page);
      const press = async (name: string) => {
        await tool(page, name).focus();
        await page.keyboard.press("Enter");
      };

      // Type plain lines first, then format each one from the toolbar, so
      // no formatting carries over into text typed afterwards.
      await box.click();
      for (const line of ["Plan", "strong slanted npm", "first bullet"]) {
        await page.keyboard.type(line);
        await page.keyboard.press("Enter");
      }
      await page.keyboard.type("first step");

      // Heading, through the block type list.
      await selectText(page, "Plan");
      await tool(page, "Block type").focus();
      await page.keyboard.press("Enter");
      await page.getByRole("option", { name: "Heading 2" }).focus();
      await page.keyboard.press("Enter");

      // Bold, italic and inline code on single words.
      await selectText(page, "strong");
      await press("Bold");
      await selectText(page, "slanted");
      await press("Italic");
      await selectText(page, "npm");
      await press("Inline code format");

      // Bullet and numbered lists.
      await selectText(page, "first bullet");
      await press("Bulleted list");
      await selectText(page, "first step");
      await press("Numbered list");

      await saveEditForm(page);
      const stored = await storedDescription(page.request, taskId);
      expect(stored).toContain("## Plan");
      expect(stored).toContain("**strong**");
      expect(stored).toMatch(/[*_]slanted[*_]/);
      expect(stored).toContain("`npm`");
      expect(stored).toMatch(/^- first bullet$/m);
      expect(stored).toMatch(/^1\. first step$/m);
      expect(stored).not.toContain("<");

      // Reopening shows the same formatting in the editor.
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      await expect(box.getByRole("heading", { level: 2, name: "Plan" })).toBeVisible();
      await expect(box.locator("strong")).toHaveText("strong");
      await expect(box.locator("em")).toHaveText("slanted");
      await expect(box.locator("code")).toHaveText("npm");
      await expect(box.locator("ul > li")).toHaveText(["first bullet"]);
      await expect(box.locator("ol > li")).toHaveText(["first step"]);
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
    }
  });

  // Criterion 2: links and code blocks from the toolbar.
  test("toolbar adds links and code blocks", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const taskId = await createTask(page.request, projectId, "");
    try {
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      const box = editor(page);
      // Code block on the second line, then a link on the first line's text.
      await box.click();
      await page.keyboard.type("docs");
      await page.keyboard.press("Enter");
      await tool(page, "Insert Code Block").click();
      await page.keyboard.type("npm run deploy");
      await selectText(page, "docs");
      await tool(page, "Create link").click();
      // MDXEditor's URL field has no accessible label, so find it by name.
      const dialog = page.getByRole("dialog");
      await dialog.locator('input[name="url"]').fill("https://example.com/docs");
      await dialog.getByRole("button", { name: "Set URL" }).click();
      await expect(box.getByRole("link", { name: "docs" })).toBeVisible();

      await saveEditForm(page);
      const stored = await storedDescription(page.request, taskId);
      expect(stored).toContain("[docs](https://example.com/docs)");
      expect(stored).toMatch(/```[^\n]*\nnpm run deploy\n```/);
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
    }
  });

  // Criterion 4: Markdown typed as shortcuts becomes formatting.
  test("typing Markdown shortcuts turns them into formatting", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const taskId = await createTask(page.request, projectId, "");
    try {
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      const box = editor(page);
      await box.click();
      await page.keyboard.type("## Goals");
      await page.keyboard.press("Enter");
      await page.keyboard.type("Ship **fast** now");
      await page.keyboard.press("Enter");
      await page.keyboard.type("- one");

      await expect(box.getByRole("heading", { level: 2, name: "Goals" })).toBeVisible();
      await expect(box.locator("strong")).toHaveText("fast");
      await expect(box.locator("ul > li")).toHaveText(["one"]);
      await expect(box).not.toContainText("##");
      await expect(box).not.toContainText("**");

      await saveEditForm(page);
      expect(await storedDescription(page.request, taskId)).toBe("## Goals\n\nShip **fast** now\n\n- one");
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
    }
  });

  // Criterion 11: opening and saving without edits leaves the stored text exactly as it was.
  test("saving without touching the description leaves the stored text unchanged", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    // Markdown the editor would write differently: * bullets, _italic_,
    // __bold__, a bare URL and a single line break.
    const original = "* first\n* second\n\n_italic_ and __bold__ at https://example.com/a_b\nnext line";
    const taskId = await createTask(page.request, projectId, original);
    try {
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      await expect(editor(page).locator("em")).toHaveText("italic");
      await expect(editor(page).locator("ul > li")).toHaveText(["first", "second"]);

      await saveEditForm(page);
      expect(await storedDescription(page.request, taskId)).toBe(original);
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
    }
  });

  // Criterion 10: text the editor can't show opens as plain Markdown and is
  // never shortened, whether saved untouched or edited.
  test.describe("descriptions the editor can't show", () => {
    for (const [label, original] of [
      ["raw HTML", "Before <script>alert(1)</script> after\n\n<div>block</div>"],
      ["a footnote", "Claim[^1]\n\n[^1]: Source"],
    ]) {
      test(`${label} is kept in full`, async ({ page }) => {
        const projectId = await firstProjectId(page.request);
        const taskId = await createTask(page.request, projectId, original);
        try {
          await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
          const raw = page.getByRole("textbox", { name: "Description" });
          await expect(raw).toHaveValue(original);
          await expect(page.getByText("formatting the editor can't show")).toBeVisible();

          await saveEditForm(page);
          expect(await storedDescription(page.request, taskId)).toBe(original);

          await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
          await raw.click();
          await raw.press("Control+End");
          await page.keyboard.type(" more");
          await saveEditForm(page);
          expect(await storedDescription(page.request, taskId)).toBe(`${original} more`);
        } finally {
          await page.request.delete(`/api/tasks/${taskId}`);
        }
      });
    }
  });

  // Criterion 14: pasted formatting is kept, pasted images are not added.
  test("pasting keeps formatting and leaves out images", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const taskId = await createTask(page.request, projectId, "");
    try {
      await page.goto(`/projects/${projectId}/tasks/${taskId}/edit`);
      const box = editor(page);
      await box.click();
      await box.evaluate((el) => {
        const data = new DataTransfer();
        data.setData("text/html", '<p>Pasted <strong>bold</strong> text <img src="https://example.com/a.png" alt="diagram"></p>');
        data.setData("text/plain", "Pasted bold text");
        data.items.add(new File([new Uint8Array([137, 80, 78, 71])], "shot.png", { type: "image/png" }));
        el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
      });

      await expect(box.locator("strong")).toHaveText("bold");
      await expect(box.locator("img")).toHaveCount(0);

      await saveEditForm(page);
      const stored = await storedDescription(page.request, taskId);
      expect(stored).toContain("**bold**");
      expect(stored).not.toMatch(/!\[|<img|example\.com\/a\.png|data:/);
    } finally {
      await page.request.delete(`/api/tasks/${taskId}`);
    }
  });

  // Criterion 15: a count appears from 18,000 characters, and saving is
  // blocked above 20,000 with a message, leaving the stored text unchanged.
  test("shows a character count near the limit and blocks saving above it", async ({ page }) => {
    const projectId = await firstProjectId(page.request);
    const below = "word ".repeat(3_599) + "end"; // 17,998 characters
    const near = "word ".repeat(3_999) + "end"; // 19,998 characters
    const belowId = await createTask(page.request, projectId, below);
    const nearId = await createTask(page.request, projectId, near);
    try {
      await page.goto(`/projects/${projectId}/tasks/${belowId}/edit`);
      await expect(editor(page)).toBeVisible();
      await expect(page.getByText(/\/ 20,000 characters/)).toHaveCount(0);

      await page.goto(`/projects/${projectId}/tasks/${nearId}/edit`);
      await expect(page.getByText("19,998 / 20,000 characters")).toBeVisible();
      await editor(page).click();
      await editor(page).press("Control+End");
      await page.keyboard.type("XYZ");
      await expect(page.getByText("20,001 / 20,000 characters")).toBeVisible();

      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByText("Description must be 20,000 characters or fewer.")).toBeVisible();
      await expect(page).toHaveURL(/\/edit$/);
      expect(await storedDescription(page.request, nearId)).toBe(near);
    } finally {
      await page.request.delete(`/api/tasks/${belowId}`);
      await page.request.delete(`/api/tasks/${nearId}`);
    }
  });
});
