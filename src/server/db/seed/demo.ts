import { eq, like } from "drizzle-orm";

import { SCORING_VERSION, computeAssessmentResult } from "../../../domain/scoring";
import type { AnswerDef, QuestionDef } from "../../../domain/scoring";
import { db } from "../client";
import {
  answers,
  assessmentResults,
  assessments,
  businesses,
  crossCheckResults,
  dimensionResults,
  dimensions,
  instruments,
  memberships,
  questionOptions,
  questions,
  responses,
  user,
} from "../schema";

// Data fiktif untuk demo: SEMUA baris ditandai is_demo / email demo-*@demo.invalid.
const DEMO_BUSINESS_COUNT = 24;
const SEED = 20_261_101;
const CHUNK = 400;
const MIN_EMPLOYEES = 3;
const NA_PROBABILITY = 0.15;
const OWNER_OPTIMISM = 0.12;
const MS_PER_DAY = 86_400_000;
const MAX_AGE_DAYS = 180;
const PROFILE_PROBABILITY: Record<string, number> = { P1: 0.62, P2: 0.22, P3: 0.38 };

const NAMES = [
  "Warung Nusantara",
  "Kopi Senja",
  "Batik Laras",
  "Dapur Ibu Sari",
  "Kriya Bambu Asri",
  "Jasa Cuci Kilat",
  "Toko Berkah Jaya",
  "Roti Hangat",
  "Kain Tenun Mitra",
  "Bengkel Maju Terus",
  "Katering Selera Kita",
  "Sablon Kreatif",
  "Warung Sate Pak Dedi",
  "Laundry Bersih",
  "Mebel Jati Karya",
  "Es Teh Segar",
  "Konveksi Rapi",
  "Toko Kelontong Rezeki",
  "Bakso Mang Ujang",
  "Salon Cantik",
  "Keripik Renyah",
  "Fotokopi Cepat",
  "Kerajinan Tanah Liat",
  "Pangkas Rapi",
];
const SECTORS = [
  "KULINER",
  "KULINER",
  "KULINER",
  "FASHION",
  "KRIYA",
  "JASA",
  "JASA",
  "PERDAGANGAN",
  "PERDAGANGAN",
] as const;
const CITIES = [
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Medan",
  "Makassar",
  "Semarang",
  "Malang",
  "Denpasar",
];
const P4_WEIGHTS = [0.55, 0.2, 0.08, 0.05, 0.07, 0.05];

/** PRNG kecil berbenih tetap supaya data demo identik di setiap eksekusi. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}
const random = mulberry32(SEED);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)] as T;

function weightedIndex(weights: readonly number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;
  for (const [index, weight] of weights.entries()) {
    cursor -= weight;
    if (cursor <= 0) return index;
  }
  return weights.length - 1;
}

/** Nilai 1–5 di sekitar `quality` (0–1) dengan derau; butir negatif dibalik. */
function sampleLikert(quality: number, polarity: "POSITIVE" | "NEGATIVE") {
  const good = clamp(Math.round(1 + 4 * clamp(quality + (random() - 0.5) * 0.5, 0, 1)), 1, 5);
  return polarity === "NEGATIVE" ? 6 - good : good;
}

type QuestionRow = typeof questions.$inferSelect;
type AnswerRow = typeof answers.$inferInsert;

function toDef(row: QuestionRow): QuestionDef {
  return {
    id: row.id,
    type: row.type,
    dimensionId: row.dimensionId,
    polarity: row.polarity,
    weight: Number(row.weight),
    pairKey: row.pairKey,
  };
}

function makeAnswers(
  responseId: string,
  rows: readonly QuestionRow[],
  optionIds: Map<string, string[]>,
  quality: number,
): AnswerRow[] {
  return rows.map((question) => {
    const base = { responseId, questionId: question.id };
    if (question.type === "BOOLEAN") {
      return { ...base, boolValue: random() < (PROFILE_PROBABILITY[question.key] ?? 0.5) };
    }
    if (question.type === "CHOICE") {
      const options = optionIds.get(question.id) ?? [];
      return { ...base, optionId: options[weightedIndex(P4_WEIGHTS)] ?? options[0] };
    }
    if (question.allowNotApplicable && random() < NA_PROBABILITY) {
      return { ...base, isNotApplicable: true };
    }
    return { ...base, likertValue: sampleLikert(quality, question.polarity ?? "POSITIVE") };
  });
}

const toAnswerDefs = (rows: readonly AnswerRow[]): AnswerDef[] =>
  rows.map((row) => ({
    questionId: row.questionId,
    likertValue: row.likertValue ?? null,
    isNotApplicable: row.isNotApplicable ?? false,
  }));

async function insertChunked<T>(rows: T[], insert: (chunk: T[]) => Promise<unknown>) {
  for (let start = 0; start < rows.length; start += CHUNK) {
    await insert(rows.slice(start, start + CHUNK));
  }
}

async function main() {
  const activeInstruments = await db
    .select()
    .from(instruments)
    .where(eq(instruments.isActive, true));
  const ownerInstrument = activeInstruments.find((row) => row.targetRole === "OWNER");
  const employeeInstrument = activeInstruments.find((row) => row.targetRole === "EMPLOYEE");
  if (!ownerInstrument || !employeeInstrument) throw new Error("Jalankan `pnpm db:seed` dulu.");

  const allQuestions = await db.select().from(questions);
  const ownerQuestions = allQuestions.filter((row) => row.instrumentId === ownerInstrument.id);
  const employeeQuestions = allQuestions.filter(
    (row) => row.instrumentId === employeeInstrument.id,
  );
  const optionRows = await db.select().from(questionOptions);
  const optionIds = new Map<string, string[]>();
  for (const option of optionRows) {
    optionIds.set(option.questionId, [...(optionIds.get(option.questionId) ?? []), option.id]);
  }
  const dimensionRows = await db.select().from(dimensions);
  const dimensionDefs = dimensionRows.map((row) => ({
    id: row.id,
    isShared: row.isShared,
    weight: 1,
  }));
  const statements = new Map(
    ownerQuestions.flatMap((row) => (row.pairKey ? [[row.pairKey, row.text] as const] : [])),
  );

  await db.transaction(async (tx) => {
    // Idempoten: hapus demo lama (cascade ke periode, respons, jawaban, snapshot) lalu buat ulang.
    await tx.delete(businesses).where(eq(businesses.isDemo, true));
    await tx.delete(user).where(like(user.email, "demo-%@demo.invalid"));

    for (let index = 0; index < DEMO_BUSINESS_COUNT; index += 1) {
      const quality = clamp(0.25 + random() * 0.65, 0, 1);
      // Dua UMKM dengan karyawan di bawah minimum agar jalur anonimitas ikut terwakili.
      const employeeTotal = index % 12 === 5 ? 2 : MIN_EMPLOYEES + Math.floor(random() * 5);
      const closedAt = new Date(Date.now() - Math.floor(random() * MAX_AGE_DAYS) * MS_PER_DAY);

      const [business] = await tx
        .insert(businesses)
        .values({
          name: NAMES[index] ?? `Usaha Demo ${index + 1}`,
          sector: pick(SECTORS),
          city: pick(CITIES),
          employeeCount: employeeTotal,
          foundedYear: 2008 + Math.floor(random() * 16),
          isDemo: true,
        })
        .returning({ id: businesses.id });
      if (!business) throw new Error("Gagal membuat UMKM demo");

      const ownerId = `demo-owner-${index}`;
      const employeeIds = Array.from({ length: employeeTotal }, (_, j) => `demo-emp-${index}-${j}`);
      await tx.insert(user).values(
        [ownerId, ...employeeIds].map((id) => ({
          id,
          name: id.startsWith("demo-owner")
            ? `Pemilik Demo ${index + 1}`
            : `Karyawan Demo ${id.slice(9)}`,
          email: `${id}@demo.invalid`,
        })),
      );
      await tx.insert(memberships).values([
        { userId: ownerId, businessId: business.id, role: "OWNER" as const },
        ...employeeIds.map((userId) => ({
          userId,
          businessId: business.id,
          role: "EMPLOYEE" as const,
        })),
      ]);

      const [assessment] = await tx
        .insert(assessments)
        .values({
          businessId: business.id,
          label: "Periode Demo",
          status: "CLOSED",
          openedAt: new Date(closedAt.getTime() - 14 * MS_PER_DAY),
          closedAt,
        })
        .returning({ id: assessments.id });
      if (!assessment) throw new Error("Gagal membuat periode demo");

      const respondents = [
        {
          userId: ownerId,
          instrumentId: ownerInstrument.id,
          rows: ownerQuestions,
          quality: clamp(quality + OWNER_OPTIMISM, 0, 1),
        },
        ...employeeIds.map((userId) => ({
          userId,
          instrumentId: employeeInstrument.id,
          rows: employeeQuestions,
          quality,
        })),
      ];
      const responseRows = await tx
        .insert(responses)
        .values(
          respondents.map((item) => ({
            assessmentId: assessment.id,
            instrumentId: item.instrumentId,
            userId: item.userId,
            status: "SUBMITTED" as const,
            submittedAt: closedAt,
          })),
        )
        .returning({ id: responses.id, userId: responses.userId });

      const answerRows = new Map<string, AnswerRow[]>();
      for (const item of respondents) {
        const response = responseRows.find((row) => row.userId === item.userId);
        if (!response) throw new Error("Respons demo tidak ditemukan");
        answerRows.set(item.userId, makeAnswers(response.id, item.rows, optionIds, item.quality));
      }
      await insertChunked([...answerRows.values()].flat(), (chunk) =>
        tx.insert(answers).values(chunk),
      );

      const result = computeAssessmentResult({
        dimensions: dimensionDefs,
        ownerQuestions: ownerQuestions.map(toDef),
        employeeQuestions: employeeQuestions.map(toDef),
        ownerAnswers: toAnswerDefs(answerRows.get(ownerId) ?? []),
        employeeAnswers: employeeIds.map((id) => toAnswerDefs(answerRows.get(id) ?? [])),
        scale: { min: ownerInstrument.scaleMin, max: ownerInstrument.scaleMax },
        minEmployeeResponses: Number(process.env.MIN_EMPLOYEE_RESPONSES ?? 3),
        ownerWeight: Number(process.env.OWNER_WEIGHT ?? 0.5),
      });

      const numeric = (value: number | null) => (value === null ? null : value.toFixed(2));
      await tx.insert(assessmentResults).values({
        assessmentId: assessment.id,
        ownerScore: result.ownerScore.toFixed(2),
        employeeScore: numeric(result.employeeScore),
        employeeRespondents: result.employeeRespondents,
        combinedScore: result.combinedScore.toFixed(2),
        category: result.category,
        scoringVersion: SCORING_VERSION,
        computedAt: closedAt,
      });
      await tx.insert(dimensionResults).values(
        result.dimensions.map((dimension) => ({
          assessmentId: assessment.id,
          dimensionId: dimension.dimensionId,
          ownerScore: numeric(dimension.ownerScore),
          employeeScore: numeric(dimension.employeeScore),
          gap: numeric(dimension.gap),
        })),
      );
      if (result.crossChecks.length > 0) {
        await tx.insert(crossCheckResults).values(
          result.crossChecks.map((check) => ({
            assessmentId: assessment.id,
            pairKey: check.pairKey,
            statement: statements.get(check.pairKey) ?? check.pairKey,
            ownerValue: check.ownerValue,
            employeeMean: numeric(check.employeeMean),
          })),
        );
      }
    }
  });

  console.log(`Data demo dibuat: ${DEMO_BUSINESS_COUNT} UMKM fiktif (is_demo = true).`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Seed demo gagal:", error instanceof Error ? error.message : error);
  process.exit(1);
});
