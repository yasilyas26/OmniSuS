import { eq } from "drizzle-orm";

import { db } from "../client";
import { user } from "../schema";

// Pemakaian: pnpm admin:grant <email>   |   pnpm admin:revoke <email>
// Satu-satunya cara memberi peran admin; dijalankan dari komputer yang memegang DATABASE_URL.
async function main() {
  const [mode, rawEmail] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  if ((mode !== "grant" && mode !== "revoke") || !email) {
    throw new Error("Pemakaian: admin.ts <grant|revoke> <email>");
  }

  const rows = await db
    .update(user)
    .set({ isAdmin: mode === "grant" })
    .where(eq(user.email, email))
    .returning({ email: user.email, isAdmin: user.isAdmin });

  if (rows.length === 0)
    throw new Error(`Tidak ada akun dengan email ${email}. Daftar dulu di /daftar.`);
  console.log(`${rows[0]?.email}: admin = ${rows[0]?.isAdmin}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
