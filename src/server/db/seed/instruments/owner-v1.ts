import { type SeedInstrument, likert } from "../types";

// Sumber butir: docs/QUESTIONS.md §4. Status: draf adaptasi, belum tervalidasi.
export const ownerV1: SeedInstrument = {
  code: "OWNER_V1",
  targetRole: "OWNER",
  version: 1,
  scaleMin: 1,
  scaleMax: 5,
  questions: [
    {
      key: "P1",
      type: "BOOLEAN",
      dimension: null,
      text: "Usaha saya memiliki Nomor Induk Berusaha (NIB).",
    },
    {
      key: "P2",
      type: "BOOLEAN",
      dimension: null,
      text: "Usaha saya pernah menerima bantuan pendanaan dari pemerintah.",
    },
    {
      key: "P3",
      type: "BOOLEAN",
      dimension: null,
      text: "Saya pernah mengikuti kegiatan pemerintah (pelatihan, workshop, atau pameran).",
    },
    {
      key: "P4",
      type: "CHOICE",
      dimension: null,
      text: "Sumber modal utama usaha saya:",
      options: [
        "Modal sendiri/keluarga",
        "Pinjaman bank (termasuk KUR)",
        "Pinjaman koperasi/lembaga non-bank",
        "Investor/mitra",
        "Hibah/bantuan pemerintah",
        "Lainnya",
      ],
    },

    likert("O-LD1", "leadership", "Saya mengenal karyawan saya secara personal."),
    likert("O-LD2", "leadership", "Saya memberi contoh kerja yang baik bagi karyawan."),
    likert("O-LD3", "leadership", "Saya menerapkan ide atau saran dari karyawan."),
    likert("O-LD4", "leadership", "Saya terlibat langsung dalam pekerjaan sehari-hari."),
    likert("O-LD5", "leadership", "Saya ikut melatih karyawan baru."),
    likert("O-LD6", "leadership", "Saya bersikap adil saat memberi sanksi kepada karyawan."),
    likert("O-LD7", "leadership", "Saya bersikap adil saat memberi penghargaan kepada karyawan."),
    likert(
      "O-LD8",
      "leadership",
      "Saya jarang punya waktu untuk mendengarkan masukan karyawan.",
      "NEGATIVE",
    ),

    likert(
      "O-WE1",
      "work_environment",
      "Dalam 12 bulan terakhir tidak ada kecelakaan kerja di usaha saya.",
    ),
    likert("O-WE2", "work_environment", "Jam kerja yang saya tetapkan wajar bagi karyawan."),
    likert("O-WE3", "work_environment", "Beban kerja karyawan terbagi secara seimbang."),
    likert("O-WE4", "work_environment", "Pencahayaan di tempat kerja memadai."),
    likert("O-WE5", "work_environment", "Suhu di tempat kerja nyaman."),
    likert("O-WE6", "work_environment", "Tingkat kebisingan di tempat kerja tidak mengganggu."),
    likert(
      "O-WE7",
      "work_environment",
      "Karyawan sering harus lembur untuk menyelesaikan pekerjaan.",
      "NEGATIVE",
    ),

    likert("O-WC1", "work_culture", "Karyawan saya bertanggung jawab atas pekerjaannya."),
    likert("O-WC2", "work_culture", "Karyawan saya jarang absen tanpa alasan."),
    likert("O-WC3", "work_culture", "Karyawan bebas membicarakan kesulitan kerja dengan saya."),
    likert("O-WC4", "work_culture", "Suasana kerja di usaha saya positif."),
    likert("O-WC5", "work_culture", "Semangat kerja karyawan saya tinggi."),
    likert("O-WC6", "work_culture", "Karyawan saling membantu saat dibutuhkan."),
    likert("O-WC7", "work_culture", "Karyawan saling percaya satu sama lain."),
    likert("O-WC8", "work_culture", "Kerja sama tim berjalan efektif."),
    likert("O-WC9", "work_culture", "Karyawan saling menghormati."),
    likert(
      "O-WC10",
      "work_culture",
      "Karyawan memaknai pekerjaannya lebih dari sekadar mencari penghasilan.",
    ),
    likert(
      "O-WC11",
      "work_culture",
      "Konflik antarkaryawan sering mengganggu pekerjaan.",
      "NEGATIVE",
    ),

    likert("O-RO1", "resources_operations", "Peralatan atau mesin usaha saya dalam kondisi baik."),
    likert("O-RO2", "resources_operations", "Pasokan bahan baku atau barang datang tepat waktu."),
    likert(
      "O-RO3",
      "resources_operations",
      "Usaha saya sering terhambat karena kekurangan bahan baku atau stok.",
      "NEGATIVE",
    ),
    likert(
      "O-RO4",
      "resources_operations",
      "Saya dapat memperkirakan jumlah permintaan setiap bulan.",
    ),

    likert("O-MC1", "market_customers", "Banyak pelanggan saya yang kembali membeli."),
    likert(
      "O-MC2",
      "market_customers",
      "Usaha saya mendapatkan pelanggan baru dalam 6 bulan terakhir.",
    ),
    likert(
      "O-MC3",
      "market_customers",
      "Penjualan 12 bulan terakhir meningkat dibanding tahun sebelumnya.",
    ),
    likert(
      "O-MC4",
      "market_customers",
      "Saya rutin memakai media sosial, website, atau iklan digital untuk promosi.",
    ),
    likert(
      "O-MC5",
      "market_customers",
      "Saya bekerja sama dengan usaha lain untuk mengembangkan bisnis.",
    ),
    likert(
      "O-MC6",
      "market_customers",
      "Penjualan usaha saya bergantung pada sedikit pelanggan saja.",
      "NEGATIVE",
    ),

    likert("O-FN1", "finance", "Modal kerja cukup untuk operasional harian."),
    likert("O-FN2", "finance", "Gaji karyawan dibayar tepat waktu.", "POSITIVE", {
      pairKey: "salary_on_time",
    }),
    likert(
      "O-FN3",
      "finance",
      "Cicilan pinjaman atau utang usaha dapat dibayar sesuai jadwal.",
      "POSITIVE",
      { allowNotApplicable: true },
    ),
    likert("O-FN4", "finance", "Kas usaha cukup untuk menutup pengeluaran bulanan."),
    likert("O-FN5", "finance", "Kas usaha stabil dari bulan ke bulan."),
    likert(
      "O-FN6",
      "finance",
      "Dalam 12 bulan terakhir saya pernah menunda pembayaran ke pemasok karena kas tidak cukup.",
      "NEGATIVE",
    ),
  ],
};
