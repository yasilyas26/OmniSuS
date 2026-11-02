import { sql } from "drizzle-orm";
import "server-only";

import { db } from "@/server/db/client";

// Periode TERTUTUP terakhir per UMKM (DATABASE.md §3). Hanya agregat yang keluar dari sini.
const LATEST = sql`
  latest AS (
    SELECT DISTINCT ON (a.business_id) a.id AS assessment_id, a.business_id
    FROM assessments a
    JOIN businesses live ON live.id = a.business_id AND live.deleted_at IS NULL
    WHERE a.status = 'CLOSED'
    ORDER BY a.business_id, a.closed_at DESC
  )
`;

type Row<T> = T & Record<string, unknown>;

export async function queryOverview() {
  const result = await db.execute<
    Row<{ businesses: number; respondents: number; avg_score: string | null; has_demo: boolean }>
  >(sql`
    WITH ${LATEST}
    SELECT count(*)::int AS businesses,
           coalesce(sum(1 + r.employee_respondents), 0)::int AS respondents,
           avg(r.combined_score) AS avg_score,
           coalesce(bool_or(b.is_demo), false) AS has_demo
    FROM latest l
    JOIN assessment_results r ON r.assessment_id = l.assessment_id
    JOIN businesses b ON b.id = l.business_id
  `);
  return result.rows[0];
}

export async function queryCategories() {
  const result = await db.execute<
    Row<{ category: "HEALTHY" | "FAIR" | "AT_RISK"; total: number }>
  >(sql`
    WITH ${LATEST}
    SELECT r.category, count(*)::int AS total
    FROM latest l
    JOIN assessment_results r ON r.assessment_id = l.assessment_id
    GROUP BY r.category
  `);
  return result.rows;
}

export async function queryDimensions() {
  const result = await db.execute<
    Row<{
      key: string;
      name: string;
      description: string;
      name_en: string | null;
      description_en: string | null;
      is_shared: boolean;
      owner_avg: string | null;
      employee_avg: string | null;
    }>
  >(sql`
    WITH ${LATEST}
    SELECT d.key, d.name, d.description, d.name_en, d.description_en, d.is_shared,
           avg(dr.owner_score) AS owner_avg,
           avg(dr.employee_score) AS employee_avg
    FROM dimensions d
    LEFT JOIN dimension_results dr ON dr.dimension_id = d.id
      AND dr.assessment_id IN (SELECT assessment_id FROM latest)
    GROUP BY d.id
    ORDER BY d.sort_order
  `);
  return result.rows;
}

export async function querySectors() {
  const result = await db.execute<Row<{ sector: string; total: number }>>(sql`
    WITH ${LATEST}
    SELECT b.sector::text AS sector, count(*)::int AS total
    FROM latest l
    JOIN businesses b ON b.id = l.business_id
    GROUP BY b.sector
  `);
  return result.rows;
}

/** Profil usaha dari butir P1–P3 (Ya/Tidak) milik pemilik pada periode terakhir. */
export async function queryProfileFlags() {
  const result = await db.execute<Row<{ key: string; yes: number; total: number }>>(sql`
    WITH ${LATEST}
    SELECT q.key,
           count(*) FILTER (WHERE a.bool_value)::int AS yes,
           count(*)::int AS total
    FROM latest l
    JOIN responses resp ON resp.assessment_id = l.assessment_id AND resp.status = 'SUBMITTED'
    JOIN instruments i ON i.id = resp.instrument_id AND i.target_role = 'OWNER'
    JOIN answers a ON a.response_id = resp.id
    JOIN questions q ON q.id = a.question_id
    WHERE q.key IN ('P1', 'P2', 'P3') AND a.bool_value IS NOT NULL
    GROUP BY q.key
  `);
  return result.rows;
}

export async function queryCapitalSources() {
  const result = await db.execute<Row<{ label: string; total: number }>>(sql`
    WITH ${LATEST}
    SELECT o.label, count(*)::int AS total
    FROM latest l
    JOIN responses resp ON resp.assessment_id = l.assessment_id AND resp.status = 'SUBMITTED'
    JOIN instruments i ON i.id = resp.instrument_id AND i.target_role = 'OWNER'
    JOIN answers a ON a.response_id = resp.id
    JOIN questions q ON q.id = a.question_id AND q.key = 'P4'
    JOIN question_options o ON o.id = a.option_id
    GROUP BY o.label
    ORDER BY total DESC
  `);
  return result.rows;
}
