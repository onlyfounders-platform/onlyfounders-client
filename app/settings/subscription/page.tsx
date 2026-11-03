"use client";
import Link from "next/link";
import { Sparkles, Check, Receipt } from "lucide-react";
import { SettingsPage, GroupTitle, InfoRow } from "@/components/settings/SettingsUI";
import { useGetSettingsQuery } from "@/lib/api/usersApi";
import { useGetPlatformQuery, useGetMyPaymentsQuery } from "@/lib/api/platformApi";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_CHIP: Record<string, string> = { completed: "success", pending: "warning", failed: "danger", refunded: "default" };

export default function SubscriptionSettingsPage() {
  const { data } = useGetSettingsQuery();
  const { data: platform } = useGetPlatformQuery();
  const { data: payments } = useGetMyPaymentsQuery();
  const sub = data?.subscription;
  const plan = platform?.plans.find(p => p.id === (sub?.plan || "free"));

  return (
    <SettingsPage title="Premium" intro="Your OnlyFounders plan and payment history. Upgrades are one-time and applied per product.">
      <div style={{ padding: 16 }}>
        <div style={{ border: "1px solid var(--accent-border)", background: "var(--accent-dim)", borderRadius: "var(--radius-lg)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 800, marginBottom: 4 }}><Sparkles size={18} /> Current plan</div>
          <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-0.5px" }}>{plan?.name ?? "Free"}</div>
          {plan?.description && <p style={{ color: "var(--text-secondary)", marginTop: 2 }}>{plan.description}</p>}
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 6 }}>
            {(plan?.features ?? []).map(f => <li key={f} style={{ display: "flex", gap: 8 }}><Check size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} /> {f}</li>)}
          </ul>
          {sub?.expiresAt && <p style={{ marginTop: 12, fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Runs until {new Date(sub.expiresAt).toLocaleDateString([], { dateStyle: "long" })}</p>}
          {(sub?.plan ?? "free") !== "pro" && (
            <Link href="/pricing" className="ds-button ds-button--secondary" style={{ marginTop: 16 }}>{sub?.plan === "starter" ? "Upgrade to Pro" : "Upgrade"}</Link>
          )}
        </div>
      </div>

      {sub?.startedAt && <InfoRow label="Member since" value={new Date(sub.startedAt).toLocaleDateString([], { dateStyle: "long" })} />}
      {sub?.source && sub.source !== "none" && <InfoRow label="Granted by" value={sub.source === "admin" ? "The OnlyFounders team" : "Your payment"} />}

      <GroupTitle>Payment history</GroupTitle>
      {!payments?.payments?.length ? (
        <EmptyState icon={Receipt} title="No payments yet" description="Receipts for Starter and Pro upgrades appear here." />
      ) : payments.payments.map((p: any) => (
        <div key={p._id} className="settings-nav-row" style={{ cursor: "default" }}>
          <div style={{ minWidth: 0 }}>
            <div className="title" style={{ fontWeight: 700 }}>{p.plan[0].toUpperCase() + p.plan.slice(1)} · {p.product?.name ?? "Deleted product"}</div>
            <div className="desc">{new Date(p.createdAt).toLocaleDateString([], { dateStyle: "medium" })} · ${p.amount} {p.currency}</div>
          </div>
          <span className={`ds-chip ds-chip--${STATUS_CHIP[p.status] ?? "default"}`} style={{ marginLeft: "auto", textTransform: "capitalize" }}>{p.status}</span>
        </div>
      ))}
    </SettingsPage>
  );
}
