import "server-only";

import { env } from "@/env";
import { assessmentsService } from "@/features/assessments";
import type { Member } from "@/server/member";
import { notifyN8n } from "@/server/n8n";

import { findOwnerContact, findUserContact } from "./repository";

/**
 * Notifikasi setelah kuesioner dikirim final: konfirmasi ke pengisi, dan pemberitahuan ke
 * pemilik saat pemilik + semua karyawan aktif sudah selesai. Isi jawaban/skor tidak dikirim.
 * Dipanggil lewat `after()`, jadi kegagalan di sini tidak boleh membatalkan pengiriman kuesioner.
 */
export async function notifySurveySubmitted(member: Member, assessmentId: string) {
  try {
    const [assessment, self] = await Promise.all([
      assessmentsService.getForMember(member, assessmentId),
      findUserContact(member.userId),
    ]);

    if (self) {
      await notifyN8n({
        event: "survey.submitted",
        assessmentId,
        assessmentLabel: assessment.label,
        role: member.role,
        submittedAt: new Date().toISOString(),
        recipient: self,
      });
    }

    if (!(await assessmentsService.isFullySubmitted(member.businessId, assessmentId))) return;
    const owner = await findOwnerContact(member.businessId);
    if (!owner) return;

    await notifyN8n({
      event: "assessment.all_submitted",
      assessmentId,
      assessmentLabel: assessment.label,
      businessName: owner.businessName,
      link: `${env.APP_URL}/penilaian`,
      recipient: { email: owner.email, name: owner.name },
    });
  } catch (error) {
    console.error("Notifikasi n8n dilewati:", error instanceof Error ? error.message : error);
  }
}
