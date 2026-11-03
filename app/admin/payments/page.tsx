"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useGetAdminPaymentsQuery, useUpdatePaymentMutation } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, SearchInput, Select, Segmented, DataTable, Pagination, StatusChip, KpiGrid, Kpi, fmtDate, money, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";

function PaymentsInner() {
  const { filters, setFilter, page, setPage, search, setSearch, debouncedSearch } = useListState({ status: "", plan: "" });
  const { data, isFetching } = useGetAdminPaymentsQuery({ ...filters, search: debouncedSearch, page, limit: 25 });
  const [update] = useUpdatePaymentMutation();
  const { push } = useToast();

  const change = async (p: any, status: string) => {
    const msg = status === "refunded" ? "Mark as refunded? The product loses its paid perks." : status === "completed" ? "Mark as paid? This grants the plan's perks (use when a webhook was missed)." : "Mark as failed?";
    const note = window.prompt(`${msg}\n\nOptional note:`);
    if (note === null) return;
    try { await update({ id: p._id, status, note }).unwrap(); push({ title: `Payment marked ${status}` }); } catch (e: any) { push({ title: "Couldn't update", description: e?.data?.message }); }
  };

  const byPlan = Object.fromEntries((data?.byPlan ?? []).map(b => [b._id, b]));

  const columns: Column<any>[] = [
    { key: "date", label: "Date", render: p => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(p.createdAt, true)}</span> },
    { key: "user", label: "Founder", render: p => p.user ? <Link href={`/admin/users/${p.user._id}`} className="ds-link"><strong>{p.user.name}</strong><br /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.user.email}</span></Link> : "Deleted user" },
    { key: "product", label: "Product", render: p => p.product ? <Link href={`/products/${p.product.slug}`} target="_blank" className="ds-link">{p.product.name}</Link> : "Deleted product" },
    { key: "plan", label: "Plan", render: p => <StatusChip value={p.plan} /> },
    { key: "amount", label: "Amount", align: "right", render: p => <strong>{money(p.amount)}</strong> },
    { key: "status", label: "Status", render: p => <StatusChip value={p.status} /> },
    { key: "ref", label: "Reference", render: p => <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-secondary)" }}>{p.providerTransactionId || p._id}</span> },
    { key: "note", label: "Note", render: p => <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.note}</span> },
    { key: "actions", label: "", align: "right", render: p => (
      <select className="adm-select" style={{ minHeight: 30 }} value="" aria-label="Payment actions" onChange={e => e.target.value && change(p, e.target.value)}>
        <option value="">Actions…</option>
        {p.status !== "completed" && <option value="completed">Mark as paid</option>}
        {p.status === "completed" && <option value="refunded">Refund & revoke perks</option>}
        {p.status === "pending" && <option value="failed">Mark as failed</option>}
      </select>
    ) },
  ];

  return (
    <AdminPage title="Payments" desc="Every checkout started on OnlyFounders, processed by Paddle.">
      <KpiGrid>
        <Kpi label="Starter sales" value={byPlan.starter?.n ?? 0} sub={money(byPlan.starter?.revenue)} />
        <Kpi label="Pro sales" value={byPlan.pro?.n ?? 0} sub={money(byPlan.pro?.revenue)} />
        <Kpi label="Total revenue" value={money((byPlan.starter?.revenue ?? 0) + (byPlan.pro?.revenue ?? 0))} tone="good" />
      </KpiGrid>
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search founder name, @username or email" />
        <Segmented value={filters.status} onChange={v => setFilter("status", v)} options={[{ value: "", label: "All" }, { value: "completed", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }, { value: "refunded", label: "Refunded" }]} />
        <Select label="Plan" value={filters.plan} onChange={v => setFilter("plan", v)} options={[{ value: "", label: "Any plan" }, { value: "starter", label: "Starter" }, { value: "pro", label: "Pro" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.payments ?? []} loading={isFetching} empty="No payments yet." />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminPaymentsPage() {
  return <Suspense fallback={null}><PaymentsInner /></Suspense>;
}
