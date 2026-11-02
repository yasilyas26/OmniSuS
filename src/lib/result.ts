export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RULE_VIOLATION";

export type ActionError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: ActionError };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const fail = (
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> => ({ ok: false, error: { code, message, fieldErrors } });
