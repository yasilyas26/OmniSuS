import { cn } from "cn";
import type * as React from "react";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-muted-foreground/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
