"use client";
import { Suspense } from "react";
import { useGetAdminLogsQuery } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, Select, DataTable, Pagination, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import Avatar from "@/components/ui/Avatar";

function LogsInner() {
  const { filters, setFilter, page, setPage } = useListState({ action: "" });
  const { data, isFetching } = useGetAdminLogsQuery({ ...filters, page, limit: 40 });
  const columns: Column<any>[] = [
    { key: "date", label: "When", render: l => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(l.createdAt, true)}</span> },
    { key: "admin", label: "Admin", render: l => l.admin ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar src={l.admin.avatar} name={l.admin.name} size={24} />@{l.admin.username}</span> : "—" },
    { key: "action", label: "Action", render: l => <code style={{ fontSize: 12 }}>{l.action}</code> },
    { key: "summary", label: "Details", render: l => l.summary },
  ];
  return (
    <AdminPage title="Audit log" desc="Every change an admin makes — moderation, plan changes, settings, broadcasts.">
      <Toolbar>
        <Select label="Action" value={filters.action} onChange={v => setFilter("action", v)} options={[
          { value: "", label: "All actions" }, { value: "user", label: "Users" }, { value: "product", label: "Products" }, { value: "post", label: "Posts" },
          { value: "report", label: "Reports" }, { value: "payment", label: "Payments" }, { value: "settings", label: "Settings" }, { value: "broadcast", label: "Broadcasts" }, { value: "email", label: "Email" },
        ]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.logs ?? []} loading={isFetching} empty="No admin actions recorded yet." />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminLogsPage() {
  return <Suspense fallback={null}><LogsInner /></Suspense>;
}
