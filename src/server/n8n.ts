import "server-only";

import { env } from "@/env";

const TIMEOUT_MS = 5000;

type Recipient = { email: string; name: string };

export type N8nEvent =
  | {
      event: "survey.submitted";
      assessmentId: string;
      assessmentLabel: string;
      role: string;
      submittedAt: string;
      recipient: Recipient;
    }
  | {
      event: "assessment.all_submitted";
      assessmentId: string;
      assessmentLabel: string;
      businessName: string;
      link: string;
      recipient: Recipient;
    };

/** Kirim event ke webhook n8n. Gagal atau timeout tidak boleh mengganggu alur utama. */
export async function notifyN8n(payload: N8nEvent): Promise<void> {
  if (!env.N8N_WEBHOOK_URL) return;

  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.N8N_WEBHOOK_SECRET ? { "x-api-key": env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) console.error(`Webhook n8n gagal: HTTP ${response.status}`);
  } catch (error) {
    console.error("Webhook n8n tidak terjangkau:", error instanceof Error ? error.message : error);
  }
}
