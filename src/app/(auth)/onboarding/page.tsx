import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessForm } from "@/features/business";
import { requireOnboarding } from "@/server/guards";

export const metadata: Metadata = { title: "Profil UMKM" };

export default async function OnboardingPage() {
  await requireOnboarding();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lengkapi profil UMKM</CardTitle>
        <CardDescription>
          Data ini dipakai untuk statistik agregat tanpa menyebut nama usahamu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BusinessForm mode="create" />
      </CardContent>
    </Card>
  );
}
