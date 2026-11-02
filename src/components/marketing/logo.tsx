import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const MARK_SIZE = 640;
const FULL_LOGO_WIDTH = 1400;
const FULL_LOGO_HEIGHT = 511;
const FOOTER_LOGO_WIDTH = 150;

/** Tanda logo (PNG transparan). `inverse` memakai versi putih untuk latar berwarna (kontras). */
export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Image
      src={inverse ? "/brand/omnisus-mark-white.png" : "/brand/omnisus-mark.png"}
      alt=""
      width={MARK_SIZE}
      height={MARK_SIZE}
      priority
      className={cn("size-9 object-contain", className)}
    />
  );
}

export function Logo({
  className,
  inverse,
  href = "/",
}: {
  className?: string;
  inverse?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} aria-label="OmniSUS" className={cn("flex items-center gap-2", className)}>
      <LogoMark inverse={inverse} />
      <span className="text-xl font-semibold leading-none tracking-tight">
        <span className={inverse ? undefined : "text-[#1f4e9a]"}>Omni</span>
        <span className={inverse ? undefined : "text-[#2a6fae]"}>SUS</span>
      </span>
    </Link>
  );
}

/** Logo lengkap (tanda + tulisan + tagline), dipakai di footer. */
export function FullLogo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="OmniSUS" className={cn("inline-block", className)}>
      <Image
        src="/brand/omnisus-logo.png"
        alt="OmniSUS"
        width={FULL_LOGO_WIDTH}
        height={FULL_LOGO_HEIGHT}
        // Ukuran tampil kecil dan tetap (lebar 150 px); gambar sumbernya besar agar tajam di layar retina.
        style={{ width: FOOTER_LOGO_WIDTH, height: "auto" }}
      />
    </Link>
  );
}
