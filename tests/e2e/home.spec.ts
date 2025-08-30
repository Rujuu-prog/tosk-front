import { expect, test } from "@playwright/test";

test("Home page renders key UI", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /primary button/i })).toBeVisible();
});

