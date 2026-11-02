/** Selisih (poin) di bawah ini dianggap selaras; ambang sementara, belum tervalidasi. */
export const NOTABLE_GAP = 10;

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Kalimat interpretasi gap yang netral (FRONTEND.md §3). Gap = owner − karyawan.
 * Tidak menyiratkan siapa yang "benar": hanya menyebut selisih persepsi.
 */
export function describeGap(dimensionName: string, gap: number): string {
  const size = Math.abs(gap);
  if (size < NOTABLE_GAP) {
    return `Penilaian owner dan karyawan pada ${dimensionName} cukup selaras (selisih ${round1(size)} poin).`;
  }
  const direction = gap > 0 ? "lebih tinggi" : "lebih rendah";
  return `Penilaian owner pada ${dimensionName} ${round1(size)} poin ${direction} dibanding karyawan.`;
}
