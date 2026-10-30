"use client";
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
        fontSize: 11,
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
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 20,
        background: isAdmin ? "rgba(88,204,2,0.12)" : "var(--bg-active)",
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
        <div style={{ width: "35%", height: 12, background: "var(--bg-active)", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: "50%", height: 10, background: "var(--bg-active)", borderRadius: 4 }} />
      </div>
      <div style={{ width: 55, height: 22, background: "var(--bg-active)", borderRadius: 20 }} />
      <div style={{ width: 130, height: 28, background: "var(--bg-active)", borderRadius: 7 }} />
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
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Users
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
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
          style={{
            padding: "7px 12px",
            fontSize: 13,
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--bg-card)",
            color: "var(--text)",
            outline: "none",
            minWidth: 240,
          }}
        />

        {data && (
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            {data.total} user{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
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
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Name / Username
          </div>
          <div style={{ width: 160, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Email
          </div>
          <div style={{ width: 65, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Role
          </div>
          <div style={{ width: 70, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Rep
          </div>
          <div style={{ width: 95, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Joined
          </div>
          <div style={{ width: 140, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Actions
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty */}
        {!loading && users.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>
              No users found
            </p>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
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
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                  @{user.username}
                </div>
              </div>

              {/* Email */}
              <div
                style={{
                  width: 160,
                  fontSize: 11.5,
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
                  fontSize: 12,
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
                  fontSize: 11.5,
                  color: "var(--text-tertiary)",
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
                      fontSize: 11,
                      fontWeight: 600,
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Make admin
                  </button>
                )}
                {user.role === "admin" && (
                  <button
                    onClick={() => handleRemoveAdmin(user._id)}
                    style={{
                      padding: "5px 11px",
                      fontSize: 11,
                      fontWeight: 600,
                      background: "transparent",
                      color: "var(--red)",
                      border: "1px solid rgba(255,75,75,0.3)",
                      borderRadius: 6,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Remove admin
                  </button>
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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "var(--bg-card)",
              color: page <= 1 ? "var(--text-tertiary)" : "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              cursor: page <= 1 ? "default" : "pointer",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "var(--bg-card)",
              color: page >= totalPages ? "var(--text-tertiary)" : "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              cursor: page >= totalPages ? "default" : "pointer",
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
