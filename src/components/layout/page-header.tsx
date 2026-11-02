import type { ReactNode } from "react";

type Props = { title: string; description?: string; actions?: ReactNode };

export function PageHeader({ title, description, actions }: Props) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
