"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useGetAdminUsersQuery, type AdminUser } from "@/lib/api/adminApi";
import { AdminPage, Toolbar, SearchInput, Select, Segmented, DataTable, Pagination, StatusChip, fmtDate, type Column } from "@/components/admin/AdminUI";
import { useListState } from "@/components/admin/useListState";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { Flame } from "lucide-react";

function UsersInner() {
  const router = useRouter();
  const { filters, setFilter, page, setPage, search, setSearch, debouncedSearch } = useListState({ status: "", role: "", plan: "", verified: "", sort: "newest" });
  const { data, isFetching } = useGetAdminUsersQuery({ ...filters, search: debouncedSearch, page, limit: 25 });

  const columns: Column<AdminUser>[] = [
    { key: "user", label: "Founder", render: u => (
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
        <Avatar src={u.avatar} name={u.name} size={34} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>{u.name}{u.isVerified && <VerifiedBadge size={14} />}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>@{u.username} · {u.email}</div>
        </div>
      </div>
    ) },
    { key: "status", label: "Status", render: u => <StatusChip value={u.status ?? "active"} /> },
    { key: "role", label: "Role", render: u => <StatusChip value={u.role} /> },
    { key: "plan", label: "Plan", render: u => <StatusChip value={u.subscription?.plan ?? "free"} /> },
    { key: "rep", label: "Reputation", align: "right", render: u => (u.reputation ?? 0).toLocaleString() },
    { key: "followers", label: "Followers", align: "right", render: u => (u.followers?.length ?? 0).toLocaleString() },
    { key: "streak", label: "Streak", align: "right", render: u => <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Flame size={13} style={{ color: (u.launchStreak ?? 0) > 0 ? "#FF7A00" : "var(--text-secondary)" }} />{u.launchStreak ?? 0}</span> },
    { key: "seen", label: "Last seen", render: u => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(u.lastSeenAt)}</span> },
    { key: "joined", label: "Joined", render: u => <span style={{ whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</span> },
  ];

  return (
    <AdminPage title="Users" desc="Every founder on the platform. Open one to see their full history and manage their account.">
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, @username or email" />
        <Segmented value={filters.status} onChange={v => setFilter("status", v)} options={[
          { value: "", label: "All" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }, { value: "deactivated", label: "Deactivated" },
        ]} />
        <Select label="Plan" value={filters.plan} onChange={v => setFilter("plan", v)} options={[{ value: "", label: "Any plan" }, { value: "free", label: "Free" }, { value: "starter", label: "Starter" }, { value: "pro", label: "Pro" }]} />
        <Select label="Role" value={filters.role} onChange={v => setFilter("role", v)} options={[{ value: "", label: "Any role" }, { value: "user", label: "Users" }, { value: "admin", label: "Admins" }]} />
        <Select label="Verified" value={filters.verified} onChange={v => setFilter("verified", v)} options={[{ value: "", label: "Verified or not" }, { value: "true", label: "Verified only" }]} />
        <Select label="Sort" value={filters.sort} onChange={v => setFilter("sort", v)} options={[
          { value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "reputation", label: "Reputation" }, { value: "lastSeen", label: "Recently active" }, { value: "streak", label: "Longest streak" },
        ]} />
      </Toolbar>
      <DataTable columns={columns} rows={data?.users ?? []} loading={isFetching} empty="No founders match these filters." onRowClick={u => router.push(`/admin/users/${u._id}`)} />
      <Pagination page={page} pages={data?.pages ?? 1} total={data?.total} onChange={setPage} />
    </AdminPage>
  );
}

export default function AdminUsersPage() {
  return <Suspense fallback={null}><UsersInner /></Suspense>;
}
