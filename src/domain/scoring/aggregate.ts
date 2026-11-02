/** Rata-rata aritmetika; null untuk daftar kosong. */
export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Pembulatan 2 desimal, sesuai kolom numeric(5,2). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Rata-rata berbobot skor faktor. Faktor bernilai null dikeluarkan dan bobot
 * sisanya dinormalisasi ulang; null jika semuanya null.
 */
export function overallScore(
  dims: readonly { score: number | null; weight: number }[],
): number | null {
  let weightSum = 0;
  let total = 0;
  for (const dim of dims) {
    if (dim.score === null) continue;
    weightSum += dim.weight;
    total += dim.score * dim.weight;
  }
  if (weightSum === 0) return null;
  return total / weightSum;
}

/** Skor gabungan owner & karyawan. Tanpa data karyawan, pakai skor owner saja. */
export function combinedScore(owner: number, employee: number | null, ownerWeight: number): number {
  if (ownerWeight < 0 || ownerWeight > 1) throw new RangeError("ownerWeight harus 0..1");
  if (employee === null) return owner;
  return owner * ownerWeight + employee * (1 - ownerWeight);
}
