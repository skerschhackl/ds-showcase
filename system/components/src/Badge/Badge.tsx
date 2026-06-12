import { forwardRef, type HTMLAttributes } from "react";
import type { Tone } from "../types";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  tone = "neutral",
  className = "",
  ...props
}, ref) {
  return <span ref={ref} className={`ds-badge ds-badge--${tone} ${className}`} {...props} />;
});
