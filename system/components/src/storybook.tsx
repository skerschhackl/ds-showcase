import type { ReactNode } from "react";

export function StoryFrame({
  title,
  aiNote,
  children
}: {
  title: string;
  aiNote: string;
  children: ReactNode;
}) {
  return (
    <section style={{ display: "grid", fontFamily: "var(--ds-typography-font-sans)", gap: "1rem", maxWidth: "56rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--ds-typography-font-display)", margin: 0 }}>{title}</h2>
        <p style={{ color: "var(--ds-color-muted)", lineHeight: 1.5, marginBottom: 0 }}>{aiNote}</p>
      </div>
      {children}
    </section>
  );
}

export function StoryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <strong>{label}</strong>
      <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>{children}</div>
    </div>
  );
}

export function StoryGrid({ children }: { children: ReactNode }) {
  return (
    <div className="story-grid" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
      {children}
    </div>
  );
}

export function StoryFieldGrid({ children }: { children: ReactNode }) {
  return (
    <div className="story-field-grid" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
      {children}
    </div>
  );
}
