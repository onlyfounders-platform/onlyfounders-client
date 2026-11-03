"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetAdminSubscriptionsQuery, useGetAdminStatsQuery, useUpdateUserMutation, type AdminUser } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, Segmented, DataTable, Pagination, StatusChip, KpiGrid, Kpi, fmtDate, money, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";

function SubsInner() {
  const router = useRouter();
  const { filters, setFilter, page, setPage } = useListState({ plan: "all" });
  const { data, isFetching } = useGetAdminSubscriptionsQuery({ ...filters, page, limit: 25 });
  const { data: stats } = useGetAdminStatsQuery();
  const [update] = useUpdateUserMutation();
  const { push } = useToast();

  const setPlan = async (u: AdminUser, plan: string) => {
    if (!window.confirm(`Change @${u.username} to ${plan}? They'll be emailed.`)) return;
    try { await update({ id: u._id, subscription: { plan } }).unwrap(); push({ title: `@${u.username} is now on ${plan}` }); }
    catch (e: any) { push({ title: "Couldn't change plan", description: e?.data?.message }); }
  };

  const columns: Column<AdminUser>[] = [
    { key: "user", label: "Founder", render: u => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar src={u.avatar} name={u.name} size={32} />
        <div><div style={{ fontWeight: 700 }}>{u.name}</div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>@{u.username} · {u.email}</div></div>
      </div>
    ) },
    { key: "plan", label: "Plan", render: u => <StatusChip value={u.subscription?.plan ?? "free"} /> },
    { key: "status", label: "Status", render: u => <StatusChip value={u.subscription?.status ?? "active"} /> },
    { key: "source", label: "Source", render: u => u.subscription?.source === "admin" ? "Admin grant" : u.subscription?.source === "payment" ? "Payment" : "—" },
    { key: "started", label: "Started", render: u => fmtDate(u.subscription?.startedAt) },
    { key: "expires", label: "Expires", render: u => u.subscription?.expiresAt ? fmtDate(u.subscription.expiresAt) : "Never" },
    { key: "note", label: "Note", render: u => <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{u.subscription?.note || ""}</span> },
    { key: "actions", label: "", align: "right", render: u => (
      <select className="adm-select" style={{ minHeight: 30 }} value="" aria-label={`Change plan for ${u.username}`} onClick={e => e.stopPropagation()} onChange={e => e.target.value && setPlan(u, e.target.value)}>
        <option value="">Change…</option>
        {["free", "starter", "pro"].filter(p => p !== u.subscription?.plan).map(p => <option key={p} value={p}>{p === "free" ? "Downgrade to Free" : `Move to ${p}`}</option>)}
      </select>
    ) },
  ];

  return (
    <AdminPage title="Subscriptions" desc={<>Founders on paid plans. Grant, upgrade or downgrade from here or a founder’s page. Prices and features live in <Link href="/admin/settings#plans" className="ds-link" style={{ color: "var(--accent)" }}>Platform settings</Link>.</>}>
      <KpiGrid>
        <Kpi label="Free" value={(stats?.subscriptions.free ?? 0).toLocaleString()} />
        <Kpi label="Starter" value={(stats?.subscriptions.starter ?? 0).toLocaleString()} />
        <Kpi label="Pro" value={(stats?.subscriptions.pro ?? 0).toLocaleString()} />
        <Kpi label="Lifetime revenue" value={money(stats?.revenue.total)} sub={`${money(stats?.revenue.last30d)} in 30 days`} tone="good" />
      </KpiGrid>
      <Toolbar>
        <Segmented value={filters.plan} onChange={v => setFilter("plan", v)} options={[{ value: "all", label: "All paid" }, { value: "starter", label: "Starter" }, { value: "pro", label: "Pro" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.users ?? []} loading={isFetching} empty="No founders on a paid plan yet." onRowClick={u => router.push(`/admin/users/${u._id}`)} />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminSubscriptionsPage() {
  return <Suspense fallback={null}><SubsInner /></Suspense>;
}
