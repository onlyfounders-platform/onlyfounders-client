"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { RotateCcw, XCircle, Send, AlertTriangle } from "lucide-react";
import { useGetAdminEmailsQuery, useRetryEmailMutation, useCancelEmailMutation, useRetryFailedEmailsMutation, useSendTestEmailMutation } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, SearchInput, Select, Segmented, DataTable, Pagination, StatusChip, KpiGrid, Kpi, Panel, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

function EmailsInner() {
  const { filters, setFilter, page, setPage, search, setSearch, debouncedSearch } = useListState({ status: "", template: "", kind: "single" });
  const { data, isFetching } = useGetAdminEmailsQuery({ ...filters, search: debouncedSearch, page, limit: 30 }, { pollingInterval: 15000 });
  const [retry] = useRetryEmailMutation();
  const [cancel] = useCancelEmailMutation();
  const [retryAll, { isLoading: retryingAll }] = useRetryFailedEmailsMutation();
  const [sendTest, { isLoading: testing }] = useSendTestEmailMutation();
  const [testTemplate, setTestTemplate] = useState("broadcast");
  const { push } = useToast();
  const s = data?.byStatus ?? {};

  const run = async (p: Promise<any>, ok: string) => { try { const r = await p; push({ title: r?.message || ok }); } catch (e: any) { push({ title: "Action failed", description: e?.data?.message }); } };

  const columns: Column<any>[] = [
    { key: "created", label: "Queued", render: e => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(e.createdAt, true)}</span> },
    { key: "to", label: "Recipient", render: e => e.kind === "fanout"
      ? <span><strong>Fan-out</strong> → {e.fanout?.audience}<br /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.fanout?.expanded ?? 0} emails created</span></span>
      : <span>{e.user ? <Link href={`/admin/users/${e.user._id}`} className="ds-link"><strong>@{e.user.username}</strong></Link> : null}<br /><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.to}</span></span> },
    { key: "template", label: "Template", render: e => <code style={{ fontSize: 12 }}>{e.template}</code> },
    { key: "subject", label: "Subject", render: e => <span style={{ display: "block", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject || "—"}</span> },
    { key: "category", label: "Category", render: e => <span style={{ fontSize: 12 }}>{e.category}</span> },
    { key: "status", label: "Status", render: e => (
      <div style={{ maxWidth: 220 }}>
        <StatusChip value={e.status} />
        {(e.lastError || e.skipReason) && <div style={{ fontSize: 11, color: e.lastError ? "var(--red)" : "var(--text-secondary)", marginTop: 2 }}>{e.lastError || e.skipReason}</div>}
        {e.status === "queued" && new Date(e.runAt) > new Date() && <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>sends {fmtDate(e.runAt, true)}</div>}
      </div>
    ) },
    { key: "attempts", label: "Tries", align: "right", render: e => `${e.attempts}/${e.maxAttempts}` },
    { key: "sent", label: "Sent", render: e => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(e.sentAt, true)}</span> },
    { key: "actions", label: "", align: "right", render: e => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        {["failed", "skipped", "cancelled"].includes(e.status) && <button className="ds-icon-btn" title="Retry" aria-label="Retry email" onClick={() => run(retry(e._id).unwrap(), "Re-queued")}><RotateCcw size={15} /></button>}
        {e.status === "queued" && <button className="ds-icon-btn ds-icon-btn--danger" title="Cancel" aria-label="Cancel email" onClick={() => run(cancel(e._id).unwrap(), "Cancelled")}><XCircle size={15} /></button>}
      </div>
    ) },
  ];

  return (
    <AdminPage title="Email queue" desc="Every email the platform sends goes through a durable queue with retries and backoff. Updates every 15 seconds."
      actions={(s.failed ?? 0) > 0 ? <Button size="sm" variant="outline" icon={<RotateCcw size={14} />} loading={retryingAll} onClick={() => run(retryAll().unwrap(), "Re-queued")}>Retry all failed</Button> : undefined}>
      {data && !data.smtpConfigured && (
        <div className="ds-banner ds-banner--warning" style={{ borderRadius: 12, marginBottom: 16, border: "1px solid var(--yellow-border)" }}>
          <AlertTriangle size={16} style={{ color: "var(--yellow)" }} /> SMTP isn’t configured on the API (NODEMAILER_HOST), so emails are logged to the server console instead of delivered.
        </div>
      )}
      <KpiGrid>
        <Kpi label="Queued" value={(s.queued ?? 0) + (s.processing ?? 0)} tone={(s.queued ?? 0) > 50 ? "warn" : undefined} />
        <Kpi label="Sent" value={(s.sent ?? 0).toLocaleString()} tone="good" sub="last 90 days" />
        <Kpi label="Skipped" value={(s.skipped ?? 0).toLocaleString()} sub="opted out, read in app, or throttled" />
        <Kpi label="Failed" value={s.failed ?? 0} tone={(s.failed ?? 0) > 0 ? "bad" : undefined} />
      </KpiGrid>

      <div className="adm-grid-2">
        <Panel title="Volume by template (30 days)">
          {(data?.byTemplate ?? []).length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No emails yet.</p> : (data?.byTemplate ?? []).map(t => (
            <div key={t._id} className="adm-list-row" style={{ cursor: "pointer" }} onClick={() => setFilter("template", t._id)}>
              <code style={{ flex: 1, fontSize: 12 }}>{t._id}</code>
              <span style={{ fontSize: "var(--font-sm)" }}>{t.sent.toLocaleString()} sent</span>
              <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", width: 80, textAlign: "right" }}>{t.n.toLocaleString()} total</span>
            </div>
          ))}
        </Panel>
        <Panel title="Send a test email">
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)", marginBottom: 12 }}>Renders a template with sample data and sends it to your own admin address so you can check delivery and design.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Select label="Template" value={testTemplate} onChange={setTestTemplate} options={(data?.templates ?? ["broadcast"]).map(t => ({ value: t, label: t }))} />
            <Button size="sm" variant="secondary" icon={<Send size={14} />} loading={testing} onClick={() => run(sendTest(testTemplate).unwrap(), "Test queued")}>Send test</Button>
          </div>
        </Panel>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search recipient email" />
        <Segmented value={filters.status} onChange={v => setFilter("status", v)} options={[{ value: "", label: "All" }, { value: "queued", label: "Queued" }, { value: "sent", label: "Sent" }, { value: "skipped", label: "Skipped" }, { value: "failed", label: "Failed" }]} />
        <Select label="Template" value={filters.template} onChange={v => setFilter("template", v)} options={[{ value: "", label: "All templates" }, ...(data?.templates ?? []).map(t => ({ value: t, label: t }))]} />
        <Select label="Kind" value={filters.kind} onChange={v => setFilter("kind", v)} options={[{ value: "single", label: "Individual emails" }, { value: "fanout", label: "Fan-out jobs" }, { value: "all", label: "Everything" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.emails ?? []} loading={isFetching && !data} empty="No emails match." />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminEmailsPage() {
  return <Suspense fallback={null}><EmailsInner /></Suspense>;
}
