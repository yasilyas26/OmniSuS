"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  description?: string;
  error?: { message?: string };
};

/** Label + input + pesan error, dirancang untuk spread hasil `register()` React Hook Form. */
export function TextField({ id, label, description, error, type, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const input = (
    <Input
      id={id}
      type={isPassword && visible ? "text" : type}
      aria-invalid={error ? true : undefined}
      {...inputProps}
      // Spasi sebagai placeholder agar :placeholder-shown mengangkat label saat terisi.
      placeholder=" "
      className={cn("peer h-12 pt-4 pb-1", isPassword && "pr-10", inputProps.className)}
    />
  );
  // Label berada di dalam kolom sebagai placeholder, naik ke atas saat fokus atau terisi.
  const labelEl = (
    <FieldLabel
      htmlFor={id}
      className={cn(
        "pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm font-normal text-muted-foreground transition-all",
        "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs",
        "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
      )}
    >
      {label}
    </FieldLabel>
  );

  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="relative">
        {input}
        {labelEl}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error]} />
    </Field>
  );
}
