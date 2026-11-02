import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = { message: string | null; tone?: "error" | "success" };

/** Pesan tingkat-form (kegagalan non-field atau konfirmasi sukses). */
export function FormMessage({ message, tone = "error" }: Props) {
  if (!message) return null;
  return (
    <Alert
      variant={tone === "error" ? "destructive" : "default"}
      role={tone === "error" ? "alert" : "status"}
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
