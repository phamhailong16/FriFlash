import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Study flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("add word then study", async ({ page }) => {
    // Create deck for this test
    await page.getByRole("button", { name: "Tạo bộ thẻ mới" }).click();
    await page.getByLabel("Tên bộ thẻ").fill("Study E2E Deck");
    await page.getByRole("button", { name: "Tạo" }).click();

    // Navigate into deck
    await page.getByText("Study E2E Deck").click();
    await page.waitForURL(/\/decks\/.+\/words/);

    // Add word
    await page.getByRole("button", { name: "Thêm từ" }).click();
    await page.getByLabel("Hanzi").fill("你好");
    await page.getByRole("button", { name: /Lưu|Thêm/ }).click();
    await expect(page.getByText("你好")).toBeVisible();

    // Start study
    await page.getByRole("button", { name: "Học ngay" }).click();
    await page.waitForURL(/\/study/);

    // Flip card
    await page.locator(".flashcard, [data-testid=flashcard]").click();

    // Mark as known (swipe right or click button)
    const knownBtn = page.getByRole("button", { name: /Đã biết|Known/ });
    if (await knownBtn.isVisible()) {
      await knownBtn.click();
    }

    // Session summary should appear
    await expect(page.getByText(/Kết quả|Phiên học/i)).toBeVisible({ timeout: 5000 });
  });
});
