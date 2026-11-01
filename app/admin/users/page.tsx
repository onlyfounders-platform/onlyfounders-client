"use client";
import DSButton from "@/components/ui/Button";
import { useState, useEffect } from "react";
import {
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  AdminUser,
} from "@/lib/api/adminApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import UserDetailModal from "./UserDetailModal";

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--accent-dim)",
        color: "var(--accent)",
        border: "1px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "var(--font-sm)",
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        fontSize: "var(--font-sm)",
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: "var(--radius-lg)",
        background: isAdmin ? "var(--accent-dim)" : "var(--bg-active)",
        color: isAdmin ? "var(--accent)" : "var(--text-secondary)",
        border: isAdmin ? "1px solid var(--accent-border)" : "1px solid var(--border)",
        textTransform: "capitalize",
      }}
    >
      {role}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        opacity: 0.4,
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-active)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "35%", height: 12, background: "var(--bg-active)", borderRadius: "var(--radius-sm)", marginBottom: 6 }} />
        <div style={{ width: "50%", height: 10, background: "var(--bg-active)", borderRadius: "var(--radius-sm)" }} />
      </div>
      <div style={{ width: 55, height: 22, background: "var(--bg-active)", borderRadius: "var(--radius-lg)" }} />
      <div style={{ width: 130, height: 28, background: "var(--bg-active)", borderRadius: "var(--radius-md)" }} />
    </div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({ page, search });
  const [updateUser] = useUpdateUserMutation();

  const users: AdminUser[] = data?.users ?? [];
  const totalPages = data?.pages ?? 1;

  const loading = isLoading || isFetching;

  const handleMakeAdmin = (id: string) => updateUser({ id, role: "admin" });
  const handleRemoveAdmin = (id: string) => updateUser({ id, role: "user" });

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Users
        </h1>
        <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
          Manage user roles and view account details.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search users..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="ds-field" style={{padding: "7px 12px", minWidth: 240}}
        />

        {data && (
          <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginLeft: "auto" }}>
            {data.total} user{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
      <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 680 }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div style={{ width: 32, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Name / Username
          </div>
          <div style={{ width: 160, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Email
          </div>
          <div style={{ width: 65, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Role
          </div>
          <div style={{ width: 70, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Rep
          </div>
          <div style={{ width: 95, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Joined
          </div>
          <div style={{ width: 140, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Actions
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty */}
        {!loading && users.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>
              No users found
            </p>
            <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
              Try a different search query.
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "transparent")
              }
            >
              {/* Avatar */}
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
              ) : (
                <AvatarInitials name={user.name} />
              )}

              {/* Name + username */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "var(--font-base)",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                  @{user.username}
                </div>
              </div>

              {/* Email */}
              <div
                style={{
                  width: 160,
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {user.email}
              </div>

              {/* Role badge */}
              <div style={{ width: 65, flexShrink: 0 }}>
                <RoleBadge role={user.role} />
              </div>

              {/* Reputation */}
              <div
                style={{
                  width: 70,
                  textAlign: "right",
                  fontSize: "var(--font-sm)",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                {(user.reputation ?? 0).toLocaleString()}
              </div>

              {/* Joined */}
              <div
                style={{
                  width: 95,
                  fontSize: "var(--font-sm)",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                {formatDate(user.createdAt)}
              </div>

              {/* Actions */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 140,
                  display: "flex",
                  gap: 6,
                  justifyContent: "flex-end",
                  flexShrink: 0,
                }}
              >
                {user.role === "user" && (
                  <button
                    onClick={() => handleMakeAdmin(user._id)}
                    style={{
                      padding: "5px 11px",
                      fontSize: "var(--font-sm)",
                      fontWeight: 600,
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Make admin
                  </button>
                )}
                {user.role === "admin" && (
                  <DSButton
                    onClick={() => handleRemoveAdmin(user._id)}
                    variant="outline" style={{whiteSpace: "nowrap"}}
                  >
                    Remove admin
                  </DSButton>
                )}
              </div>
            </div>
          ))}
      </div>
      </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <DSButton
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            variant="outline" style={{opacity: page <= 1 ? 0.5 : 1}}
          >
            <ChevronLeft size={14} /> Prev
          </DSButton>
          <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </span>
          <DSButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            variant="outline" style={{opacity: page >= totalPages ? 0.5 : 1}}
          >
            Next <ChevronRight size={14} />
          </DSButton>
        </div>
      )}

      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
