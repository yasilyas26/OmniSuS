import { expect, test } from "@playwright/test";

import { createBusiness, grantAdmin, register, uniqueEmail } from "./helpers";

test.describe("rate limit", () => {
  test("login langsung ke API dibatasi per email setelah 10 percobaan", async ({
    request,
    baseURL,
  }) => {
    if (!baseURL) throw new Error("baseURL tidak tersedia");
    const email = uniqueEmail("limit");
    let lastStatus = 0;
    for (let attempt = 1; attempt <= 11; attempt += 1) {
      const response = await request.post("/api/auth/sign-in/email", {
        data: { email, password: "salah-salah-1" },
        headers: { origin: new URL(baseURL).origin },
      });
      lastStatus = response.status();
      if (attempt <= 10) expect(lastStatus).not.toBe(429);
    }
    expect(lastStatus).toBe(429);
  });
});

test.describe("lintas tenant", () => {
  test("owner B mendapat 404 untuk periode milik owner A", async ({ browser, baseURL }) => {
    if (!baseURL) throw new Error("baseURL tidak tersedia");
    const contextA = await browser.newContext({ baseURL, locale: "id-ID" });
    const pageA = await contextA.newPage();
    await register(pageA, "Pemilik A", uniqueEmail("tenant-a"));
    await createBusiness(pageA, "E2E Tenant A");
    await pageA.goto("/penilaian");
    await pageA.getByLabel("Nama periode").fill("Q4 2026");
    await pageA.getByRole("button", { name: "Buka periode baru" }).click();
    const periodLink = pageA.locator('a[href^="/penilaian/"]').first();
    await expect(periodLink).toBeVisible();
    const href = await periodLink.getAttribute("href");
    const assessmentId = href?.split("/")[2];
    expect(assessmentId).toBeTruthy();

    const contextB = await browser.newContext({ baseURL, locale: "id-ID" });
    const pageB = await contextB.newPage();
    await register(pageB, "Pemilik B", uniqueEmail("tenant-b"));
    await createBusiness(pageB, "E2E Tenant B");
    for (const suffix of ["isi", "hasil"]) {
      const response = await pageB.goto(`/penilaian/${assessmentId}/${suffix}`);
      expect(response?.status(), `/${suffix} milik tenant lain harus 404`).toBe(404);
    }
    await contextA.close();
    await contextB.close();
  });
});

test.describe("soft delete UMKM", () => {
  test("owner menghapus UMKM, admin memulihkannya", async ({ browser, baseURL }) => {
    if (!baseURL) throw new Error("baseURL tidak tersedia");
    const name = `E2E Hapus ${Date.now()}`;

    const ownerContext = await browser.newContext({ baseURL, locale: "id-ID" });
    const owner = await ownerContext.newPage();
    await register(owner, "Pemilik Hapus", uniqueEmail("hapus"));
    await createBusiness(owner, name);
    await owner.goto("/umkm");
    await owner.getByRole("button", { name: "Hapus UMKM" }).click();
    const confirmButton = owner.getByRole("button", { name: "Ya, hapus UMKM" });
    await expect(confirmButton).toBeDisabled();
    await owner.getByLabel("Nama usaha").last().fill("nama salah");
    await confirmButton.click();
    await expect(owner.getByText("Nama usaha yang diketik tidak sama.")).toBeVisible();
    await owner.getByLabel("Nama usaha").last().fill(name);
    await confirmButton.click();
    await expect(owner).toHaveURL(/\/umkm-dihapus/);

    // Akses ke data ditutup selama UMKM terhapus.
    await owner.goto("/dashboard");
    await expect(owner).toHaveURL(/\/umkm-dihapus/);

    const adminContext = await browser.newContext({ baseURL, locale: "id-ID" });
    const admin = await adminContext.newPage();
    const adminEmail = uniqueEmail("admin-hapus");
    await register(admin, "Admin Hapus", adminEmail);
    await grantAdmin(adminEmail);
    await admin.goto("/admin/umkm");
    const row = admin.getByRole("row").filter({ hasText: name });
    await expect(row.getByText(/Dihapus/)).toBeVisible();
    await row.getByRole("button", { name: "Pulihkan" }).click();
    await expect(row.getByText("Aktif")).toBeVisible();

    await owner.goto("/dashboard");
    await expect(owner).toHaveURL(/\/dashboard/);
    await ownerContext.close();
    await adminContext.close();
  });
});
