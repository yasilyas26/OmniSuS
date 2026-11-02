import {
  ClipboardCheck,
  Coffee,
  EyeOff,
  Hammer,
  Handshake,
  KeyRound,
  Lightbulb,
  Lock,
  type LucideIcon,
  Radar,
  Scale,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Store,
  TrendingUp,
  Users,
  Utensils,
  Wheat,
} from "lucide-react";

/** Daftar ikon yang boleh dipilih admin di editor landing. Tambah di sini untuk menambah pilihan. */
export const ICONS = {
  radar: Radar,
  scale: Scale,
  "shield-check": ShieldCheck,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
  handshake: Handshake,
  smartphone: Smartphone,
  "clipboard-check": ClipboardCheck,
  lock: Lock,
  "eye-off": EyeOff,
  users: Users,
  "key-round": KeyRound,
  coffee: Coffee,
  hammer: Hammer,
  scissors: Scissors,
  shirt: Shirt,
  "shopping-bag": ShoppingBag,
  store: Store,
  utensils: Utensils,
  wheat: Wheat,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];
