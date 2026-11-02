"use client";

import { ErrorState } from "@/components/layout/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState reset={reset} homeHref="/dashboard" homeLabel="Ke dashboard" />;
}
