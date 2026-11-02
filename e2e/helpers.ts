import { Pool } from "@neondatabase/serverless";
import { type Page, expect } from "@playwright/test";

export const PASSWORD = "Password-e2e-123!";

const SUBPIXEL_TOLERANCE = 1;

/** Halaman tidak boleh bisa digulir ke samping (docs/RESPONSIVE.md §1). */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "halaman tidak boleh bisa digulir ke samping").toBeLessThanOrEqual(
    SUBPIXEL_TOLERANCE,
  );
}

export const uniqueEmail = (label: string) => `e2e-${label}-${Date.now()}@example.test`;

/** Peran admin hanya bisa diberikan lewat database (seperti `pnpm admin:grant`), tidak lewat UI. */
export async function grantAdmin(email: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(`update "user" set is_admin = true where email = $1`, [email]);
    expect(result.rowCount).toBe(1);
  } finally {
    await pool.end();
  }
}

export async function register(page: Page, name: string, email: string) {
  await page.goto("/daftar");
  await page.getByLabel("Nama lengkap").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Konfirmasi kata sandi").fill(PASSWORD);
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding/);
}

export async function createBusiness(page: Page, name: string) {
  await page.getByLabel("Nama usaha").fill(name);
  await page.getByRole("combobox", { name: "Sektor usaha" }).click();
  await page.getByRole("option", { name: "Kuliner" }).click();
  await page.getByLabel("Kota").fill("Bandung");
  await page.getByLabel("Jumlah karyawan").fill("3");
  await page.getByRole("button", { name: "Simpan & lanjut" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Menjawab semua butir di satu langkah. `likertIndex`: 0 = Sangat tidak setuju … 4 = Sangat setuju.
 * Butir bukan-Likert (Ya/Tidak, pilihan) dijawab opsi pertama.
 */
async function answerCurrentStep(page: Page, likertIndex: number) {
  const fieldsets = page.locator("fieldset");
  const total = await fieldsets.count();
  for (let i = 0; i < total; i += 1) {
    const radios = fieldsets.nth(i).getByRole("radio");
    const count = await radios.count();
    await radios.nth(count >= 5 ? likertIndex : 0).click();
  }
}

export async function fillSurveyAndSubmit(page: Page, likertIndex: number) {
  // Klik sebelum hidrasi selesai tidak tercatat di state form; tunggu JS halaman termuat dulu.
  await page.waitForLoadState("networkidle");
  for (let guard = 0; guard < 12; guard += 1) {
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    if (await page.getByRole("heading", { name: "Ringkasan" }).isVisible()) break;
    await answerCurrentStep(page, likertIndex);
    const next = page.getByRole("button", { name: /^(Lanjut|Lihat ringkasan)$/ });
    await next.click();
    await expect(page.getByRole("button", { name: "Menyimpan…" })).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { name: "Ringkasan" })).toBeVisible();
  await page.getByRole("button", { name: "Kirim final" }).click();
  await page.getByRole("button", { name: "Ya, kirim final" }).click();
  await expect(page.getByText("jawabanmu sudah terkirim")).toBeVisible();
}
