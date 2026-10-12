import { site } from "@/lib/site";
import { cn } from "cn";

/** Green status dot plus the availability line. Used in the header, menu and mobile hero. */
export function Availability({ className }: { className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60 motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-emerald-500" />
      </span>
      {site.availability}
    </p>
  );
}
