import type { Locale } from "@/lib/i18n/config";

import type { SiteContent } from "./schemas";

// Teks bawaan landing per bahasa. Dipakai selama admin belum menyimpan perubahan untuk sebuah section.
// Penanda `*kata*` = serif miring; token `{min}` = batas minimum responden dari env.
const id: SiteContent = {
  hero: {
    title: "Cari tahu seberapa *sehat* UMKM-mu dari dalam",
    description:
      "Kuesioner untuk pemilik dan karyawan, hasil per faktor, dan gap persepsi yang menunjukkan di mana pandangan kalian berbeda.",
    primaryCta: "Mulai sekarang",
    secondaryCta: "Pelajari lebih lanjut",
  },
  partners: {
    caption: "",
    items: [
      { name: "Warung Nusantara", icon: "utensils" },
      { name: "Kopi Senja", icon: "coffee" },
      { name: "Batik Laras", icon: "shirt" },
      { name: "Kriya Asri", icon: "hammer" },
      { name: "Toko Berkah", icon: "store" },
      { name: "Roti Hangat", icon: "wheat" },
      { name: "Tenun Mitra", icon: "scissors" },
      { name: "Pasar Digital", icon: "shopping-bag" },
    ],
  },
  about: {
    title: "Membantu UMKM melihat *kondisinya sendiri* dengan jujur",
    description:
      "OmniSUS mengukur kepemimpinan, lingkungan kerja, budaya, sumber daya, pasar, dan keuangan lewat kuesioner singkat. Pemilik menilai usahanya, karyawan menilai tempat kerjanya, lalu kedua pandangan itu dibandingkan.",
    facts: [
      { value: "6", label: "faktor kondisi internal yang dinilai" },
      { value: "2", label: "sudut pandang: pemilik dan karyawan" },
      { value: "±10", label: "menit untuk mengisi kuesioner pemilik" },
    ],
  },
  effectiveness: {
    title: "Angka dari penilaian yang *sudah ditutup*",
    description:
      "Dihitung langsung dari periode terakhir tiap UMKM, tanpa menyebut nama usaha mana pun.",
    disclaimer:
      "Skor adalah indikator persepsi dari survei mandiri, bukan audit. Instrumen masih berstatus draf dan belum diuji validitas serta reliabilitasnya. Sampel tidak acak.",
  },
  coreFeatures: {
    title: "Fitur inti yang membuatnya *berbeda*",
    items: [
      {
        icon: "radar",
        title: "Skor per faktor",
        description:
          "Enam faktor dinilai terpisah pada skala 0–100, lengkap dengan kategori Sehat, Cukup, atau Perlu Perhatian.",
      },
      {
        icon: "scale",
        title: "Gap persepsi",
        description:
          "Bandingkan penilaian pemilik dan karyawan pada faktor yang sama untuk melihat di mana pandangan kalian berbeda.",
      },
      {
        icon: "shield-check",
        title: "Anonimitas karyawan",
        description:
          "Pemilik hanya melihat rata-rata, dan hanya jika responden cukup banyak. Jawaban individual tidak pernah terlihat.",
      },
      {
        icon: "trending-up",
        title: "Riwayat dan tren",
        description:
          "Setiap periode disimpan sebagai snapshot yang tidak berubah, sehingga perkembangan antarperiode bisa dilihat.",
      },
    ],
  },
  benefits: {
    title: "Manfaat untuk *pemilik* dan seluruh tim",
    items: [
      {
        icon: "lightbulb",
        title: "Temukan titik buta",
        description:
          "Lihat faktor mana yang paling perlu dibenahi sebelum berubah menjadi masalah besar.",
      },
      {
        icon: "handshake",
        title: "Mulai percakapan yang jujur",
        description: "Gap persepsi memberi bahan diskusi yang netral antara pemilik dan tim.",
      },
      {
        icon: "smartphone",
        title: "Nyaman diisi di ponsel",
        description:
          "Kuesioner dibuat per langkah dengan pilihan besar, cocok untuk karyawan yang mengisi lewat HP.",
      },
      {
        icon: "clipboard-check",
        title: "Tanpa alat tambahan",
        description:
          "Karyawan cukup membuka tautan undangan. Tidak perlu email otomatis atau aplikasi lain.",
      },
    ],
  },
  privacy: {
    title: "Jawaban jujur butuh rasa *aman*",
    description:
      "Anonimitas dijaga lewat aturan akses di sistem. Batas dan keterbatasannya dijelaskan apa adanya di halaman privasi.",
    points: [
      {
        icon: "eye-off",
        title: "Tidak ada jawaban individual",
        text: "Pemilik tidak pernah melihat siapa menjawab apa.",
      },
      {
        icon: "users",
        title: "Rata-rata dari minimal {min} orang",
        text: "Jika responden kurang, data karyawan tidak ditampilkan sama sekali.",
      },
      {
        icon: "key-round",
        title: "Kata sandi milik karyawan",
        text: "Karyawan menetapkan kata sandinya sendiri lewat tautan undangan, bukan oleh pemilik.",
      },
    ],
    buttonLabel: "Baca kebijakan privasi",
  },
  testimonials: {
    title: "Apa kata *pemilik UMKM*",
    description: "Contoh testimoni untuk tampilan demo. Belum ada ulasan pengguna sungguhan.",
    items: [
      {
        name: "Sari Wulandari",
        role: "Pemilik Dapur Ibu Sari",
        quote:
          "Saya baru sadar karyawan menilai kepemimpinan saya lebih rendah dari penilaian saya sendiri. Itu jadi bahan obrolan yang berguna.",
      },
      {
        name: "Dedi Kurniawan",
        role: "Pemilik Bakso Mang Ujang",
        quote:
          "Kuesionernya singkat dan jelas. Tim saya mengisi lewat HP di sela-sela jam istirahat.",
      },
      {
        name: "Rina Pratiwi",
        role: "Pemilik Batik Laras",
        quote:
          "Hasil per faktor membantu saya memilih apa yang dibenahi lebih dulu, tidak lagi menebak-nebak.",
      },
      {
        name: "Ahmad Fauzi",
        role: "Pemilik Kopi Senja",
        quote:
          "Yang saya suka, karyawan tahu jawabannya tidak bisa saya lihat satu per satu, jadi mereka lebih terbuka.",
      },
      {
        name: "Lestari Dewi",
        role: "Pemilik Kriya Bambu Asri",
        quote: "Tren antarperiode memperlihatkan perubahan setelah kami mengubah jadwal kerja.",
      },
      {
        name: "Budi Santoso",
        role: "Pemilik Toko Berkah Jaya",
        quote: "Tidak perlu aplikasi tambahan. Cukup kirim tautan undangan lewat WhatsApp.",
      },
    ],
  },
  cta: {
    title: "Mulai nilai kondisi *UMKM-mu* hari ini",
    description:
      "Daftar sebagai pemilik, undang karyawan lewat tautan, lalu lihat hasilnya setelah periode ditutup.",
    button: "Mulai sekarang",
  },
  footer: {
    emailLabel: "Mulai dengan emailmu",
    note: "Skor adalah indikator persepsi berbasis survei mandiri, bukan audit keuangan.",
  },
};

const en: SiteContent = {
  hero: {
    title: "Find out how *healthy* your business is from the inside",
    description:
      "A questionnaire for owners and employees, results per factor, and a perception gap that shows where your views differ.",
    primaryCta: "Get started",
    secondaryCta: "Learn more",
  },
  partners: {
    caption: "",
    items: id.partners.items,
  },
  about: {
    title: "Helping small businesses see *their own condition* honestly",
    description:
      "OmniSUS measures leadership, work environment, culture, resources, market, and finance through a short questionnaire. Owners rate their business, employees rate their workplace, and the two views are compared.",
    facts: [
      { value: "6", label: "internal factors assessed" },
      { value: "2", label: "viewpoints: owner and employees" },
      { value: "±10", label: "minutes to complete the owner questionnaire" },
    ],
  },
  effectiveness: {
    title: "Figures from assessments that are *already closed*",
    description:
      "Calculated directly from each business's latest period, without naming any business.",
    disclaimer:
      "The score is a perception indicator from a self-reported survey, not an audit. The instrument is still a draft and has not been tested for validity and reliability. The sample is not random.",
  },
  coreFeatures: {
    title: "Core features that set it *apart*",
    items: [
      {
        icon: "radar",
        title: "Score per factor",
        description:
          "Six factors are scored separately on a 0–100 scale, with a Healthy, Fair, or Needs Attention category.",
      },
      {
        icon: "scale",
        title: "Perception gap",
        description:
          "Compare owner and employee ratings on the same factor to see where your views differ.",
      },
      {
        icon: "shield-check",
        title: "Employee anonymity",
        description:
          "Owners only see averages, and only when enough people responded. Individual answers are never visible.",
      },
      {
        icon: "trending-up",
        title: "History and trends",
        description:
          "Each period is stored as an unchangeable snapshot, so progress across periods can be tracked.",
      },
    ],
  },
  benefits: {
    title: "Benefits for *owners* and the whole team",
    items: [
      {
        icon: "lightbulb",
        title: "Find your blind spots",
        description:
          "See which factors need the most attention before they turn into big problems.",
      },
      {
        icon: "handshake",
        title: "Start honest conversations",
        description: "The perception gap gives owners and teams a neutral topic to discuss.",
      },
      {
        icon: "smartphone",
        title: "Comfortable on a phone",
        description:
          "The questionnaire runs step by step with large choices, ideal for employees answering on mobile.",
      },
      {
        icon: "clipboard-check",
        title: "No extra tools",
        description:
          "Employees just open an invitation link. No automated email or other apps needed.",
      },
    ],
  },
  privacy: {
    title: "Honest answers need a sense of *safety*",
    description:
      "Anonymity is enforced by access rules in the system. Its limits are explained plainly on the privacy page.",
    points: [
      {
        icon: "eye-off",
        title: "No individual answers",
        text: "Owners never see who answered what.",
      },
      {
        icon: "users",
        title: "Averages from at least {min} people",
        text: "If there are too few respondents, employee data is not shown at all.",
      },
      {
        icon: "key-round",
        title: "Passwords belong to employees",
        text: "Employees set their own password through the invitation link, never the owner.",
      },
    ],
    buttonLabel: "Read the privacy policy",
  },
  testimonials: {
    title: "What *business owners* say",
    description: "Sample testimonials for demo purposes. There are no real user reviews yet.",
    items: [
      {
        name: "Sari Wulandari",
        role: "Owner, Dapur Ibu Sari",
        quote:
          "I only realised my team rated my leadership lower than I rated myself. It became a really useful conversation.",
      },
      {
        name: "Dedi Kurniawan",
        role: "Owner, Bakso Mang Ujang",
        quote:
          "The questionnaire is short and clear. My team filled it in on their phones during breaks.",
      },
      {
        name: "Rina Pratiwi",
        role: "Owner, Batik Laras",
        quote: "The results per factor help me choose what to fix first, instead of guessing.",
      },
      {
        name: "Ahmad Fauzi",
        role: "Owner, Kopi Senja",
        quote:
          "What I like is that employees know I cannot see their answers one by one, so they are more open.",
      },
      {
        name: "Lestari Dewi",
        role: "Owner, Kriya Bambu Asri",
        quote: "The trend across periods showed the change after we adjusted our work schedule.",
      },
      {
        name: "Budi Santoso",
        role: "Owner, Toko Berkah Jaya",
        quote: "No extra app needed. I just send the invitation link over WhatsApp.",
      },
    ],
  },
  cta: {
    title: "Start assessing *your business* today",
    description:
      "Sign up as an owner, invite employees with a link, then see the results once the period is closed.",
    button: "Get started",
  },
  footer: {
    emailLabel: "Start with your email",
    note: "The score is a perception indicator from a self-reported survey, not a financial audit.",
  },
};

export const DEFAULT_CONTENT: Record<Locale, SiteContent> = { id, en };
