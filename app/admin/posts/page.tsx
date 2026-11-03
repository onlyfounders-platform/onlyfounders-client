"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useGetAdminPostsQuery, useAdminDeletePostMutation } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, SearchInput, Select, DataTable, Pagination, StatusChip, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import { useToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";

function PostsInner() {
  const { filters, setFilter, page, setPage, search, setSearch, debouncedSearch } = useListState({ author: "", hasImages: "", sort: "newest" });
  const { data, isFetching } = useGetAdminPostsQuery({ ...filters, search: debouncedSearch, page, limit: 25 });
  const [del] = useAdminDeletePostMutation();
  const { push } = useToast();

  const columns: Column<any>[] = [
    { key: "author", label: "Author", render: p => p.author ? (
      <Link href={`/admin/users/${p.author._id}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar src={p.author.avatar} name={p.author.name} size={28} />
        <span><span style={{ display: "block", fontWeight: 700 }}>{p.author.name}</span><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>@{p.author.username}</span></span>
        {p.author.status !== "active" && <StatusChip value={p.author.status} />}
      </Link>
    ) : <span style={{ color: "var(--text-secondary)" }}>Deleted user</span> },
    { key: "text", label: "Post", render: p => (
      <div style={{ maxWidth: 420, minWidth: 220 }}>
        <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.text || <em style={{ color: "var(--text-secondary)" }}>No text</em>}</div>
        {p.images?.length > 0 && <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 4 }}><ImageIcon size={12} /> {p.images.length} image{p.images.length > 1 ? "s" : ""}</span>}
        {p.hashtags?.length > 0 && <span style={{ fontSize: 12, color: "var(--accent)", marginLeft: 8 }}>{p.hashtags.map((h: string) => `#${h}`).join(" ")}</span>}
      </div>
    ) },
    { key: "likes", label: "Likes", align: "right", render: p => p.likeCount },
    { key: "replies", label: "Replies", align: "right", render: p => p.commentCount },
    { key: "reposts", label: "Reposts", align: "right", render: p => p.repostCount },
    { key: "views", label: "Views", align: "right", render: p => p.viewCount ?? 0 },
    { key: "date", label: "Posted", render: p => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(p.createdAt, true)}</span> },
    { key: "actions", label: "", align: "right", render: p => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <Link href={`/post/${p._id}`} target="_blank" className="ds-icon-btn" aria-label="Open post"><ExternalLink size={16} /></Link>
        <button className="ds-icon-btn ds-icon-btn--danger" aria-label="Remove post" title="Remove post"
          onClick={async () => {
            const reason = window.prompt("Remove this post? Optionally give a reason (the author is notified).");
            if (reason === null) return;
            try { await del({ id: p._id, reason }).unwrap(); push({ title: "Post removed" }); } catch (e: any) { push({ title: "Couldn't remove", description: e?.data?.message }); }
          }}><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <AdminPage title="Posts" desc="Every post on the feed. Search, sort by engagement and remove anything that breaks the rules.">
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search post text" />
        <input className="adm-select" style={{ minWidth: 160 }} placeholder="@author" value={filters.author} onChange={e => setFilter("author", e.target.value)} aria-label="Filter by author" />
        <Select label="Media" value={filters.hasImages} onChange={v => setFilter("hasImages", v)} options={[{ value: "", label: "Any post" }, { value: "true", label: "With images" }]} />
        <Select label="Sort" value={filters.sort} onChange={v => setFilter("sort", v)} options={[{ value: "newest", label: "Newest" }, { value: "likes", label: "Most liked" }, { value: "replies", label: "Most replies" }, { value: "views", label: "Most viewed" }]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.posts ?? []} loading={isFetching} empty="No posts found." />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminPostsPage() {
  return <Suspense fallback={null}><PostsInner /></Suspense>;
}
