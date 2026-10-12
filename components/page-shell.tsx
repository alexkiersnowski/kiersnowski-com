import type { ReactNode } from "react";

/** Page width and fluid gutters, shared with the fixed header bar. */
export const shellClass = "mx-auto w-full max-w-[2560px] px-[clamp(1.25rem,3.5vw,5rem)]";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className={shellClass}>{children}</div>;
}
