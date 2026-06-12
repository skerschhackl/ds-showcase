import { useId, type ReactNode } from "react";
import type { Tone } from "../types";

export function Alert({
  tone = "neutral",
  title,
  children,
  headingLevel = 2
}: {
  tone?: Tone;
  title: string;
  children: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const bodyId = `${generatedId}-body`;
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      className={`ds-alert ds-alert--${tone}`}
      role={tone === "danger" ? "alert" : "status"}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <Heading id={titleId} className="ds-alert__title">{title}</Heading>
      <span id={bodyId}>{children}</span>
    </div>
  );
}
