import type { ComponentProps } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  description?: string;
  error?: { message?: string };
};

/** Label + input + pesan error, dirancang untuk spread hasil `register()` React Hook Form. */
export function TextField({ id, label, description, error, ...inputProps }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={error ? true : undefined} {...inputProps} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error]} />
    </Field>
  );
}
