import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Study flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("add word then study", async ({ page }) => {
    const deckName = `Study E2E ${Date.now()}`;

    // Create deck for this test
    await page.getByRole("button", { name: "Tạo bộ thẻ mới" }).click();
    await page.getByLabel("Tên bộ thẻ").fill(deckName);
    await page.getByRole("button", { name: "Tạo bộ thẻ", exact: true }).click();
    // Wait for modal to close
    await page.getByLabel("Tên bộ thẻ").waitFor({ state: "detached" });

    // Navigate into deck
    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/.+\/words/);

    // Add word
    await page.getByLabel("Thêm từ").click();
    await page.getByLabel("Hanzi").fill("你好");
    // Tab out to trigger lookup, then wait for submit button to be enabled (lookup done)
    await page.keyboard.press("Tab");
    await expect(page.locator("form button[type='submit']")).toBeEnabled({ timeout: 10000 });
    await page.locator("form").getByRole("button", { name: "Thêm từ", exact: true }).click();
    await expect(page.getByText("你好")).toBeVisible({ timeout: 10000 });

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
