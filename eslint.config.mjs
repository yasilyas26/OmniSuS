import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

// Batas lapisan: lihat docs/ARCHITECTURE.md §3. Flat config tidak menggabungkan
// opsi rule yang sama antar-blok, jadi setiap blok menyusun daftarnya dari sini.
const FEATURE_DEEP_IMPORT = {
  group: ["@/features/*/*"],
  message: "Import antar-feature hanya lewat '@/features/<nama>' (index.ts publik).",
};

const DB_IMPORT = {
  group: ["@/server/db", "@/server/db/*", "**/repository", "**/repository.ts"],
  message: "Komponen tidak boleh mengimpor repository atau DB. Lewat action/service.",
};

const IO_IMPORT = {
  group: [
    "@/server/*",
    "@/features/*",
    "next",
    "next/*",
    "server-only",
    "drizzle-orm",
    "drizzle-orm/*",
  ],
  message: "domain/ harus murni: tanpa I/O, DB, Next, atau feature lain.",
};

const restrict = (...patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: restrict(FEATURE_DEEP_IMPORT) },
  {
    files: ["src/components/**", "src/features/*/components/**", "src/app/**/*.tsx"],
    rules: restrict(FEATURE_DEEP_IMPORT, DB_IMPORT),
  },
  {
    files: ["src/domain/**"],
    rules: restrict(FEATURE_DEEP_IMPORT, IO_IMPORT),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
  ]),
]);

export default eslintConfig;
