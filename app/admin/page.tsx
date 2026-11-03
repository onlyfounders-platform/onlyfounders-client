"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Users, UserPlus, Activity, Package, Clock, MessageSquareText, Mail, Flag, DollarSign, Sparkles, ShieldAlert, AlertTriangle, ChevronUp,
} from "lucide-react";
import { useGetAdminStatsQuery, useGetAdminAnalyticsQuery } from "@/lib/api/adminApi";
import { AdminPage, KpiGrid, Kpi, Panel, BarChart, Segmented, money } from "@/components/admin/AdminUI";
import Avatar from "@/components/ui/Avatar";

const SERIES: { key: "signups" | "activeFounders" | "posts" | "products" | "messages" | "emails" | "revenue"; label: string }[] = [
  { key: "signups", label: "New founders" },
  { key: "activeFounders", label: "Active founders" },
  { key: "posts", label: "Posts" },
  { key: "products", label: "Product launches" },
  { key: "messages", label: "Messages" },
  { key: "emails", label: "Emails sent" },
  { key: "revenue", label: "Revenue" },
];

export default function AdminDashboardPage() {
  const [days, setDays] = useState("30");
  const { data: s, isLoading } = useGetAdminStatsQuery(undefined, { pollingInterval: 60000 });
  const { data: a } = useGetAdminAnalyticsQuery(Number(days));
  const v = (n?: number) => (isLoading || n === undefined ? "—" : n.toLocaleString());

  const alerts = [
    (s?.products.pending ?? 0) > 0 && { href: "/admin/products?status=pending", icon: Clock, text: `${s!.products.pending} product${s!.products.pending === 1 ? "" : "s"} waiting for review` },
    (s?.moderation.openReports ?? 0) > 0 && { href: "/admin/reports", icon: Flag, text: `${s!.moderation.openReports} open report${s!.moderation.openReports === 1 ? "" : "s"}` },
    (s?.email.failed ?? 0) > 0 && { href: "/admin/emails?status=failed", icon: AlertTriangle, text: `${s!.email.failed} email${s!.email.failed === 1 ? "" : "s"} failed to send` },
    (s?.revenue.pending ?? 0) > 0 && { href: "/admin/payments?status=pending", icon: DollarSign, text: `${s!.revenue.pending} payment${s!.revenue.pending === 1 ? "" : "s"} pending confirmation` },
  ].filter(Boolean) as { href: string; icon: any; text: string }[];

  return (
    <AdminPage title="Dashboard" desc="Everything happening on OnlyFounders, live."
      actions={<Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "90", label: "90d" }]} />}>

      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {alerts.map(al => (
            <Link key={al.href} href={al.href} className="ds-banner ds-banner--warning" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--yellow-border)" }}>
              <al.icon size={16} style={{ color: "var(--yellow)" }} /> {al.text} <span style={{ marginLeft: "auto", color: "var(--accent)" }}>Review →</span>
            </Link>
          ))}
        </div>
      )}

      <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Founders</h2>
      <KpiGrid>
        <Kpi icon={Users} label="Total founders" value={v(s?.users.total)} sub={`${v(s?.users.verified)} verified · ${v(s?.users.admins)} admins`} />
        <Kpi icon={UserPlus} label="New this week" value={v(s?.users.new7d)} sub={`${v(s?.users.new30d)} in 30 days`} tone="good" />
        <Kpi icon={Activity} label="Active today" value={v(s?.users.active1d)} sub={`${v(s?.users.active7d)} active this week`} />
        <Kpi icon={ShieldAlert} label="Suspended" value={v(s?.users.suspended)} sub={`${v(s?.users.deactivated)} deactivated`} tone={(s?.users.suspended ?? 0) > 0 ? "bad" : undefined} />
      </KpiGrid>

      <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Launches & revenue</h2>
      <KpiGrid>
        <Kpi icon={Package} label="Products" value={v(s?.products.total)} sub={`${v(s?.products.approved)} live · ${v(s?.products.draft)} drafts · ${v(s?.products.featured)} featured`} />
        <Kpi icon={Clock} label="Pending review" value={v(s?.products.pending)} tone={(s?.products.pending ?? 0) > 0 ? "warn" : undefined} sub={`${v(s?.products.rejected)} rejected`} />
        <Kpi icon={ChevronUp} label="Upvotes" value={v(s?.products.upvotes)} sub={`${v(s?.products.comments)} product comments`} />
        <Kpi icon={DollarSign} label="Revenue" value={isLoading ? "—" : money(s?.revenue.total)} sub={`${isLoading ? "—" : money(s?.revenue.last30d)} in 30 days · ${v(s?.revenue.completed)} payments`} tone="good" />
        <Kpi icon={Sparkles} label="Paid plans" value={v((s?.subscriptions.starter ?? 0) + (s?.subscriptions.pro ?? 0))} sub={`${v(s?.subscriptions.starter)} Starter · ${v(s?.subscriptions.pro)} Pro`} />
      </KpiGrid>

      <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Engagement & delivery</h2>
      <KpiGrid>
        <Kpi icon={MessageSquareText} label="Posts" value={v(s?.content.posts)} sub={`${v(s?.content.posts24h)} today · ${v(s?.content.replies)} replies · ${v(s?.content.likes)} likes`} />
        <Kpi icon={Mail} label="Messages" value={v(s?.content.messages)} sub={`${v(s?.content.messages24h)} today · ${v(s?.content.conversations)} conversations`} />
        <Kpi icon={Mail} label="Emails sent (24h)" value={v(s?.email.sent24h)} sub={`${v(s?.email.queued)} queued · ${v(s?.email.skipped24h)} skipped`} />
        <Kpi icon={AlertTriangle} label="Failed emails" value={v(s?.email.failed)} tone={(s?.email.failed ?? 0) > 0 ? "bad" : undefined} sub={<Link href="/admin/emails" className="ds-link" style={{ color: "var(--accent)" }}>Open email queue</Link>} />
        <Kpi icon={Flag} label="Open reports" value={v(s?.moderation.openReports)} tone={(s?.moderation.openReports ?? 0) > 0 ? "warn" : undefined} sub={<Link href="/admin/reports" className="ds-link" style={{ color: "var(--accent)" }}>Moderation queue</Link>} />
      </KpiGrid>

      <div className="adm-grid-3">
        {SERIES.map(sr => (
          <Panel key={sr.key} title={sr.label}>
            {a ? <BarChart label={sr.label} data={a.series[sr.key]} format={sr.key === "revenue" ? money : undefined} /> : <div style={{ height: 180 }} className="fp-skeleton" />}
          </Panel>
        ))}
      </div>

      <div className="adm-grid-3">
        <Panel title="Top products" actions={<Link href="/admin/products?sort=upvotes" className="ds-link" style={{ color: "var(--accent)", fontSize: "var(--font-sm)" }}>All</Link>}>
          {(a?.topProducts ?? []).map((p, i) => (
            <Link key={p._id} href={`/products/${p.slug}`} className="adm-list-row">
              <span style={{ width: 18, color: "var(--text-secondary)", fontWeight: 700 }}>{i + 1}</span>
              {p.logo ? <img src={p.logo} alt="" width={32} height={32} style={{ borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)" }} /> : <Package size={20} />}
              <span style={{ flex: 1, minWidth: 0, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>{p.upvoteCount} ▲</span>
            </Link>
          ))}
          {a && !a.topProducts.length && <p style={{ color: "var(--text-secondary)" }}>No live products yet.</p>}
        </Panel>
        <Panel title="Top founders by reputation" actions={<Link href="/admin/users?sort=reputation" className="ds-link" style={{ color: "var(--accent)", fontSize: "var(--font-sm)" }}>All</Link>}>
          {(a?.topFounders ?? []).map((u, i) => (
            <Link key={u._id} href={`/admin/users/${u._id}`} className="adm-list-row">
              <span style={{ width: 18, color: "var(--text-secondary)", fontWeight: 700 }}>{i + 1}</span>
              <Avatar src={u.avatar} name={u.name} size={32} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--text-secondary)" }}>@{u.username} · {u.followers} followers</span>
              </span>
              <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>{u.reputation}</span>
            </Link>
          ))}
        </Panel>
        <Panel title="Products by category">
          {(a?.categories ?? []).map(c => {
            const max = Math.max(...(a?.categories ?? []).map(x => x.count), 1);
            return (
              <div key={c.category} style={{ marginBottom: 10 }} title={`${c.category}: ${c.count}`}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-sm)", marginBottom: 4 }}><span>{c.category}</span><span style={{ color: "var(--text-secondary)" }}>{c.count}</span></div>
                <div style={{ height: 8, background: "var(--bg-active)", borderRadius: 4 }}><div style={{ width: `${(c.count / max) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 4 }} /></div>
              </div>
            );
          })}
        </Panel>
      </div>
    </AdminPage>
  );
}
