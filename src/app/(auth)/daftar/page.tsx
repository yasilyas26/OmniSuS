import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth";
import { requireGuest } from "@/server/guards";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage({ searchParams }: PageProps<"/daftar">) {
  await requireGuest();
  // Email dari kolom "Get started" di footer; hanya dipakai sebagai isian awal.
  const { email } = await searchParams;
  const defaultEmail = typeof email === "string" ? email : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar sebagai pemilik UMKM</CardTitle>
        <CardDescription>
          Karyawan tidak mendaftar di sini; mereka masuk lewat tautan undangan dari pemilik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm defaultEmail={defaultEmail} />
      </CardContent>
    </Card>
  );
}
