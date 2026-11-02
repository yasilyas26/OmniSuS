import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

import { createBusiness, grantAdmin, register, uniqueEmail } from "./helpers";

// Audit otomatis WCAG 2.1 A/AA (docs/FRONTEND.md §9). Hanya pelanggaran serius/kritis yang menggagalkan;
// sisanya (axe tidak bisa menilai sendiri) tetap perlu pengecekan manual.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoSeriousViolations(page: Page, label: string) {
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = serious.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
  expect(summary, `${label}: pelanggaran aksesibilitas`).toEqual([]);
}

test.describe("aksesibilitas", () => {
  test("halaman publik", async ({ page }) => {
    for (const path of ["/", "/metodologi", "/privasi", "/masuk", "/daftar"]) {
      await page.goto(path);
      await expectNoSeriousViolations(page, path);
    }
  });

  test("dashboard pemilik dan admin", async ({ page }) => {
    const email = uniqueEmail("a11y");
    await register(page, "Pemilik A11y", email);
    await createBusiness(page, "E2E A11y");
    for (const path of ["/dashboard", "/karyawan", "/penilaian", "/umkm"]) {
      await page.goto(path);
      await expectNoSeriousViolations(page, path);
    }
    await grantAdmin(email);
    for (const path of [
      "/admin",
      "/admin/instrumen",
      "/admin/faktor",
      "/admin/landing",
      "/admin/umkm",
      "/admin/riwayat",
    ]) {
      await page.goto(path);
      await expectNoSeriousViolations(page, path);
    }
  });
});
