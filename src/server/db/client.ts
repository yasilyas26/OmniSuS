import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@/env";

import * as schema from "./schema";

// Pool (WebSocket), bukan neon-http, karena hanya Pool yang mendukung transaksi interaktif.
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
/** Repository menerima `db` atau transaksi berjalan, agar service bisa membungkus beberapa tulis. */
export type DbOrTx = typeof db | Tx;
