"use client";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  size?: "sm" | "md";
}

export default function Tabs({ items, active, onChange, size = "md" }: TabsProps) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)" }}>
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              padding: size === "sm" ? "8px 12px" : "10px 16px",
              fontSize: size === "sm" ? "var(--font-sm)" : "var(--font-base)",
              fontWeight: 700,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
              color: isActive ? "var(--text)" : "var(--text-tertiary)",
              cursor: "pointer",
              marginBottom: -1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color var(--transition-fast)",
            }}
          >
            {item.label}
            {item.count !== undefined && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)",
                background: isActive ? "var(--accent-dim)" : "var(--bg-active)",
                color: isActive ? "var(--accent)" : "var(--text-tertiary)",
              }}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
