import type { SectionKey } from "./schemas";

export type FieldKind = "text" | "textarea" | "icon";
export type FieldDef = { name: string; label: string; kind: FieldKind; hint?: string };
export type ListDef = {
  name: string;
  label: string;
  itemTitle: string;
  fields: FieldDef[];
  min: number;
  max: number;
};
export type SectionDef = {
  key: SectionKey;
  title: string;
  hint: string;
  fields: FieldDef[];
  lists: ListDef[];
};

const EMPHASIS_HINT = "Bungkus kata dengan *tanda bintang* agar tampil miring serif.";

// Batas min/max di sini hanya untuk tombol tambah/hapus; validasi sebenarnya ada di schemas.ts.
export const SECTION_DEFS: readonly SectionDef[] = [
  {
    key: "hero",
    title: "Hero (bagian paling atas)",
    hint: "Judul besar dan dua tombol di atas halaman.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
      { name: "primaryCta", label: "Tombol utama", kind: "text" },
      { name: "secondaryCta", label: "Tombol kedua", kind: "text" },
    ],
    lists: [],
  },
  {
    key: "partners",
    title: "Logo UMKM mitra",
    hint: "Pita logo yang berjalan di bawah hero. Gunakan hanya mitra yang benar-benar bekerja sama.",
    fields: [{ name: "caption", label: "Keterangan di bawah pita (boleh kosong)", kind: "text" }],
    lists: [
      {
        name: "items",
        label: "Logo",
        itemTitle: "Logo",
        min: 2,
        max: 12,
        fields: [
          { name: "name", label: "Nama", kind: "text" },
          { name: "icon", label: "Ikon", kind: "icon" },
        ],
      },
    ],
  },
  {
    key: "about",
    title: "About us",
    hint: "Penjelasan singkat produk dan tiga angka fakta.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
    ],
    lists: [
      {
        name: "facts",
        label: "Fakta",
        itemTitle: "Fakta",
        min: 1,
        max: 4,
        fields: [
          { name: "value", label: "Angka", kind: "text" },
          { name: "label", label: "Keterangan", kind: "text" },
        ],
      },
    ],
  },
  {
    key: "effectiveness",
    title: "Seberapa efektif",
    hint: "Hanya teksnya yang bisa diubah. Angkanya selalu dihitung otomatis dari penilaian yang sudah ditutup.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
      {
        name: "disclaimer",
        label: "Catatan batasan",
        kind: "textarea",
        hint: "Sebaiknya tetap menyebut bahwa skor adalah indikator persepsi, bukan audit.",
      },
    ],
    lists: [],
  },
  {
    key: "coreFeatures",
    title: "Core features",
    hint: "Kartu fitur utama.",
    fields: [{ name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT }],
    lists: [
      {
        name: "items",
        label: "Fitur",
        itemTitle: "Fitur",
        min: 1,
        max: 6,
        fields: [
          { name: "icon", label: "Ikon", kind: "icon" },
          { name: "title", label: "Judul", kind: "text" },
          { name: "description", label: "Deskripsi", kind: "textarea" },
        ],
      },
    ],
  },
  {
    key: "benefits",
    title: "Benefit",
    hint: "Kartu manfaat.",
    fields: [{ name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT }],
    lists: [
      {
        name: "items",
        label: "Manfaat",
        itemTitle: "Manfaat",
        min: 1,
        max: 6,
        fields: [
          { name: "icon", label: "Ikon", kind: "icon" },
          { name: "title", label: "Judul", kind: "text" },
          { name: "description", label: "Deskripsi", kind: "textarea" },
        ],
      },
    ],
  },
  {
    key: "privacy",
    title: "Privasi",
    hint: "Panel gelap berisi janji privasi. Tulis {min} untuk memasukkan batas minimum responden otomatis.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
      { name: "buttonLabel", label: "Tombol menuju halaman privasi", kind: "text" },
    ],
    lists: [
      {
        name: "points",
        label: "Poin",
        itemTitle: "Poin",
        min: 1,
        max: 4,
        fields: [
          { name: "icon", label: "Ikon", kind: "icon" },
          { name: "title", label: "Judul", kind: "text" },
          { name: "text", label: "Teks", kind: "textarea" },
        ],
      },
    ],
  },
  {
    key: "testimonials",
    title: "Testimoni",
    hint: "Kartu yang bergerak otomatis. Pakai testimoni asli dengan izin; yang berlabel contoh jangan disajikan sebagai ulasan sungguhan.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
    ],
    lists: [
      {
        name: "items",
        label: "Testimoni",
        itemTitle: "Testimoni",
        min: 1,
        max: 10,
        fields: [
          { name: "name", label: "Nama", kind: "text" },
          { name: "role", label: "Jabatan / usaha", kind: "text" },
          { name: "quote", label: "Kutipan", kind: "textarea" },
        ],
      },
    ],
  },
  {
    key: "cta",
    title: "Ajakan akhir (Get started)",
    hint: "Panel biru di bagian bawah.",
    fields: [
      { name: "title", label: "Judul", kind: "text", hint: EMPHASIS_HINT },
      { name: "description", label: "Deskripsi", kind: "textarea" },
      { name: "button", label: "Tombol", kind: "text" },
    ],
    lists: [],
  },
  {
    key: "footer",
    title: "Footer",
    hint: "Teks di kaki halaman. Tautan kolom bersifat tetap.",
    fields: [
      { name: "emailLabel", label: "Label kolom email", kind: "text" },
      { name: "note", label: "Catatan hak cipta", kind: "textarea" },
    ],
    lists: [],
  },
];
