import { forwardRef, type SelectHTMLAttributes } from "react";
import { Field } from "../Field/Field";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "aria-describedby" | "aria-invalid"> & {
  label: string;
  options: Array<{ label: string; value: string }>;
  hint?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({
  label,
  options,
  hint,
  error,
  className = "",
  id,
  ...props
}, ref) {
  return (
    <Field id={id} idSuffix="select" label={label} hint={hint} error={error} className={className}>
      {(controlProps) => (
        <select ref={ref} className="ds-select" {...controlProps} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        </select>
      )}
    </Field>
  );
});
