import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.locator("form").getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("/decks");
}
