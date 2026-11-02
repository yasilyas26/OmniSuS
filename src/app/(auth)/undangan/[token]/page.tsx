import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptInvitationForm, employeesService } from "@/features/employees";

export const metadata: Metadata = { title: "Terima undangan", robots: { index: false } };

export default async function InvitationPage({ params }: PageProps<"/undangan/[token]">) {
  const { token } = await params;
  const invitation = await employeesService.getInvitationPreview(token);

  if (!invitation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tautan tidak berlaku</CardTitle>
          <CardDescription>
            Tautan undangan ini tidak valid, sudah dipakai, atau sudah kedaluwarsa. Minta pemilik
            UMKM membuat tautan baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/masuk">Ke halaman masuk</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Halo, {invitation.name}</CardTitle>
        <CardDescription>
          Kamu diundang bergabung ke <strong>{invitation.businessName}</strong> dengan email{" "}
          {invitation.email}. Buat kata sandi untuk mengaktifkan akunmu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptInvitationForm token={token} />
      </CardContent>
    </Card>
  );
}
