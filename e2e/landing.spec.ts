import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("header transparan di atas, putih setelah digulir; semua section tampil", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    const pill = header.locator("div").first();

    await expect(page.getByRole("heading", { level: 1 })).toContainText("sehat");
    await expect(pill).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.screenshot({ path: "test-results/landing-top.png" });

    await page.evaluate(() => window.scrollTo({ top: 900 }));
    await expect(pill).toHaveCSS("background-color", "rgb(255, 255, 255)");

    for (const heading of [
      /Membantu UMKM/,
      /Angka dari penilaian/,
      /Fitur inti/,
      /Manfaat untuk/,
      /Jawaban jujur/,
      /Apa kata/,
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await page.screenshot({ path: "test-results/landing-scrolled.png" });
    await page.screenshot({ path: "test-results/landing-full.png", fullPage: true });
  });

  test("testimoni bergerak otomatis", async ({ page }) => {
    await page.goto("/");
    // Elemen yang terus beranimasi tidak pernah "stabil" bagi Playwright, jadi gulir lewat DOM langsung.
    const track = page.locator(".animate-marquee").last();
    await track.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const first = await track.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(1500);
    const second = await track.evaluate((el) => getComputedStyle(el).transform);
    expect(second).not.toBe(first);
  });

  test("halaman metodologi dan privasi terbuka", async ({ page }) => {
    await page.goto("/metodologi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("dihitung");
    await page.goto("/privasi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("privasi");
  });
});
