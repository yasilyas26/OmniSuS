import { Check, Circle } from "lucide-react";

import { PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";

/** Indikator langsung: tiap syarat kata sandi berubah hijau saat terpenuhi. */
export function PasswordChecklist({ value = "" }: { value?: string }) {
  return (
    <ul aria-label="Syarat kata sandi" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Circle className="size-3.5" aria-hidden />
            )}
            {rule.label}
            <span className="sr-only">{met ? "(terpenuhi)" : "(belum)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
