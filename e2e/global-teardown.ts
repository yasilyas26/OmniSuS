import { Pool } from "@neondatabase/serverless";

/**
 * Menghapus data uji dan mengembalikan perubahan admin supaya database dev bersih:
 *  - usaha berawalan "E2E " dan email e2e-*,
 *  - konten landing yang disimpan oleh admin uji,
 *  - versi instrumen hasil uji (V2+ tanpa respons) dan mengaktifkan kembali versi awal.
 * Memakai SQL langsung: teardown berjalan di luar resolver alias `@/` milik proyek.
 */
export default async function globalTeardown() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("delete from businesses where name like 'E2E %'");
    // Harus sebelum pengguna dihapus: FK updated_by bersifat "set null", sehingga barisnya akan yatim.
    await pool.query(
      `delete from site_content where updated_by in (select id from "user" where email like 'e2e-%@example.test')`,
    );
    await pool.query(
      `delete from instruments i
       where i.code ~ '_V[2-9][0-9]*$'
         and not exists (select 1 from responses r where r.instrument_id = i.id)`,
    );
    await pool.query(
      `update instruments set is_active = true
       where code in ('OWNER_V1', 'EMPLOYEE_V1')
         and not exists (
           select 1 from instruments other
           where other.target_role = instruments.target_role and other.is_active
         )`,
    );
    await pool.query("delete from rate_limits");
    await pool.query(
      `delete from audit_logs where actor_id in (select id from "user" where email like 'e2e-%@example.test')`,
    );
    await pool.query(`delete from "user" where email like 'e2e-%@example.test'`);
  } finally {
    await pool.end();
  }
}
