import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`)
  .max(MAX_PASSWORD_LENGTH, `Kata sandi maksimal ${MAX_PASSWORD_LENGTH} karakter.`);
