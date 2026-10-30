"use client";
import Link from "next/link";
import { useGetAdminStatsQuery } from "@/lib/api/adminApi";
import { Package, Clock, CheckCircle, Users, ChevronUp, MessageCircle, ChevronRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  Icon: LucideIcon;
  iconColor: string;
  label: string;
  value: number | string;
  accent?: string;
  loading?: boolean;
}

function StatCard({ Icon, iconColor, label, value, accent, loading }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8,
      opacity: loading ? 0.4 : 1, transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", color: accent ?? "var(--text)" }}>
        {loading ? "—" : value.toLocaleString()}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();

  const cards: StatCardProps[] = [
    { Icon: Package, iconColor: "var(--text-secondary)", label: "Total Products", value: stats?.totalProducts ?? 0 },
    { Icon: Clock, iconColor: "#f59e0b", label: "Pending Review", value: stats?.pendingProducts ?? 0, accent: !isLoading && (stats?.pendingProducts ?? 0) > 0 ? "#f59e0b" : undefined },
    { Icon: CheckCircle, iconColor: "#22c55e", label: "Approved", value: stats?.approvedProducts ?? 0, accent: !isLoading ? "#22c55e" : undefined },
    { Icon: Users, iconColor: "var(--text-secondary)", label: "Total Users", value: stats?.totalUsers ?? 0 },
    { Icon: ChevronUp, iconColor: "var(--accent)", label: "Total Upvotes", value: stats?.totalUpvotes ?? 0 },
    { Icon: MessageCircle, iconColor: "#3b82f6", label: "Total Comments", value: stats?.totalComments ?? 0 },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Overview of your platform activity.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {cards.map((card) => <StatCard key={card.label} {...card} loading={isLoading} />)}
      </div>

      <div>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
          Quick actions
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/products?status=pending" style={{ textDecoration: "none" }}>
            <button style={{ padding: "9px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              View pending products <ChevronRight size={14} />
            </button>
          </Link>
          <button onClick={() => alert("Coming soon")} style={{ padding: "9px 18px", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Seed from Product Hunt <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
