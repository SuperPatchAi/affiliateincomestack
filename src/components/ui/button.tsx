import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "ghost" | "outline";
type Size = "default" | "sm" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  default: "ui-btn-default",
  ghost: "ui-btn-ghost",
  outline: "ui-btn-outline",
};

const sizeClass: Record<Size, string> = {
  default: "ui-btn-md",
  sm: "ui-btn-sm",
  icon: "ui-btn-icon",
};

/** Minimal shadcn-style Button for experience chrome. */
export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`ui-btn ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
