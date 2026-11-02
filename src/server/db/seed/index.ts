import { eq, sql } from "drizzle-orm";

import { db } from "../client";
import { dimensions, instruments, questionOptions, questions } from "../schema";
import { dimensionSeed } from "./dimensions";
import { employeeV1 } from "./instruments/employee-v1";
import { ownerV1 } from "./instruments/owner-v1";
import type { SeedInstrument } from "./types";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function seedDimensions(tx: Tx) {
  for (const [index, dimension] of dimensionSeed.entries()) {
    await tx
      .insert(dimensions)
      .values({ ...dimension, sortOrder: index + 1 })
      .onConflictDoUpdate({
        target: dimensions.key,
        // Teks yang sudah ada milik admin (bisa diedit di dashboard): hanya isi terjemahan yang masih kosong.
        set: {
          nameEn: sql`coalesce(${dimensions.nameEn}, ${dimension.nameEn})`,
          descriptionEn: sql`coalesce(${dimensions.descriptionEn}, ${dimension.descriptionEn})`,
        },
      });
  }
  const rows = await tx.select({ id: dimensions.id, key: dimensions.key }).from(dimensions);
  return new Map(rows.map((row) => [row.key, row.id]));
}

async function seedInstrument(tx: Tx, seed: SeedInstrument, dimensionIds: Map<string, string>) {
  const { questions: seedQuestions, ...header } = seed;
  await tx
    .insert(instruments)
    .values({ ...header, isActive: true })
    .onConflictDoNothing({ target: instruments.code });

  const [instrument] = await tx.select().from(instruments).where(eq(instruments.code, seed.code));
  if (!instrument) throw new Error(`Instrumen ${seed.code} tidak ditemukan setelah insert`);

  const existing = await tx
    .select({ key: questions.key, text: questions.text })
    .from(questions)
    .where(eq(questions.instrumentId, instrument.id));
  const existingByKey = new Map(existing.map((row) => [row.key, row.text]));

  let inserted = 0;
  for (const [index, question] of seedQuestions.entries()) {
    const existingText = existingByKey.get(question.key);
    if (existingText !== undefined) {
      // Aturan 10 CLAUDE.md: mengubah teks butir = versi instrumen baru, bukan menimpa.
      if (existingText !== question.text) {
        throw new Error(
          `Teks butir ${seed.code}/${question.key} berubah. Buat versi instrumen baru.`,
        );
      }
      continue;
    }

    const dimensionId = question.dimension ? dimensionIds.get(question.dimension) : null;
    if (question.dimension && !dimensionId)
      throw new Error(`Faktor ${question.dimension} tidak ada`);

    const [row] = await tx
      .insert(questions)
      .values({
        instrumentId: instrument.id,
        key: question.key,
        type: question.type,
        dimensionId: dimensionId ?? null,
        text: question.text,
        polarity: question.polarity ?? null,
        allowNotApplicable: question.allowNotApplicable ?? false,
        pairKey: question.pairKey ?? null,
        sortOrder: index + 1,
      })
      .returning({ id: questions.id });
    if (!row) throw new Error(`Gagal menyimpan butir ${question.key}`);

    if (question.options) {
      await tx.insert(questionOptions).values(
        question.options.map((label, optionIndex) => ({
          questionId: row.id,
          label,
          sortOrder: optionIndex + 1,
        })),
      );
    }
    inserted += 1;
  }
  return { code: seed.code, total: seedQuestions.length, inserted };
}

async function main() {
  const summary = await db.transaction(async (tx) => {
    const dimensionIds = await seedDimensions(tx);
    const results = [];
    for (const seed of [ownerV1, employeeV1]) {
      results.push(await seedInstrument(tx, seed, dimensionIds));
    }
    return results;
  });

  for (const row of summary) {
    console.log(`${row.code}: ${row.inserted} butir baru dari ${row.total}`);
  }
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Seed gagal:", error instanceof Error ? error.message : error);
  process.exit(1);
});
