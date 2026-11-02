const UNIQUE_VIOLATION = "23505";

const codeOf = (value: unknown): unknown =>
  typeof value === "object" && value !== null && "code" in value ? value.code : undefined;

/**
 * Apakah galat ini pelanggaran constraint unik Postgres? Drizzle membungkus galat driver dalam
 * `DrizzleQueryError`, sehingga kodenya bisa ada di `error.cause`, bukan di `error` itu sendiri.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (codeOf(error) === UNIQUE_VIOLATION) return true;
  const cause =
    typeof error === "object" && error !== null && "cause" in error ? error.cause : undefined;
  return codeOf(cause) === UNIQUE_VIOLATION;
}
