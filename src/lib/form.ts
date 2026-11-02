import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { ActionError } from "./result";

/**
 * Menerapkan hasil `ActionResult` gagal ke form: VALIDATION → error per field,
 * selain itu dikembalikan sebagai pesan tingkat-form.
 */
export function applyActionError<T extends FieldValues>(
  error: ActionError,
  setError: UseFormSetError<T>,
): string | null {
  if (error.code !== "VALIDATION" || !error.fieldErrors) return error.message;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (message) setError(field as Path<T>, { message });
  }
  return null;
}
