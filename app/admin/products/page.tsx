"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useGetAdminProductsQuery,
  useAdminUpdateProductMutation as useUpdateProductMutation,
  useAdminDeleteProductMutation as useDeleteProductMutation,
  AdminProduct,
} from "@/lib/api/adminApi";
import { Check, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const BG_PALETTE = [
  "#1a3a2a", "#1a2a3a", "#2a1a3a", "#3a2a1a", "#1a3a3a",
  "#2d1f3a", "#1f3a2d", "#3a1f2d", "#2d3a1f", "#1f2d3a",
];

function nameToColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return BG_PALETTE[Math.abs(hash) % BG_PALETTE.length];
}

function MiniLogo({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  const size = 36;
  const radius = 8;
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  if (logo && !failed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={logo}
          alt={name}
          width={28}
          height={28}
          style={{ objectFit: "contain" }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: nameToColor(name),
        border: "1px solid rgba(88,204,2,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--accent)",
        letterSpacing: "-0.5px",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    pending: {
      background: "rgba(245,158,11,0.12)",
      color: "#f59e0b",
      border: "1px solid rgba(245,158,11,0.25)",
    },
    approved: {
      background: "rgba(34,197,94,0.1)",
      color: "#22c55e",
      border: "1px solid rgba(34,197,94,0.2)",
    },
    rejected: {
      background: "rgba(255,75,75,0.1)",
      color: "var(--red)",
      border: "1px solid rgba(255,75,75,0.2)",
    },
  };

  return (
    <span
      style={{
        ...((styles[status] as React.CSSProperties) ?? {}),
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 20,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        opacity: 0.4,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-active)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "40%", height: 12, background: "var(--bg-active)", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: "65%", height: 10, background: "var(--bg-active)", borderRadius: 4 }} />
      </div>
      <div style={{ width: 70, height: 22, background: "var(--bg-active)", borderRadius: 20 }} />
      <div style={{ width: 100, height: 22, background: "var(--bg-active)", borderRadius: 6 }} />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsContent />
    </Suspense>
  );
}

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") ?? "";
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleTabChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const { data, isLoading, isFetching } = useGetAdminProductsQuery({
    status,
    page,
    search,
  });

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products: AdminProduct[] = data?.products ?? [];
  const totalPages = data?.pages ?? 1;

  const handleApprove = (id: string) => updateProduct({ id, status: "approved" });
  const handleReject = (id: string) => updateProduct({ id, status: "rejected" });
  const handleToggleFeatured = (p: AdminProduct) =>
    updateProduct({ id: p._id, isFeatured: !p.isFeatured });
  const handleToggleVerified = (p: AdminProduct) =>
    updateProduct({ id: p._id, isVerified: !p.isVerified });
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      await deleteProduct(id);
    }
  };

  const loading = isLoading || isFetching;

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Products
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Manage, approve, and moderate submitted products.
        </p>
      </div>

      {/* Controls: tabs + search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Status tabs */}
        <div style={{ display: "flex", gap: 2, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 9, padding: 3 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: status === tab.value ? 700 : 400,
                color: status === tab.value ? "var(--text)" : "var(--text-secondary)",
                background: status === tab.value ? "var(--bg-active)" : "transparent",
                border: "none",
                borderRadius: 7,
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
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
            minWidth: 220,
          }}
        />

        {data && (
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            {data.total} product{data.total !== 1 ? "s" : ""}
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
      <div style={{ minWidth: 760 }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div style={{ width: 36, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Name / Tagline
          </div>
          <div style={{ width: 100, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Category
          </div>
          <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Status
          </div>
          <div style={{ width: 50, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Votes
          </div>
          <div style={{ width: 220, fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Actions
          </div>
        </div>

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>
              No products found
            </p>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              Try adjusting your filters or search query.
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          products.map((product) => {
            const votes = product.upvoteCount ?? product.votes ?? 0;
            return (
              <div
                key={product._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.1s",
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
                {/* Logo */}
                <MiniLogo name={product.name} logo={product.logo} />

                {/* Name + tagline */}
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
                    {product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.tagline}
                  </div>
                </div>

                {/* Category */}
                <div
                  style={{
                    width: 100,
                    fontSize: 11.5,
                    color: "var(--text-tertiary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {product.category ?? "—"}
                </div>

                {/* Status */}
                <div style={{ width: 80, flexShrink: 0 }}>
                  <StatusBadge status={product.status} />
                </div>

                {/* Votes */}
                <div
                  style={{
                    width: 50,
                    textAlign: "right",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  {votes}
                </div>

                {/* Actions */}
                <div
                  style={{
                    width: 220,
                    display: "flex",
                    gap: 5,
                    justifyContent: "flex-end",
                    flexShrink: 0,
                    flexWrap: "nowrap",
                  }}
                >
                  {/* Approve */}
                  {product.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(product._id)}
                      title="Approve"
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(34,197,94,0.12)",
                        color: "#22c55e",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: 6,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Check size={11} /> Approve
                    </button>
                  )}

                  {/* Reject */}
                  {product.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(product._id)}
                      title="Reject"
                      style={{
                        padding: "4px 10px",
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
                      ✕ Reject
                    </button>
                  )}

                  {/* Featured toggle */}
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    title={product.isFeatured ? "Unfeature" : "Feature"}
                    style={{
                      padding: "4px 8px",
                      fontSize: 13,
                      background: product.isFeatured ? "var(--accent-dim)" : "var(--bg)",
                      border: `1px solid ${product.isFeatured ? "var(--accent-border)" : "var(--border)"}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    {product.isFeatured ? "⭐" : "☆"}
                  </button>

                  {/* Verified toggle */}
                  <button
                    onClick={() => handleToggleVerified(product)}
                    title={product.isVerified ? "Unverify" : "Verify"}
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      fontWeight: 700,
                      background: product.isVerified ? "rgba(34,197,94,0.1)" : "var(--bg)",
                      color: product.isVerified ? "#22c55e" : "var(--text-tertiary)",
                      border: `1px solid ${product.isVerified ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    <Check size={12} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(product._id)}
                    title="Delete"
                    style={{
                      padding: "4px 8px",
                      fontSize: 13,
                      background: "transparent",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      lineHeight: 1,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
