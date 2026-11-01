"use client";
import DSButton from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
    <Card padding="none" style={{padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8, opacity: loading ? 0.4 : 1, transition: "opacity 0.2s"}}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
        <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: "var(--font-2xl)", fontWeight: 800, letterSpacing: "-1px", color: accent ?? "var(--text)" }}>
        {loading ? "—" : value.toLocaleString()}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();

  const cards: StatCardProps[] = [
    { Icon: Package, iconColor: "var(--text-secondary)", label: "Total Products", value: stats?.totalProducts ?? 0 },
    { Icon: Clock, iconColor: "var(--yellow)", label: "Pending Review", value: stats?.pendingProducts ?? 0, accent: !isLoading && (stats?.pendingProducts ?? 0) > 0 ? "var(--yellow)" : undefined },
    { Icon: CheckCircle, iconColor: "var(--green)", label: "Approved", value: stats?.approvedProducts ?? 0, accent: !isLoading ? "var(--green)" : undefined },
    { Icon: Users, iconColor: "var(--text-secondary)", label: "Total Users", value: stats?.totalUsers ?? 0 },
    { Icon: ChevronUp, iconColor: "var(--accent)", label: "Total Upvotes", value: stats?.totalUpvotes ?? 0 },
    { Icon: MessageCircle, iconColor: "var(--blue)", label: "Total Comments", value: stats?.totalComments ?? 0 },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>Overview of your platform activity.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {cards.map((card) => <StatCard key={card.label} {...card} loading={isLoading} />)}
      </div>

      <div>
        <h2 style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
          Quick actions
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/products?status=pending" style={{ textDecoration: "none" }}>
            <DSButton variant="secondary" style={{display: "flex", alignItems: "center", gap: 6}}>
              View pending products <ChevronRight size={14} />
            </DSButton>
          </Link>
          <DSButton onClick={() => alert("Coming soon")} variant="outline" style={{display: "flex", alignItems: "center", gap: 6}}>
            Seed from Product Hunt <ChevronRight size={14} />
          </DSButton>
        </div>
      </div>
    </div>
  );
}
