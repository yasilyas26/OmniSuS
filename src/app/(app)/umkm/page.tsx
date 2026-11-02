import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessForm, DeleteBusinessCard, businessService } from "@/features/business";
import { requireRolePage } from "@/server/guards";

export const metadata: Metadata = { title: "Profil UMKM" };

export default async function BusinessProfilePage() {
  const member = await requireRolePage("OWNER");
  const business = await businessService.getProfile(member);

  return (
    <>
      <PageHeader
        title="Profil UMKM"
        description="Data usaha yang dipakai dalam statistik agregat."
      />
      <div className="max-w-xl space-y-6">
        <Card>
          <CardContent>
            <BusinessForm
              mode="update"
              defaultValues={{
                name: business.name,
                sector: business.sector,
                city: business.city,
                employeeCount: business.employeeCount,
                foundedYear: business.foundedYear,
              }}
            />
          </CardContent>
        </Card>
        <DeleteBusinessCard businessName={business.name} />
      </div>
    </>
  );
}
