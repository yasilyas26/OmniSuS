import type { DimensionKey } from "./types";

export const dimensionSeed: readonly {
  key: DimensionKey;
  name: string;
  description: string;
  nameEn: string;
  descriptionEn: string;
  isShared: boolean;
}[] = [
  {
    key: "leadership",
    name: "Kepemimpinan",
    description:
      "Seberapa dekat, adil, dan terbuka pemilik usaha dalam memimpin karyawan sehari-hari.",
    nameEn: "Leadership",
    descriptionEn: "How close, fair, and open the owner is when leading employees day to day.",
    isShared: true,
  },
  {
    key: "work_environment",
    name: "Lingkungan Kerja",
    description:
      "Keselamatan, kenyamanan fisik, jam kerja, dan keseimbangan beban kerja di tempat usaha.",
    nameEn: "Work Environment",
    descriptionEn: "Safety, physical comfort, working hours, and workload balance at the business.",
    isShared: true,
  },
  {
    key: "work_culture",
    name: "Budaya & Hubungan Kerja",
    description: "Suasana kerja, kepercayaan, kerja sama, dan saling menghormati antaranggota tim.",
    nameEn: "Culture & Work Relationships",
    descriptionEn: "Work atmosphere, trust, teamwork, and mutual respect among team members.",
    isShared: true,
  },
  {
    key: "resources_operations",
    name: "Sumber Daya & Operasional",
    description: "Kondisi peralatan, kelancaran pasokan, dan kemampuan memperkirakan permintaan.",
    nameEn: "Resources & Operations",
    descriptionEn: "Equipment condition, supply reliability, and the ability to forecast demand.",
    isShared: false,
  },
  {
    key: "market_customers",
    name: "Pasar & Pelanggan",
    description:
      "Loyalitas dan pertumbuhan pelanggan, tren penjualan, promosi, dan kemitraan usaha.",
    nameEn: "Market & Customers",
    descriptionEn:
      "Customer loyalty and growth, sales trends, promotion, and business partnerships.",
    isShared: false,
  },
  {
    key: "finance",
    name: "Keuangan",
    description:
      "Kecukupan modal kerja dan kas, ketepatan pembayaran gaji dan utang, serta stabilitas arus kas.",
    nameEn: "Finance",
    descriptionEn:
      "Adequacy of working capital and cash, timely payment of wages and debts, and cash-flow stability.",
    isShared: false,
  },
];
