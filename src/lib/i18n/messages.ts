import type { Locale } from "./config";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

type Section = { title: string; paragraphs?: string[]; bullets?: string[] };

// Teks antarmuka situs publik. Penanda `*kata*` = serif miring; token seperti {min} diisi saat render.
// Teks isi landing (hero, fitur, dst.) ada di features/site-content karena dapat diedit admin.
const id = {
  nav: {
    home: "Beranda",
    about: "Tentang kami",
    features: "Fitur utama",
    privacy: "Privasi",
    getStarted: "Mulai sekarang",
    signIn: "Masuk",
    siteMenu: "Menu situs",
    mobileMenu: "Menu situs (ponsel)",
    openMenu: "Buka menu",
    language: "Bahasa",
  },
  footer: {
    pages: "Halaman",
    account: "Akun",
    information: "Informasi",
    signUpOwner: "Daftar pemilik UMKM",
    signIn: "Masuk",
    methodology: "Metodologi",
    privacyPolicy: "Kebijakan privasi",
    emailPlaceholder: "Masukkan email",
    getStarted: "Mulai sekarang",
    linksLabel: "Tautan kaki",
    homeLabel: "OmniSUS, ke beranda",
  },
  hero: {
    overallScore: "Skor keseluruhan",
    gapTitle: "Gap persepsi · Kepemimpinan",
    owner: "Pemilik",
    employee: "Karyawan",
    anonymousTitle: "Jawaban karyawan anonim",
    anonymousText: "Pemilik hanya melihat rata-rata, bukan jawaban per orang.",
    category: "Cukup",
  },
  sections: {
    about: "Tentang kami",
    features: "Fitur utama",
    benefit: "Manfaat",
    privacy: "Privasi",
    testimonials: "Testimoni",
    effectiveness: "Seberapa efektif",
    partnersLabel: "UMKM yang bekerja sama",
  },
  stats: {
    empty: "Belum ada penilaian yang ditutup, jadi belum ada angka untuk ditampilkan.",
    businesses: "UMKM dinilai",
    respondents: "total responden",
    healthy: "UMKM berkategori Sehat",
    averageScore: "rata-rata skor (0–100)",
    owner: "Pemilik",
    employee: "Karyawan",
    hasNib: "UMKM memiliki NIB",
    funding: "pernah menerima bantuan dana pemerintah",
    program: "pernah ikut kegiatan pemerintah",
    sectorTitle: "Sebaran sektor",
    capitalTitle: "Sumber modal utama",
    unit: "{n} UMKM",
    other: "Lainnya",
    categoryLine: "{label}: {n} UMKM ({percent}%)",
    categories: { HEALTHY: "Sehat", FAIR: "Cukup", AT_RISK: "Perlu Perhatian" },
    // Pilihan sumber modal (butir P4) berasal dari database berbahasa Indonesia; ini terjemahannya.
    capital: {
      "Modal sendiri/keluarga": "Modal sendiri/keluarga",
      "Pinjaman bank (termasuk KUR)": "Pinjaman bank (termasuk KUR)",
      "Pinjaman koperasi/lembaga non-bank": "Pinjaman koperasi/lembaga non-bank",
      "Investor/mitra": "Investor/mitra",
      "Hibah/bantuan pemerintah": "Hibah/bantuan pemerintah",
      Lainnya: "Lainnya",
    },
  },
  sectors: {
    KULINER: "Kuliner",
    FASHION: "Fashion",
    KRIYA: "Kriya",
    JASA: "Jasa",
    PERDAGANGAN: "Perdagangan",
    LAINNYA: "Lainnya",
  },
  methodology: {
    title: "Bagaimana skor *dihitung*",
    intro:
      "Penjelasan lengkap tentang faktor, skala, rumus, ambang kategori, dan keterbatasan skor.",
    factorsTitle: "Faktor yang dinilai",
    shared: "dinilai pemilik dan karyawan, gap dihitung",
    ownerOnly: "dinilai pemilik saja",
    scaleTitle: "Skala dan skor",
    scale: [
      'Setiap pernyataan dijawab pada skala Likert 1–5 (Sangat tidak setuju sampai Sangat setuju). Pernyataan negatif dibalik saat dihitung. Beberapa butir menyediakan pilihan "Tidak berlaku"; jawaban itu dikeluarkan dari perhitungan.',
      "Skor satu faktor adalah jumlah nilai butir (setelah dibalik) dibagi nilai maksimum, dikali 100, sehingga berkisar 0–100. Skor karyawan dihitung per responden lebih dulu, baru dirata-ratakan, supaya yang menjawab lebih banyak butir tidak lebih berpengaruh.",
      "Skor gabungan adalah {ownerWeight}% skor pemilik ditambah {employeeWeight}% rata-rata skor karyawan. Tanpa data karyawan yang cukup, skor gabungan hanya memakai skor pemilik.",
    ],
    categoriesTitle: "Kategori",
    categories: [
      { label: "Sehat", text: "skor {healthy} atau lebih" },
      { label: "Cukup", text: "{fair} sampai di bawah {healthy}" },
      { label: "Perlu Perhatian", text: "di bawah {fair}" },
    ],
    provisional:
      "Bobot dan ambang ini masih sementara dan belum tervalidasi. Perubahan ambang akan dicatat sebagai versi algoritma baru.",
    gapTitle: "Gap persepsi",
    gap: "Gap adalah skor pemilik dikurangi skor karyawan, hanya untuk faktor yang dinilai kedua pihak. Selisih di bawah {gap} poin dianggap selaras. Gap positif berarti pemilik menilai lebih tinggi daripada karyawan. Gap menunjukkan perbedaan persepsi, bukan siapa yang benar.",
    limitsTitle: "Keterbatasan",
    limits: [
      "Skor adalah indikator persepsi dari survei mandiri, bukan audit keuangan atau operasional.",
      "Ada bias self-report dan social desirability, terutama pada penilaian pemilik.",
      "Sampel UMKM tidak acak; yang mendaftar cenderung sudah lebih melek digital.",
      "Butir kuesioner masih berstatus draf adaptasi dan belum diuji validitas serta reliabilitasnya. Sumber instrumen asli sedang dilacak.",
      "Data karyawan baru ditampilkan jika ada minimal {min} responden.",
    ],
  },
  privacyPage: {
    title: "Kebijakan *privasi*",
    intro:
      "Apa yang dikumpulkan, siapa yang bisa melihat, dan batas-batas perlindungan yang kami berikan.",
    sections: [
      {
        title: "Anonimitas karyawan",
        bullets: [
          "Pemilik tidak pernah melihat jawaban per karyawan, hanya rata-rata.",
          "Rata-rata karyawan hanya ditampilkan jika ada minimal {min} responden yang mengirim final. Jika kurang, hasil hanya memakai penilaian pemilik.",
          "Daftar karyawan tidak menampilkan siapa yang sudah atau belum mengisi.",
          "Karyawan menetapkan kata sandinya sendiri lewat tautan undangan; pemilik tidak mengetahuinya.",
        ],
      },
      {
        title: "Batas perlindungan",
        paragraphs: [
          "Anonimitas dijaga oleh aturan akses di dalam aplikasi, bukan oleh enkripsi. Karena itu kami tidak menyebutnya anonim secara kriptografis. Pihak yang mengelola database secara teknis masih dapat menghubungkan jawaban dengan akun.",
          "Dengan responden yang sedikit, pemilik yang sudah mengetahui sebagian jawaban dapat menebak sisanya. Itulah alasan batas minimum {min} responden dan mengapa kami tidak menurunkannya.",
        ],
      },
      {
        title: "Data yang kami simpan",
        bullets: [
          "Akun: nama, email, dan kata sandi yang sudah di-hash.",
          "Profil UMKM: nama usaha, sektor, kota, jumlah karyawan, dan tahun berdiri.",
          "Jawaban kuesioner dan hasil perhitungan tiap periode.",
          "Token undangan hanya disimpan sebagai hash dan berlaku terbatas.",
        ],
      },
      {
        title: "Statistik publik",
        paragraphs: [
          'Halaman depan hanya menampilkan angka agregat dari periode yang sudah ditutup, tanpa nama atau identitas UMKM. Kelompok yang terlalu kecil digabung agar tidak dapat dikenali. Data fiktif untuk demo selalu diberi label "Data demo".',
        ],
      },
      {
        title: "Yang belum tersedia",
        paragraphs: [
          "Penghapusan akun mandiri dan kebijakan retensi data belum tersedia dan akan ditetapkan sebelum layanan dipakai secara luas.",
        ],
      },
    ] satisfies Section[],
  },
};

export type Messages = Widen<typeof id>;

const en: Messages = {
  nav: {
    home: "Home",
    about: "About us",
    features: "Core features",
    privacy: "Privacy",
    getStarted: "Get started",
    signIn: "Sign in",
    siteMenu: "Site menu",
    mobileMenu: "Site menu (mobile)",
    openMenu: "Open menu",
    language: "Language",
  },
  footer: {
    pages: "Pages",
    account: "Account",
    information: "Information",
    signUpOwner: "Sign up as an owner",
    signIn: "Sign in",
    methodology: "Methodology",
    privacyPolicy: "Privacy policy",
    emailPlaceholder: "Enter your email",
    getStarted: "Get started",
    linksLabel: "Footer links",
    homeLabel: "OmniSUS, back to home",
  },
  hero: {
    overallScore: "Overall score",
    gapTitle: "Perception gap · Leadership",
    owner: "Owner",
    employee: "Employees",
    anonymousTitle: "Employee answers are anonymous",
    anonymousText: "Owners only see averages, never individual answers.",
    category: "Fair",
  },
  sections: {
    about: "About us",
    features: "Core features",
    benefit: "Benefits",
    privacy: "Privacy",
    testimonials: "Testimonials",
    effectiveness: "How effective",
    partnersLabel: "Partner businesses",
  },
  stats: {
    empty: "No assessment has been closed yet, so there are no figures to show.",
    businesses: "businesses assessed",
    respondents: "total respondents",
    healthy: "businesses rated Healthy",
    averageScore: "average score (0–100)",
    owner: "Owner",
    employee: "Employees",
    hasNib: "have a business ID (NIB)",
    funding: "have received government funding",
    program: "have joined a government program",
    sectorTitle: "Sector breakdown",
    capitalTitle: "Main source of capital",
    unit: "{n} businesses",
    other: "Other",
    categoryLine: "{label}: {n} businesses ({percent}%)",
    categories: { HEALTHY: "Healthy", FAIR: "Fair", AT_RISK: "Needs Attention" },
    capital: {
      "Modal sendiri/keluarga": "Own / family capital",
      "Pinjaman bank (termasuk KUR)": "Bank loan (including KUR)",
      "Pinjaman koperasi/lembaga non-bank": "Cooperative / non-bank loan",
      "Investor/mitra": "Investor / partner",
      "Hibah/bantuan pemerintah": "Government grant / aid",
      Lainnya: "Other",
    },
  },
  sectors: {
    KULINER: "Culinary",
    FASHION: "Fashion",
    KRIYA: "Crafts",
    JASA: "Services",
    PERDAGANGAN: "Trade",
    LAINNYA: "Other",
  },
  methodology: {
    title: "How scores are *calculated*",
    intro:
      "A full explanation of the factors, scale, formula, category thresholds, and the limits of the score.",
    factorsTitle: "Factors assessed",
    shared: "rated by owner and employees, gap calculated",
    ownerOnly: "rated by the owner only",
    scaleTitle: "Scale and scoring",
    scale: [
      'Each statement is answered on a 1–5 Likert scale (Strongly disagree to Strongly agree). Negative statements are reversed when calculating. Some items offer a "Not applicable" option, which is left out of the calculation.',
      "A factor score is the sum of item values (after reversal) divided by the maximum value, times 100, so it ranges from 0 to 100. Employee scores are computed per respondent first and then averaged, so people who answer more items do not carry more weight.",
      "The combined score is {ownerWeight}% of the owner score plus {employeeWeight}% of the average employee score. Without enough employee data, the combined score uses the owner score alone.",
    ],
    categoriesTitle: "Categories",
    categories: [
      { label: "Healthy", text: "a score of {healthy} or higher" },
      { label: "Fair", text: "{fair} up to below {healthy}" },
      { label: "Needs Attention", text: "below {fair}" },
    ],
    provisional:
      "These weights and thresholds are provisional and not yet validated. Any change will be recorded as a new algorithm version.",
    gapTitle: "Perception gap",
    gap: "The gap is the owner score minus the employee score, only for factors rated by both sides. A difference under {gap} points is treated as aligned. A positive gap means the owner rates higher than employees. The gap shows a difference in perception, not who is right.",
    limitsTitle: "Limitations",
    limits: [
      "The score is a perception indicator from a self-reported survey, not a financial or operational audit.",
      "There is self-report and social desirability bias, especially in owner ratings.",
      "The sample of businesses is not random; those who sign up tend to be more digitally savvy.",
      "The questionnaire items are still an adapted draft and have not been tested for validity and reliability. The original instrument source is still being traced.",
      "Employee data is only shown when there are at least {min} respondents.",
    ],
  },
  privacyPage: {
    title: "Privacy *policy*",
    intro: "What we collect, who can see it, and the limits of the protection we offer.",
    sections: [
      {
        title: "Employee anonymity",
        bullets: [
          "Owners never see answers per employee, only averages.",
          "The employee average is only shown when at least {min} respondents have submitted. Otherwise, results use the owner's assessment only.",
          "The employee list does not show who has or has not filled in the survey.",
          "Employees set their own password through the invitation link; the owner never knows it.",
        ],
      },
      {
        title: "Limits of protection",
        paragraphs: [
          "Anonymity is enforced by access rules inside the application, not by encryption. That is why we do not call it cryptographically anonymous. Whoever administers the database could technically link answers to accounts.",
          "With very few respondents, an owner who already knows some answers could guess the rest. That is why the minimum is {min} respondents and why we do not lower it.",
        ],
      },
      {
        title: "Data we store",
        bullets: [
          "Account: name, email, and a hashed password.",
          "Business profile: business name, sector, city, number of employees, and year founded.",
          "Questionnaire answers and the calculated results for each period.",
          "Invitation tokens are stored only as hashes and expire.",
        ],
      },
      {
        title: "Public statistics",
        paragraphs: [
          'The home page only shows aggregate figures from closed periods, without any business name or identity. Groups that are too small are merged so they cannot be recognised. Fictional demo data is always labelled "Demo data".',
        ],
      },
      {
        title: "Not yet available",
        paragraphs: [
          "Self-service account deletion and a data retention policy are not available yet and will be defined before the service is widely used.",
        ],
      },
    ],
  },
};

const MESSAGES: Record<Locale, Messages> = { id, en };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];
