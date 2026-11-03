"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useGetAdminReportsQuery, useResolveReportMutation } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, Select, Segmented, DataTable, Pagination, StatusChip, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

const TARGET_LINK = (r: any) => r.targetType === "post" ? `/post/${r.targetId}` : r.targetType === "user" && r.targetUser ? `/admin/users/${r.targetUser._id}` : null;

function ReportsInner() {
  const { filters, setFilter, page, setPage } = useListState({ status: "open", targetType: "" });
  const { data, isFetching } = useGetAdminReportsQuery({ ...filters, page, limit: 25 });
  const [resolve, { isLoading }] = useResolveReportMutation();
  const { push } = useToast();

  const act = async (r: any, action: string) => {
    let note: string | undefined;
    let suspendDays: number | undefined;
    if (action === "remove_content" || action === "suspend_user") {
      const n = window.prompt(action === "suspend_user" ? `Suspend @${r.targetUser?.username}? Reason shown to them:` : "Reason for removal (sent to the author):", `Reported for ${r.reason}`);
      if (n === null) return;
      note = n;
      if (action === "suspend_user") {
        const d = window.prompt("Suspend for how many days? Leave empty for indefinitely.", "7");
        if (d === null) return;
        suspendDays = d ? Number(d) : undefined;
      }
    }
    try { await resolve({ id: r._id, action, note, suspendDays }).unwrap(); push({ title: "Report handled", description: "Every open report on this item was closed." }); }
    catch (e: any) { push({ title: "Action failed", description: e?.data?.message }); }
  };

  const columns: Column<any>[] = [
    { key: "reason", label: "Reason", render: r => (
      <div style={{ minWidth: 160 }}>
        <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{r.reason}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.targetType}{r.openCount > 1 ? ` · ${r.openCount} open reports` : ""}</div>
      </div>
    ) },
    { key: "content", label: "Reported content", render: r => {
      const href = TARGET_LINK(r);
      return (
        <div style={{ maxWidth: 360, minWidth: 220 }}>
          <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.snapshot || "—"}</div>
          {r.details && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>“{r.details}”</div>}
          {href && <Link href={href} target="_blank" className="ds-link" style={{ fontSize: 12, color: "var(--accent)" }}>Open</Link>}
        </div>
      );
    } },
    { key: "owner", label: "Owner", render: r => r.targetUser ? <Link href={`/admin/users/${r.targetUser._id}`} className="ds-link">@{r.targetUser.username}</Link> : "—" },
    { key: "reporter", label: "Reporter", render: r => r.reporter ? <Link href={`/admin/users/${r.reporter._id}`} className="ds-link">@{r.reporter.username}</Link> : "—" },
    { key: "date", label: "Reported", render: r => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(r.createdAt, true)}</span> },
    { key: "status", label: "Status", render: r => (
      <div>
        <StatusChip value={r.status} />
        {r.resolution && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{r.resolution}{r.resolvedBy ? ` · @${r.resolvedBy.username}` : ""}</div>}
      </div>
    ) },
    { key: "actions", label: "", align: "right", render: r => r.status === "open" ? (
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <Button size="sm" variant="outline" disabled={isLoading} onClick={() => act(r, "dismiss")}>Dismiss</Button>
        {r.targetType !== "user" && <Button size="sm" variant="danger" disabled={isLoading} onClick={() => act(r, "remove_content")}>Remove</Button>}
        <Button size="sm" variant="danger" disabled={isLoading || !r.targetUser} onClick={() => act(r, "suspend_user")}>Suspend</Button>
      </div>
    ) : null },
  ];

  return (
    <AdminPage title="Reports" desc="Content and accounts flagged by founders. Acting on one report closes every open report on the same item.">
      <Toolbar>
        <Segmented value={filters.status} onChange={v => setFilter("status", v)} options={[{ value: "open", label: "Open" }, { value: "resolved", label: "Resolved" }, { value: "dismissed", label: "Dismissed" }, { value: "all", label: "All" }]} />
        <Select label="Type" value={filters.targetType} onChange={v => setFilter("targetType", v)} options={[{ value: "", label: "Any type" }, { value: "post", label: "Posts" }, { value: "comment", label: "Replies" }, { value: "user", label: "Accounts" }, { value: "product", label: "Products" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.reports ?? []} loading={isFetching} empty={filters.status === "open" ? "No open reports — the community is behaving." : "No reports."} />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminReportsPage() {
  return <Suspense fallback={null}><ReportsInner /></Suspense>;
}
