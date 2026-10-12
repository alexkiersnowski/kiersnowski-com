import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Two stacked copies of a label that swap on hover of the closest `.group`,
 * or when `active` is set. `alt` lets the second copy differ (e.g. Menu/Close).
 */
export function RollText({
  children,
  alt,
  active,
  className,
}: {
  children: ReactNode;
  alt?: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("roll", className)}
      data-active={active ? "true" : undefined}
    >
      <span>{children}</span>
      <span aria-hidden="true">{alt ?? children}</span>
    </span>
  );
}
