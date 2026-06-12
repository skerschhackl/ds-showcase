import { forwardRef, type HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({
  className = "",
  ...props
}, ref) {
  return <div ref={ref} className={`ds-card ${className}`} {...props} />;
});
