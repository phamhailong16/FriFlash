import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password123";

test.describe("TTS auto-pronunciation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock speechSynthesis before page load
    await page.addInitScript(() => {
      const calls: string[] = [];
      (window as unknown as Record<string, unknown>).__tts_calls__ = calls;
      Object.defineProperty(window, "speechSynthesis", {
        value: {
          speak: (utt: SpeechSynthesisUtterance) => calls.push(utt.text),
          cancel: () => {},
          getVoices: () => [],
        },
        writable: true,
      });
    });
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("auto_pronounce fires speechSynthesis.speak on card flip", async ({ page }) => {
    // Enable auto_pronounce in settings (assumed already enabled or navigate to study)
    const deck = page.getByText("Study E2E Deck").first();
    if (await deck.isVisible()) {
      await deck.click();
      await page.getByRole("button", { name: "Học ngay" }).click();
      await page.waitForURL(/\/study/);

      // Open settings and enable auto-pronounce
      await page.getByRole("button", { name: /Cài đặt|Settings/ }).click();
      const toggle = page.getByLabel(/Tự đọc phát âm/);
      if (!(await toggle.isChecked())) {
        await toggle.click();
      }
      await page.keyboard.press("Escape");

      // Flip card
      await page.locator(".flashcard, [data-testid=flashcard]").click();

      const spokenTexts = await page.evaluate(
        () => (window as unknown as Record<string, string[]>).__tts_calls__
      );
      expect(spokenTexts.length).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });
});
