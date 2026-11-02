import { type Page, expect, test } from "@playwright/test";

import { grantAdmin, register, uniqueEmail } from "./helpers";

const HERO_ID_TITLE = "Judul uji *admin* e2e";
const HERO_EN_TITLE = "English test *admin* title";

async function registerAdmin(page: Page, label: string) {
  const email = uniqueEmail(label);
  await register(page, `Admin ${label}`, email);
  await grantAdmin(email);
  return email;
}

async function saveHeroTitle(page: Page, lang: "id" | "en", title: string) {
  await page.goto(`/admin/landing?lang=${lang}`);
  await page.locator("#f-hero-title").fill(title);
  await page
    .locator("form")
    .filter({ has: page.locator("#f-hero-title") })
    .getByRole("button", { name: "Simpan", exact: true })
    .click();
  await expect(page.getByText("Tersimpan. Landing page diperbarui.")).toBeVisible();
}

test.describe("akses admin", () => {
  test("pengguna biasa mendapat 404 dan tamu diarahkan ke masuk", async ({ page, context }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/masuk/);

    await register(page, "Bukan Admin", uniqueEmail("biasa"));
    for (const path of ["/admin", "/admin/instrumen", "/admin/landing", "/admin/faktor"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} harus 404 untuk non-admin`).toBe(404);
    }
    await context.clearCookies();
  });

  test("admin bisa membuka dashboard admin", async ({ page }) => {
    await registerAdmin(page, "akses");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Ringkasan admin" })).toBeVisible();
    for (const link of ["Instrumen & butir", "Faktor", "Konten landing"]) {
      await expect(page.getByRole("link", { name: link }).first()).toBeVisible();
    }
  });
});

test("admin mengubah teks landing per bahasa, lalu mengembalikannya", async ({ page, browser }) => {
  await registerAdmin(page, "landing");

  await saveHeroTitle(page, "id", HERO_ID_TITLE);
  await saveHeroTitle(page, "en", HERO_EN_TITLE);

  // Pengunjung berbahasa Indonesia melihat judul Indonesia, kata beremfasis tampil miring.
  const visitorId = await browser.newContext({ locale: "id-ID" });
  const idPage = await visitorId.newPage();
  await idPage.goto("/");
  await expect(idPage.getByRole("heading", { level: 1 })).toHaveText("Judul uji admin e2e");
  await expect(idPage.getByRole("heading", { level: 1 }).locator("em")).toHaveText("admin");
  await visitorId.close();

  const visitorEn = await browser.newContext({ locale: "en-US" });
  const enPage = await visitorEn.newPage();
  await enPage.goto("/");
  await expect(enPage.getByRole("heading", { level: 1 })).toHaveText("English test admin title");
  await visitorEn.close();

  // Kembalikan ke teks bawaan.
  for (const lang of ["id", "en"] as const) {
    await page.goto(`/admin/landing?lang=${lang}`);
    await page
      .locator("form")
      .filter({ has: page.locator("#f-hero-title") })
      .getByRole("button", { name: "Kembalikan ke bawaan" })
      .click();
    await expect(page.getByText("Dikembalikan ke teks bawaan.")).toBeVisible();
  }

  const restored = await browser.newContext({ locale: "id-ID" });
  const restoredPage = await restored.newPage();
  await restoredPage.goto("/");
  await expect(restoredPage.getByRole("heading", { level: 1 })).toContainText("Cari tahu seberapa");
  await restored.close();
});

test("admin membuat versi baru, menyunting butir, lalu mengaktifkannya", async ({ page }) => {
  await registerAdmin(page, "instrumen");

  await page.goto("/admin/instrumen");
  await page
    .getByRole("row", { name: /OWNER_V1/ })
    .getByRole("button", { name: "Buat versi baru" })
    .click();
  await expect(page).toHaveURL(/\/admin\/instrumen\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { name: "OWNER_V2" })).toBeVisible();
  await expect(page.getByText("Draf yang bisa disunting")).toBeVisible();

  // Tambah butir baru
  await page.getByRole("button", { name: "Tambah butir" }).click();
  await page.getByLabel("Kode butir").fill("O-E2E1");
  await page.getByLabel("Teks butir").fill("Butir uji E2E dari dashboard admin.");
  await page.getByRole("combobox", { name: "Faktor" }).click();
  await page.getByRole("option", { name: "Kepemimpinan" }).click();
  await page.getByRole("button", { name: "Simpan butir" }).click();
  const row = page.getByRole("row", { name: /O-E2E1/ });
  await expect(row).toContainText("Butir uji E2E dari dashboard admin.");

  // Ubah teksnya
  await page.getByRole("button", { name: "Ubah O-E2E1" }).click();
  await page.getByLabel("Teks butir").fill("Butir uji E2E sudah diubah.");
  await page.getByRole("button", { name: "Simpan butir" }).click();
  await expect(page.getByRole("row", { name: /O-E2E1/ })).toContainText("sudah diubah");

  // Kode butir ganda ditolak
  await page.getByRole("button", { name: "Tambah butir" }).click();
  await page.getByLabel("Kode butir").fill("O-E2E1");
  await page.getByLabel("Teks butir").fill("Duplikat");
  await page.getByRole("button", { name: "Simpan butir" }).click();
  await expect(page.getByText("sudah dipakai di versi ini")).toBeVisible();
  await page.getByRole("button", { name: "Batal" }).click();

  // Aktifkan: versi lama menjadi arsip, versi baru aktif dan terkunci
  await page.getByRole("button", { name: "Aktifkan versi ini" }).click();
  await page.getByRole("button", { name: "Ya, aktifkan" }).click();
  await expect(page.getByText("Versi ini sedang aktif sehingga tidak bisa diubah.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tambah butir" })).toHaveCount(0);

  await page.goto("/admin/instrumen");
  await expect(page.getByRole("row", { name: /OWNER_V2/ })).toContainText("Aktif");
  await expect(page.getByRole("row", { name: /OWNER_V1/ })).not.toContainText("Aktif");
});

test("admin mengubah nama faktor dalam dua bahasa", async ({ page }) => {
  await registerAdmin(page, "faktor");
  await page.goto("/admin/faktor");
  const card = page
    .locator("div")
    .filter({ hasText: /^Keuangan/ })
    .first();
  await expect(card).toBeVisible();
  await expect(page.getByLabel("Nama (Inggris)").last()).toHaveValue("Finance");
});
