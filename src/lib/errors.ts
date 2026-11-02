import type { ErrorCode } from "./result";

/** Dilempar dari service untuk kegagalan yang diharapkan; diterjemahkan di action. */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
