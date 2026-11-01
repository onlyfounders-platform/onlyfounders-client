"use client";
import DSButton from "@/components/ui/Button";
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
        border: "1px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "var(--font-sm)",
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
      background: "var(--yellow-dim)",
      color: "var(--yellow)",
      border: "1px solid var(--yellow-border)",
    },
    approved: {
      background: "var(--green-dim)",
      color: "var(--green)",
      border: "1px solid var(--green-border)",
    },
    rejected: {
      background: "var(--red-dim)",
      color: "var(--red)",
      border: "1px solid var(--red-border)",
    },
  };

  return (
    <span
      style={{
        ...((styles[status] as React.CSSProperties) ?? {}),
        fontSize: "var(--font-sm)",
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: "var(--radius-lg)",
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
      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-active)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "40%", height: 12, background: "var(--bg-active)", borderRadius: "var(--radius-sm)", marginBottom: 6 }} />
        <div style={{ width: "65%", height: 10, background: "var(--bg-active)", borderRadius: "var(--radius-sm)" }} />
      </div>
      <div style={{ width: 70, height: 22, background: "var(--bg-active)", borderRadius: "var(--radius-lg)" }} />
      <div style={{ width: 100, height: 22, background: "var(--bg-active)", borderRadius: "var(--radius-md)" }} />
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
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Products
        </h1>
        <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
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
        <div style={{ display: "flex", gap: 2, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 3 }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              style={{
                padding: "5px 14px",
                fontSize: "var(--font-sm)",
                fontWeight: status === tab.value ? 700 : 400,
                color: status === tab.value ? "var(--text)" : "var(--text-secondary)",
                background: status === tab.value ? "var(--bg-active)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-md)",
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
          className="ds-field" style={{padding: "7px 12px", minWidth: 220}}
        />

        {data && (
          <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginLeft: "auto" }}>
            {data.total} product{data.total !== 1 ? "s" : ""}
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
          <div style={{ flex: 1, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Name / Tagline
          </div>
          <div style={{ width: 100, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Category
          </div>
          <div style={{ width: 80, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Status
          </div>
          <div style={{ width: 50, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Votes
          </div>
          <div style={{ width: 220, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
            Actions
          </div>
        </div>

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>
              No products found
            </p>
            <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
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
                      fontSize: "var(--font-base)",
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
                      fontSize: "var(--font-sm)",
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
                    fontSize: "var(--font-sm)",
                    color: "var(--text-secondary)",
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
                    fontSize: "var(--font-sm)",
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
                        fontSize: "var(--font-sm)",
                        fontWeight: 600,
                        background: "var(--green-dim)",
                        color: "var(--green)",
                        border: "1px solid var(--green-border)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Check size={11} /> Approve
                    </button>
                  )}

                  {/* Reject */}
                  {product.status !== "rejected" && (
                    <DSButton
                      onClick={() => handleReject(product._id)}
                      title="Reject"
                      variant="outline" style={{whiteSpace: "nowrap"}}
                    >
                      ✕ Reject
                    </DSButton>
                  )}

                  {/* Featured toggle */}
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    title={product.isFeatured ? "Unfeature" : "Feature"}
                    style={{
                      padding: "4px 8px",
                      fontSize: "var(--font-base)",
                      background: product.isFeatured ? "var(--accent-dim)" : "var(--bg)",
                      border: `1px solid ${product.isFeatured ? "var(--accent-border)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
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
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                      background: product.isVerified ? "var(--green-dim)" : "var(--bg)",
                      color: product.isVerified ? "var(--green)" : "var(--text-secondary)",
                      border: `1px solid ${product.isVerified ? "var(--green-border)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
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
                      fontSize: "var(--font-base)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
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
    </div>
  );
}
