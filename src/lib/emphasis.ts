export type TextPart = { text: string; emphasized: boolean };

const EMPHASIS = /\*([^*]+)\*/g;

/** Memecah teks berpenanda `*kata*` menjadi bagian biasa dan bagian beremfasis (untuk judul serif-italik). */
export function splitEmphasis(input: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;
  for (const match of input.matchAll(EMPHASIS)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: input.slice(cursor, start), emphasized: false });
    parts.push({ text: match[1] ?? "", emphasized: true });
    cursor = start + match[0].length;
  }
  if (cursor < input.length) parts.push({ text: input.slice(cursor), emphasized: false });
  return parts;
}

/** Mengisi token `{nama}` dengan nilai; token yang tidak dikenal dibiarkan apa adanya. */
export function fillTokens(input: string, values: Record<string, string | number>): string {
  return input.replace(/\{(\w+)\}/g, (token, name: string) =>
    name in values ? String(values[name]) : token,
  );
}
