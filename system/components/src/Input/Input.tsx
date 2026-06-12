import { forwardRef, type InputHTMLAttributes } from "react";
import { Field } from "../Field/Field";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "aria-describedby" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  hint,
  error,
  className = "",
  id,
  ...props
}, ref) {
  return (
    <Field id={id} idSuffix="input" label={label} hint={hint} error={error} className={className}>
      {(controlProps) => <input ref={ref} className="ds-input" {...controlProps} {...props} />}
    </Field>
  );
});
