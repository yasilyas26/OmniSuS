import { type Browser, expect, test } from "@playwright/test";

import {
  PASSWORD,
  createBusiness,
  expectNoHorizontalOverflow,
  fillSurveyAndSubmit,
  register,
  uniqueEmail,
} from "./helpers";

const EMPLOYEE_NAMES = ["Ani", "Budi", "Citra"];
const OWNER_LIKERT = 3; // "Setuju"
const EMPLOYEE_LIKERT = 1; // "Tidak setuju" → gap positif besar

async function employeeJoinsAndSubmits(browser: Browser, baseURL: string, inviteUrl: string) {
  const context = await browser.newContext({ baseURL, locale: "id-ID" });
  const page = await context.newPage();

  // Tautan undangan memakai BETTER_AUTH_URL; ikuti server yang sedang diuji (mis. port lain).
  const { pathname } = new URL(inviteUrl);
  await page.goto(pathname);
  await expect(page.getByText("diundang bergabung")).toBeVisible();
  await page.getByLabel("Buat kata sandi").fill(PASSWORD);
  await page.getByRole("button", { name: "Aktifkan akun" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Mulai mengisi" }).click();
  await expect(page.getByText("Jawabanmu anonim")).toBeVisible();
  await fillSurveyAndSubmit(page, EMPLOYEE_LIKERT);
  await context.close();
}

test("alur utama: daftar → undang → isi → tutup → hasil", async ({ page, browser, baseURL }) => {
  if (!baseURL) throw new Error("baseURL tidak tersedia");
  // 1. Owner mendaftar dan membuat profil UMKM
  await register(page, "Pemilik Uji", uniqueEmail("owner"));
  await createBusiness(page, "E2E Warung Sehat");

  // 2. Owner mengundang 3 karyawan dan mengumpulkan tautannya
  const inviteUrls: string[] = [];
  await page.goto("/karyawan");
  for (const name of EMPLOYEE_NAMES) {
    await page.getByLabel("Nama karyawan").fill(name);
    await page.getByLabel("Email karyawan").fill(uniqueEmail(name.toLowerCase()));
    await page.getByRole("button", { name: "Buat tautan undangan" }).click();
    const link = page.getByLabel("Tautan undangan");
    await expect(link).toBeVisible();
    inviteUrls.push(await link.inputValue());
    await expect(page.getByRole("button", { name: "Buat tautan undangan" })).toBeEnabled();
  }
  expect(inviteUrls).toHaveLength(EMPLOYEE_NAMES.length);

  // 3. Owner membuka periode dan mengisi kuesionernya
  await page.goto("/penilaian");
  await page.getByLabel("Nama periode").fill("Periode E2E");
  await page.getByRole("button", { name: "Buka periode baru" }).click();
  await expect(page.getByText("Periode berjalan: Periode E2E")).toBeVisible();

  await page.getByRole("link", { name: "Isi kuesioner pemilik" }).click();
  await fillSurveyAndSubmit(page, OWNER_LIKERT);

  // 4. Setiap karyawan menerima undangan lalu mengisi (konteks browser terpisah)
  for (const url of inviteUrls) {
    await employeeJoinsAndSubmits(browser, baseURL, url);
  }

  // 5. Owner menutup periode dan melihat hasil
  await page.goto("/penilaian");
  await expect(page.getByText("3 dari 3 karyawan aktif")).toBeVisible();
  await page.getByRole("button", { name: "Tutup periode & hitung hasil" }).click();
  await page.getByRole("button", { name: "Tutup & hitung" }).click();

  await expect(page).toHaveURL(/\/hasil$/);
  await expect(page.getByRole("heading", { name: "Hasil penilaian" })).toBeVisible();
  await expect(page.getByText("Gap persepsi pemilik vs karyawan")).toBeVisible();
  await expect(page.getByText("Butir cross-check")).toBeVisible();
  await expect(page.getByText("lebih tinggi dibanding karyawan").first()).toBeVisible();

  // Owner 3/5 → "Setuju" (75), karyawan "Tidak setuju" (25): gap positif ≈ 50.
  await page.screenshot({ path: "test-results/hasil.png", fullPage: true });

  // Responsif: halaman hasil tetap tanpa scroll horizontal di ponsel (docs/RESPONSIVE.md).
  for (const path of ["/dashboard", "/karyawan", "/penilaian", page.url()]) {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await expectNoHorizontalOverflow(page);
  }
  await page.screenshot({ path: "test-results/hasil-mobile.png", fullPage: true });
});
