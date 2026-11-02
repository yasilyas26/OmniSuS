import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// Test E2E memakai database dari .env.local; data uji dibersihkan di global teardown.
config({ path: ".env.local" });

// E2E_PORT memungkinkan menguji server lain (mis. hasil `pnpm build && next start -p 3100`).
const PORT = Number(process.env.E2E_PORT ?? 3000);
const TEST_TIMEOUT_MS = 240_000;

export default defineConfig({
  testDir: "./e2e",
  timeout: TEST_TIMEOUT_MS,
  // Dev server mengompilasi rute saat pertama diakses, jadi 5 dtk bawaan terlalu pendek.
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Bahasa perangkat Indonesia (tanpa header negara di lokal) → situs berbahasa Indonesia.
    // Tes bahasa Inggris menimpa ini lewat test.use({ locale: "en-US" }).
    locale: "id-ID",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Memakai server yang sudah berjalan bila ada (mis. `pnpm dev`), jika tidak, jalankan sendiri.
  webServer: {
    command: "pnpm dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
