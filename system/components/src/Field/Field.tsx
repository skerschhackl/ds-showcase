import { useId, type ReactNode } from "react";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

export function Field({
  label,
  hint,
  error,
  className = "",
  id,
  idSuffix = "field",
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  id?: string;
  idSuffix?: string;
  children: (controlProps: FieldControlProps) => ReactNode;
}) {
  const generatedId = useId();
  const controlId = id ?? `${generatedId}-${idSuffix}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label className={`ds-field ${className}`}>
      <span className="ds-field__label">{label}</span>
      {children({
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined
      })}
      {hint ? <span id={hintId} className="ds-field__hint">{hint}</span> : null}
      {error ? <span id={errorId} className="ds-field__error">{error}</span> : null}
    </label>
  );
}
