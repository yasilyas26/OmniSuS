import { z } from "zod";

export const BUSINESS_SECTORS = [
  "KULINER",
  "FASHION",
  "KRIYA",
  "JASA",
  "PERDAGANGAN",
  "LAINNYA",
] as const;

export const SECTOR_LABELS: Record<(typeof BUSINESS_SECTORS)[number], string> = {
  KULINER: "Kuliner",
  FASHION: "Fashion",
  KRIYA: "Kriya",
  JASA: "Jasa",
  PERDAGANGAN: "Perdagangan",
  LAINNYA: "Lainnya",
};

const MIN_FOUNDED_YEAR = 1900;
const MAX_EMPLOYEES = 300;

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Nama usaha minimal 2 karakter.").max(120),
  sector: z.enum(BUSINESS_SECTORS, { error: "Pilih sektor usaha." }),
  city: z.string().trim().min(2, "Kota minimal 2 karakter.").max(80),
  employeeCount: z
    .number({ error: "Isi jumlah karyawan." })
    .int("Harus bilangan bulat.")
    .min(0, "Tidak boleh negatif.")
    .max(MAX_EMPLOYEES, `Maksimal ${MAX_EMPLOYEES}.`),
  foundedYear: z
    .number()
    .int()
    .min(MIN_FOUNDED_YEAR, `Tahun minimal ${MIN_FOUNDED_YEAR}.`)
    .max(new Date().getFullYear(), "Tahun tidak boleh di masa depan.")
    .nullable(),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const deleteBusinessSchema = z.object({
  confirmName: z.string().trim().min(1, "Ketik nama usaha untuk konfirmasi."),
});

export const restoreBusinessSchema = z.object({ businessId: z.uuid() });
