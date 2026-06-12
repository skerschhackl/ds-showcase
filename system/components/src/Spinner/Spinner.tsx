export function Spinner({
  label = "Loading",
  size = "md"
}: {
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={`ds-spinner ds-spinner--${size}`} role="status" aria-label={label}>
      <span aria-hidden="true" />
    </span>
  );
}
