import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Auth flow", () => {
  test("redirects unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/decks");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("login and logout", async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/decks");

    await page.goto("/auth");
    await expect(page).toHaveURL("/decks");
  });
});
