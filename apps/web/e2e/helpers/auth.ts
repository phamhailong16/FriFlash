import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("/decks");
}
