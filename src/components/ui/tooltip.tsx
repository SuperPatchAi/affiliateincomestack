import type { ReactNode } from "react";

type Props = {
  content: string;
  children: ReactNode;
};

/** Lightweight tooltip stand-in (native title) matching shadcn usage sites. */
export function Tooltip({ content, children }: Props) {
  return (
    <span className="ui-tooltip" title={content} data-tooltip={content}>
      {children}
    </span>
  );
}
