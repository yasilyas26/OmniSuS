import { expect, test } from "@playwright/test";

// Aturan bahasa default: docs/I18N.md. Di lokal tidak ada header negara, jadi yang diuji di sini
// adalah bahasa perangkat, header negara (disuntik manual), dan pilihan manual lewat cookie.
const HERO_ID = "Cari tahu seberapa";
const HERO_EN = "Find out how";

test.describe("perangkat berbahasa Indonesia", () => {
  test.use({ locale: "id-ID" });

  test("tanpa info negara → Indonesia", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_ID);
  });

  test("diakses dari luar Indonesia → Inggris", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-vercel-ip-country": "SG" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_EN);
  });

  test("diakses dari Indonesia → Indonesia", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-vercel-ip-country": "ID" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_ID);
  });
});

test.describe("perangkat berbahasa Inggris", () => {
  test.use({ locale: "en-US" });

  test("tinggal di Indonesia tetapi perangkat Inggris → tetap Inggris", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-vercel-ip-country": "ID" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_EN);
  });

  test("halaman metodologi dan privasi ikut berbahasa Inggris", async ({ page }) => {
    await page.goto("/metodologi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("calculated");
    await page.goto("/privasi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");
  });
});

test.describe("pilihan manual", () => {
  test.use({ locale: "id-ID" });

  test("tombol bahasa mengganti bahasa dan diingat setelah dimuat ulang", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_ID);

    await page.getByRole("group", { name: "Bahasa" }).getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_EN);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_EN);

    await page.getByRole("group", { name: "Language" }).getByRole("button", { name: "ID" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_ID);
  });

  test("pilihan manual mengalahkan deteksi negara", async ({ page, context }) => {
    await context.addCookies([
      { name: "omnisus-locale", value: "id", url: "http://localhost:3000" },
    ]);
    await page.setExtraHTTPHeaders({ "x-vercel-ip-country": "US" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(HERO_ID);
  });
});

test.describe("header ponsel", () => {
  test.use({ locale: "id-ID", viewport: { width: 390, height: 844 } });

  test("tombol Get started di header disembunyikan, pilihan bahasa tetap ada", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Mulai sekarang" })).toBeHidden();
    await expect(page.locator("header").getByRole("group", { name: "Bahasa" })).toBeVisible();
    // Jalur daftar tetap tersedia lewat hero.
    await expect(page.locator("#home").getByRole("link", { name: "Mulai sekarang" })).toBeVisible();
  });
});
