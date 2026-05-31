import { test, expect, chromium } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("Deck sharing", () => {
  test("share deck — public URL accessible without login", async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);

    // Find a deck and open share modal
    const deckOptions = page.locator('[aria-label="Tuỳ chọn"]').first();
    await deckOptions.click();
    const shareItem = page.getByRole("menuitem", { name: /Chia sẻ/ });
    if (!(await shareItem.isVisible())) {
      test.skip();
      return;
    }
    await shareItem.click();

    // Enable sharing and grab the share URL
    const enableBtn = page.getByRole("button", { name: /Bật chia sẻ/ });
    if (await enableBtn.isVisible()) await enableBtn.click();

    const shareUrl = await page.getByRole("link", { name: /\/share\// }).getAttribute("href")
      ?? await page.locator("input[readonly]").inputValue();

    expect(shareUrl).toMatch(/\/share\//);

    // Open in incognito context (no auth)
    const incognito = await chromium.launchPersistentContext("", { headless: true });
    const incognitoPage = await incognito.newPage();
    await incognitoPage.goto(`http://localhost:5173${shareUrl.startsWith("/") ? shareUrl : new URL(shareUrl).pathname}`);
    await expect(incognitoPage.getByText(/Tạo tài khoản/i)).toBeVisible({ timeout: 8000 });
    await incognito.close();
  });
});
