import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Field } from "../Field/Field";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "aria-describedby" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
  controlClassName?: string;
  controlFrameClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  label,
  hint,
  error,
  controlClassName = "",
  controlFrameClassName = "",
  className = "",
  id,
  ...props
}, ref) {
  return (
    <Field id={id} idSuffix="textarea" label={label} hint={hint} error={error} className={className}>
      {(controlProps) => {
        const control = <textarea ref={ref} className={`ds-textarea ${controlClassName}`} {...controlProps} {...props} />;

        return controlFrameClassName ? (
          <div className={controlFrameClassName}>
            {control}
          </div>
        ) : control;
      }}
    </Field>
  );
});
