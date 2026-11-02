import { z } from "zod";

const MIN_AUTH_SECRET_LENGTH = 32;

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgres"),
  BETTER_AUTH_SECRET: z.string().min(MIN_AUTH_SECRET_LENGTH),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  MIN_EMPLOYEE_RESPONSES: z.coerce.number().int().min(1).default(3),
  OWNER_WEIGHT: z.coerce.number().min(0).max(1).default(0.5),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (result.success) return result.data;

  // Hanya nama variabel yang ditampilkan; nilai bisa berisi rahasia.
  const invalid = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Env tidak valid atau kurang: ${invalid}. Lihat .env.example.`);
}

export const env = parseEnv();
