import { expect, test } from "@playwright/test";

import { expectNoHorizontalOverflow } from "./helpers";

// Ukuran uji wajib: docs/RESPONSIVE.md §3.
const VIEWPORTS = [
  { name: "ponsel kecil", width: 360, height: 640 },
  { name: "ponsel", width: 390, height: 844 },
  { name: "ponsel lanskap", width: 844, height: 390 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "monitor lebar", width: 1536, height: 864 },
] as const;

// Kedua bahasa diuji: teks Inggris dan Indonesia berbeda panjangnya.
const LOCALES = ["id-ID", "en-US"] as const;
const PUBLIC_PAGES = ["/", "/metodologi", "/privasi", "/masuk", "/daftar"] as const;
const TABLET_MIN_WIDTH = 768; // titik `md:` — header menampilkan tombol Get started mulai di sini

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`${locale} · ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
      test.use({ locale, viewport: { width: viewport.width, height: viewport.height } });

      for (const path of PUBLIC_PAGES) {
        test(`${path} tanpa scroll horizontal`, async ({ page }) => {
          await page.goto(path);
          await expect(page.locator("main").first()).toBeVisible();
          await expectNoHorizontalOverflow(page);
        });
      }

      test("jalur Get started selalu ada: di header (tablet ke atas) atau hero (ponsel)", async ({
        page,
      }) => {
        await page.goto("/");
        const headerLink = page
          .locator("header")
          .getByRole("link", { name: /Get started|Mulai sekarang/ });
        if (viewport.width >= TABLET_MIN_WIDTH) {
          await expect(headerLink).toBeVisible();
        } else {
          await expect(headerLink).toBeHidden();
        }
        await expect(
          page.locator("#home").getByRole("link", { name: /Get started|Mulai sekarang/ }),
        ).toBeVisible();
      });
    });
  }
}

test.describe("menu seluler", () => {
  test.use({ locale: "id-ID", viewport: { width: 390, height: 844 } });

  test("dapat dibuka dan berisi semua tautan", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Buka menu").click();
    const menu = page.getByRole("navigation", { name: "Menu situs (ponsel)" });
    for (const label of ["Beranda", "Tentang kami", "Fitur utama", "Privasi", "Masuk"]) {
      await expect(menu.getByRole("link", { name: label })).toBeVisible();
    }
  });
});
