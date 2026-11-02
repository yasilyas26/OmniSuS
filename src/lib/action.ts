import { ZodError, z } from "zod";

import { AppError } from "./errors";
import { type ActionResult, fail, ok } from "./result";

/**
 * Membungkus isi Server Action: ZodError → VALIDATION, AppError → kodenya.
 * Error lain (termasuk redirect() milik Next) dilempar ulang.
 */
export async function toActionResult<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await run());
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("VALIDATION", "Data belum valid.", z.flattenError(error).fieldErrors);
    }
    if (error instanceof AppError) return fail(error.code, error.message);
    throw error;
  }
}
