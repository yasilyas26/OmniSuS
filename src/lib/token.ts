import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

/** Token acak untuk tautan sekali pakai; nilai mentah hanya ditampilkan sekali ke pengguna. */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** Yang disimpan di DB hanya hash ini (SECURITY T4). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
