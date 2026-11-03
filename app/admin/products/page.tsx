"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Check, X, Star, Trash2, ExternalLink } from "lucide-react";
import { useGetAdminProductsQuery, useAdminUpdateProductMutation, useAdminDeleteProductMutation, type AdminProduct } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, SearchInput, Select, Segmented, DataTable, Pagination, StatusChip, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";
import { Package } from "lucide-react";

function ProductsInner() {
  const { filters, setFilter, page, setPage, search, setSearch, debouncedSearch } = useListState({ status: "", plan: "", featured: "", sort: "newest" });
  const { data, isFetching } = useGetAdminProductsQuery({ ...filters, search: debouncedSearch, page, limit: 25 });
  const [update] = useAdminUpdateProductMutation();
  const [del] = useAdminDeleteProductMutation();
  const { push } = useToast();

  const run = async (p: Promise<unknown>, msg: string) => { try { await p; push({ title: msg }); } catch (e: any) { push({ title: "Action failed", description: e?.data?.message }); } };

  const columns: Column<AdminProduct>[] = [
    { key: "name", label: "Product", render: p => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
        {p.logo ? <img src={p.logo} alt="" width={34} height={34} style={{ borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)", flexShrink: 0 }} /> : <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-active)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Package size={16} /></span>}
        <div style={{ minWidth: 0 }}>
          <Link href={`/products/${p.slug}`} target="_blank" className="ds-link" style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>{p.name} <ExternalLink size={11} /></Link>
          <div style={{ color: "var(--text-secondary)", fontSize: 12, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.tagline}</div>
        </div>
      </div>
    ) },
    { key: "maker", label: "Maker", render: p => p.makers?.[0] ? <Link href={`/admin/users/${p.makers[0]._id}`} className="ds-link">@{p.makers[0].username}</Link> : "—" },
    { key: "status", label: "Status", render: p => <StatusChip value={p.status} /> },
    { key: "plan", label: "Plan", render: p => (
      <select className="adm-select" style={{ minHeight: 30 }} value={p.plan ?? "free"} aria-label={`Plan for ${p.name}`}
        onChange={e => run(update({ id: p._id, plan: e.target.value }).unwrap(), `${p.name} → ${e.target.value}`)}>
        <option value="free">Free</option><option value="starter">Starter</option><option value="pro">Pro</option>
      </select>
    ) },
    { key: "link", label: "Link", render: p => (
      <button className="ds-chip ds-chip--default" style={{ cursor: "pointer" }} title="Toggle dofollow / nofollow"
        onClick={() => run(update({ id: p._id, linkType: p.linkType === "dofollow" ? "nofollow" : "dofollow" }).unwrap(), "Link type updated")}>
        {p.linkType ?? "nofollow"}
      </button>
    ) },
    { key: "votes", label: "Upvotes", align: "right", render: p => p.upvoteCount ?? 0 },
    { key: "comments", label: "Comments", align: "right", render: p => p.commentCount ?? 0 },
    { key: "created", label: "Submitted", render: p => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</span> },
    { key: "actions", label: "", align: "right", render: p => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        {p.status !== "approved" && <button className="ds-icon-btn" title="Approve" aria-label={`Approve ${p.name}`} style={{ color: "var(--green)" }} onClick={() => run(update({ id: p._id, status: "approved" }).unwrap(), `${p.name} approved — launch emails queued`)}><Check size={17} /></button>}
        {p.status !== "rejected" && <button className="ds-icon-btn" title="Reject" aria-label={`Reject ${p.name}`} style={{ color: "var(--red)" }} onClick={() => { const reason = window.prompt(`Reason for rejecting ${p.name}? (sent to the maker)`) ?? undefined; if (reason !== undefined) run(update({ id: p._id, status: "rejected", rejectionReason: reason }).unwrap(), `${p.name} rejected`); }}><X size={17} /></button>}
        <button className="ds-icon-btn" title={p.isFeatured ? "Unfeature" : "Feature"} aria-label="Toggle featured" style={{ color: p.isFeatured ? "var(--yellow)" : undefined }} onClick={() => run(update({ id: p._id, isFeatured: !p.isFeatured }).unwrap(), p.isFeatured ? "Unfeatured" : "Featured")}><Star size={17} fill={p.isFeatured ? "currentColor" : "none"} /></button>
        <button className="ds-icon-btn ds-icon-btn--danger" title="Delete" aria-label={`Delete ${p.name}`} onClick={() => { if (window.confirm(`Delete ${p.name}? Its comments and upvotes are removed too.`)) run(del(p._id).unwrap(), "Product deleted"); }}><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <AdminPage title="Products" desc="Review launches, set plans and perks, and control backlinks.">
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search products" />
        <Segmented value={filters.status} onChange={v => setFilter("status", v)} options={[
          { value: "", label: "All" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Live" }, { value: "draft", label: "Drafts" }, { value: "rejected", label: "Rejected" },
        ]} />
        <Select label="Plan" value={filters.plan} onChange={v => setFilter("plan", v)} options={[{ value: "", label: "Any plan" }, { value: "free", label: "Free" }, { value: "starter", label: "Starter" }, { value: "pro", label: "Pro" }]} />
        <Select label="Featured" value={filters.featured} onChange={v => setFilter("featured", v)} options={[{ value: "", label: "Featured or not" }, { value: "true", label: "Featured only" }]} />
        <Select label="Sort" value={filters.sort} onChange={v => setFilter("sort", v)} options={[{ value: "newest", label: "Newest" }, { value: "upvotes", label: "Most upvoted" }, { value: "comments", label: "Most discussed" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.products ?? []} loading={isFetching} empty="No products match these filters." />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminProductsPage() {
  return <Suspense fallback={null}><ProductsInner /></Suspense>;
}
