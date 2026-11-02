"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

type Props = {
  name: string;
  legend: string;
  options: readonly Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** Pilihan tambahan yang dipisah secara visual, mis. "Tidak berlaku". */
  extraOption?: Option;
  layout?: "row" | "stack";
};

const CARD =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/60 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5";

/** Kartu radio besar yang nyaman di layar sentuh; navigasi keyboard ditangani Radix. */
export function OptionGroup({
  name,
  legend,
  options,
  value,
  onChange,
  extraOption,
  layout = "stack",
}: Props) {
  const renderOption = (option: Option, className?: string) => {
    const id = `${name}-${option.value}`;
    return (
      <label key={option.value} htmlFor={id} className={cn(CARD, className)}>
        <RadioGroupItem id={id} value={option.value} />
        <span>{option.label}</span>
      </label>
    );
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-medium leading-snug">{legend}</legend>
      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        aria-label={legend}
        className={cn("gap-2", layout === "row" ? "sm:grid sm:grid-cols-5" : "grid")}
      >
        {options.map((option) => renderOption(option))}
        {extraOption
          ? renderOption(extraOption, "border-dashed text-muted-foreground sm:col-span-5")
          : null}
      </RadioGroup>
    </fieldset>
  );
}
