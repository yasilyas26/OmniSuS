import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit berjalan di luar Next, jadi .env.local harus dimuat manual.
config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum diisi di .env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  out: "./drizzle",
  dbCredentials: { url },
});
