import { type SeedInstrument, likert } from "../types";

// Sumber butir: docs/QUESTIONS.md §5. Status: draf adaptasi, belum tervalidasi.
export const employeeV1: SeedInstrument = {
  code: "EMPLOYEE_V1",
  targetRole: "EMPLOYEE",
  version: 1,
  scaleMin: 1,
  scaleMax: 5,
  questions: [
    likert("E-LD1", "leadership", "Pimpinan mengenal saya secara personal."),
    likert("E-LD2", "leadership", "Pimpinan memberi contoh kerja yang baik."),
    likert("E-LD3", "leadership", "Pimpinan terbuka menerapkan ide atau saran dari karyawan."),
    likert("E-LD4", "leadership", "Pimpinan terlibat langsung dalam pekerjaan sehari-hari."),
    likert("E-LD5", "leadership", "Pimpinan ikut melatih karyawan baru."),
    likert("E-LD6", "leadership", "Pimpinan bersikap adil saat memberi sanksi."),
    likert("E-LD7", "leadership", "Pimpinan bersikap adil saat memberi penghargaan."),
    likert(
      "E-LD8",
      "leadership",
      "Pimpinan sulit ditemui saat saya membutuhkan bantuan.",
      "NEGATIVE",
    ),

    likert("E-WE1", "work_environment", "Saya merasa aman dari risiko kecelakaan di tempat kerja."),
    likert("E-WE2", "work_environment", "Saya puas dengan jam kerja yang ditetapkan."),
    likert("E-WE3", "work_environment", "Pekerjaan saya dapat diselesaikan dalam jam kerja."),
    likert("E-WE4", "work_environment", "Pencahayaan di tempat kerja memadai."),
    likert("E-WE5", "work_environment", "Suhu di tempat kerja nyaman."),
    likert("E-WE6", "work_environment", "Tingkat kebisingan di tempat kerja tidak mengganggu."),
    likert(
      "E-WE7",
      "work_environment",
      "Beban kerja saya sering melebihi kemampuan saya.",
      "NEGATIVE",
    ),

    likert("E-WC1", "work_culture", "Rekan kerja saya bertanggung jawab atas pekerjaannya."),
    likert("E-WC2", "work_culture", "Rekan kerja saya jarang absen tanpa alasan."),
    likert("E-WC3", "work_culture", "Saya bebas membicarakan kesulitan kerja dengan pimpinan."),
    likert("E-WC4", "work_culture", "Saya bebas membicarakan kesulitan kerja dengan rekan kerja."),
    likert("E-WC5", "work_culture", "Suasana kerja di tempat saya positif."),
    likert("E-WC6", "work_culture", "Semangat kerja di tempat saya tinggi."),
    likert("E-WC7", "work_culture", "Rekan kerja saling membantu saat dibutuhkan."),
    likert("E-WC8", "work_culture", "Rekan kerja saya dapat dipercaya."),
    likert("E-WC9", "work_culture", "Kerja sama tim berjalan efektif."),
    likert("E-WC10", "work_culture", "Rekan kerja saling menghormati."),
    likert(
      "E-WC11",
      "work_culture",
      "Saya memaknai pekerjaan saya lebih dari sekadar mencari penghasilan.",
    ),
    likert(
      "E-WC12",
      "work_culture",
      "Konflik antarrekan kerja sering mengganggu pekerjaan.",
      "NEGATIVE",
    ),

    // Cross-check: dibandingkan dengan O-FN2, tidak masuk skor faktor (dimension null).
    likert("E-XC1", null, "Gaji saya dibayar tepat waktu.", "POSITIVE", {
      pairKey: "salary_on_time",
    }),
  ],
};
