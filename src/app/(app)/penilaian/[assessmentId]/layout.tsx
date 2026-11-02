import { notFound } from "next/navigation";
import { z } from "zod";

import { assessmentsService } from "@/features/assessments";
import { AppError } from "@/lib/errors";
import { requireMembership } from "@/server/guards";

/**
 * Guard tenant untuk semua rute periode. Diperiksa di layout (di luar batas loading leaf) agar
 * periode milik UMKM lain menghasilkan status HTTP 404 sungguhan, bukan 200 yang di-stream.
 */
export default async function AssessmentLayout({
  children,
  params,
}: LayoutProps<"/penilaian/[assessmentId]">) {
  const { assessmentId } = await params;
  if (!z.uuid().safeParse(assessmentId).success) notFound();
  const member = await requireMembership();
  await assessmentsService.getForMember(member, assessmentId).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  return children;
}
