import { z } from "zod";

const MIN_AUTH_SECRET_LENGTH = 32;

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgres"),
  BETTER_AUTH_SECRET: z.string().min(MIN_AUTH_SECRET_LENGTH),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  // Alamat publik aplikasi untuk tautan undangan/notifikasi. Terpisah dari BETTER_AUTH_URL
  // karena integrasi Neon Auth bisa menimpanya dengan URL Neon.
  APP_URL: z.url().default("http://localhost:3000"),
  MIN_EMPLOYEE_RESPONSES: z.coerce.number().int().min(1).default(3),
  OWNER_WEIGHT: z.coerce.number().min(0).max(1).default(0.5),
  // Opsional: tanpa N8N_WEBHOOK_URL, notifikasi ke n8n dilewati.
  N8N_WEBHOOK_URL: z.url().optional(),
  N8N_WEBHOOK_SECRET: z.string().min(1).optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (result.success) return result.data;

  // Hanya nama variabel yang ditampilkan; nilai bisa berisi rahasia.
  const invalid = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Env tidak valid atau kurang: ${invalid}. Lihat .env.example.`);
}

export const env = parseEnv();
