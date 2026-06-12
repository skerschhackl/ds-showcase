import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "../Spinner";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
  loadingLabel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading action",
  className = "",
  children,
  disabled,
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      className={`ds-button ds-button--${variant} ds-button--${size} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner label={loadingLabel} size="sm" /> : null}
      {children}
    </button>
  );
});
