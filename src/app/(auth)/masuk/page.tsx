import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth";
import { requireGuest } from "@/server/guards";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  await requireGuest();
  const { nonaktif } = await searchParams;

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="outline"
        className="absolute top-4 left-4 border-foreground/40 bg-background font-medium shadow-sm hover:border-foreground hover:bg-muted"
      >
        <Link href="/">
          <ArrowLeft aria-hidden />
          Kembali
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Masuk</CardTitle>
          <CardDescription>Masuk untuk melihat atau mengisi penilaian UMKM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nonaktif ? (
            <Alert variant="destructive">
              <AlertDescription>
                Akun Anda dinonaktifkan oleh pemilik UMKM. Hubungi pemilik untuk mengaktifkannya
                kembali.
              </AlertDescription>
            </Alert>
          ) : null}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
