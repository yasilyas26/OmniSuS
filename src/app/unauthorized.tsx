import Link from "next/link";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <StatusPage
      fullScreen
      code="401"
      title="Perlu masuk dulu"
      description="Masuk ke akunmu untuk melanjutkan."
      actions={
        <Button asChild>
          <Link href="/masuk">Masuk</Link>
        </Button>
      }
    />
  );
}
