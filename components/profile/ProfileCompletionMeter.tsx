"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Check, ChevronDown, ChevronUp as ChevronUpIcon } from "lucide-react";

export interface CompletionInput {
  hasAvatar: boolean;
  hasBio: boolean;
  hasSocial: boolean;
  hasOpenTo: boolean;
  hasProduct: boolean;
}

const STEPS: { key: keyof CompletionInput; label: string; action: "edit" | "launch" }[] = [
  { key: "hasAvatar", label: "Add a profile photo", action: "edit" },
  { key: "hasBio", label: "Write a short bio", action: "edit" },
  { key: "hasSocial", label: "Link Twitter or a website", action: "edit" },
  { key: "hasOpenTo", label: "Say what you're open to", action: "edit" },
  { key: "hasProduct", label: "Launch your first product", action: "launch" },
];

export default function ProfileCompletionMeter({ input, onEdit }: { input: CompletionInput; onEdit: () => void }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const done = STEPS.filter((s) => input[s.key]).length;
  const pct = Math.round((done / STEPS.length) * 100);

  if (pct === 100) return null;

  return (
    <Card padding="md" style={{ marginBottom: 16 }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h3 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>Complete your profile</h3>
            <span style={{ fontSize: "var(--font-sm)", color: "var(--accent)", fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: "var(--radius-full)", background: "var(--bg-active)", overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%", borderRadius: "var(--radius-full)",
              background: "linear-gradient(90deg, var(--accent), var(--blue))",
              transition: "width var(--transition-base)",
            }} />
          </div>
        </div>
        <button
          aria-label={collapsed ? "Expand" : "Collapse"}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, marginLeft: 10, display: "flex", color: "var(--text-tertiary)" }}
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUpIcon size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {STEPS.map((s) => {
            const complete = input[s.key];
            return (
              <div
                key={s.key}
                onClick={complete ? undefined : () => (s.action === "launch" ? router.push("/submit") : onEdit())}
                style={{
                  display: "flex", alignItems: "center", gap: 10, fontSize: "var(--font-sm)",
                  color: complete ? "var(--text-tertiary)" : "var(--text-secondary)",
                  cursor: complete ? "default" : "pointer",
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: complete ? "var(--accent)" : "transparent",
                  border: complete ? "none" : "1.5px solid var(--border-hover)",
                }}>
                  {complete && <Check size={12} color="#fff" strokeWidth={3} />}
                </span>
                <span style={{ textDecoration: complete ? "line-through" : "none" }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
