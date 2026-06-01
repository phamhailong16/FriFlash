import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Deck CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("create a deck", async ({ page }) => {
    await page.getByRole("button", { name: "Tạo bộ thẻ mới" }).click();
    await page.getByLabel("Tên bộ thẻ").fill("E2E Test Deck");
    await page.getByRole("button", { name: "Tạo bộ thẻ", exact: true }).click();
    await expect(page.getByText("E2E Test Deck")).toBeVisible();
  });

  test("ConfirmDialog: cancel does not delete deck", async ({ page }) => {
    await page.getByText("E2E Test Deck").first().click({ button: "right" });
    const menuItem = page.getByRole("menuitem", { name: /Xoá/ });
    if (await menuItem.isVisible()) {
      await menuItem.click();
    } else {
      await page.locator('[aria-label="Tuỳ chọn"]').first().click();
      await page.getByRole("menuitem", { name: /Xoá/ }).click();
    }
    await expect(page.getByText(/Xoá "E2E Test Deck"/)).toBeVisible();
    await page.getByRole("button", { name: "Huỷ" }).click();
    await expect(page.getByText("E2E Test Deck")).toBeVisible();
  });

  test("delete a deck via ConfirmDialog", async ({ page }) => {
    await page.locator('[aria-label="Tuỳ chọn"]').first().click();
    await page.getByRole("menuitem", { name: /Xoá/ }).click();
    await expect(page.getByText(/Xoá "E2E Test Deck"/)).toBeVisible();
    await page.getByRole("button", { name: "Xoá" }).click();
    await expect(page.getByText("E2E Test Deck")).not.toBeVisible();
  });
});
