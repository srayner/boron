import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/auth/login");
  await page.locator('input[name="email"]').fill("user@example.com");
  await page.locator('input[name="password"]').fill(process.env.USER_PASSWORD_USER ?? "");
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL(/\/dashboard/);

  // Mirrors the sidebar_state cookie Cypress used to set per-spec, baked into
  // the shared storage state so every ported spec starts with it already set.
  await page.context().addCookies([
    {
      name: "sidebar_state",
      value: "true",
      url: "http://localhost:3000",
    },
  ]);

  await page.context().storageState({ path: authFile });
});
