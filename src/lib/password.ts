import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Kata sandi terlalu pendek (min. ${MIN_PASSWORD_LENGTH} karakter).`)
  .max(MAX_PASSWORD_LENGTH, "Kata sandi terlalu panjang.")
  .regex(/[a-z]/, "Tambahkan huruf kecil.")
  .regex(/[A-Z]/, "Tambahkan huruf besar.")
  .regex(/[0-9]/, "Tambahkan angka.")
  .regex(/[^a-zA-Z0-9]/, "Tambahkan simbol, mis. ! @ #.");

/** Aturan untuk indikator di form; selaras dengan `passwordSchema`. */
export const PASSWORD_RULES = [
  {
    key: "length",
    label: `Min. ${MIN_PASSWORD_LENGTH} karakter`,
    test: (v: string) => v.length >= MIN_PASSWORD_LENGTH,
  },
  { key: "lower", label: "Huruf kecil", test: (v: string) => /[a-z]/.test(v) },
  { key: "upper", label: "Huruf besar", test: (v: string) => /[A-Z]/.test(v) },
  { key: "number", label: "Angka", test: (v: string) => /[0-9]/.test(v) },
  { key: "symbol", label: "Simbol", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
] as const;

/** Ringkasan aturan untuk teks bantuan di form. */
export const PASSWORD_HINT = `Min. ${MIN_PASSWORD_LENGTH} karakter: huruf besar, kecil, angka, simbol.`;
