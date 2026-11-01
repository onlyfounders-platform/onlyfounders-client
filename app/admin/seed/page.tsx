"use client";
import { useState } from "react";
import { useGetSeedPreviewQuery, SeedPreviewProduct } from "@/lib/api/adminApi";

function AvatarInitials({ name, size = 32 }: { name: string; size?: number }) {
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
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-dim)",
        color: "var(--accent)",
        border: "1px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size <= 24 ? 9 : 11,
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
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
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 16px",
        fontSize: "var(--font-base)",
        fontWeight: 700,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: active ? "var(--accent-dim)" : "var(--bg-card)",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        borderColor: active ? "var(--accent-border)" : "var(--border)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ProductRow({ product }: { product: SeedPreviewProduct }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {product.logo ? (
        <img src={product.logo} alt={product.name} style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
      ) : (
        <AvatarInitials name={product.name} size={36} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontSize: "var(--font-base)", fontWeight: 700 }}>{product.name}</span>
          {product.isFeatured && (
            <span style={{ fontSize: "var(--font-xs)", fontWeight: 700, padding: "1px 7px", borderRadius: "var(--radius-lg)", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
              featured
            </span>
          )}
          {product.isVerified && (
            <span style={{ fontSize: "var(--font-xs)", fontWeight: 700, padding: "1px 7px", borderRadius: "var(--radius-lg)", background: "var(--bg-active)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              verified
            </span>
          )}
          <span style={{ fontSize: "var(--font-xs)", fontWeight: 600, padding: "1px 7px", borderRadius: "var(--radius-lg)", background: "var(--bg-active)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
            {product.category}
          </span>
        </div>
        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: 6 }}>{product.tagline}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {product.maker && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {product.maker.avatar ? (
                <img src={product.maker.avatar} alt={product.maker.name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />
              ) : (
                <AvatarInitials name={product.maker.name} size={18} />
              )}
              <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                by {product.maker.name} · @{product.maker.username}
              </span>
            </div>
          )}
          <a
            href={product.website}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "var(--font-sm)", color: "var(--accent)", textDecoration: "none" }}
          >
            {product.website.replace(/^https?:\/\//, "")}
          </a>
        </div>
      </div>

      <div style={{ width: 90, flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text-secondary)" }}>▲ {product.upvoteCount ?? 0}</div>
        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{product.commentCount ?? 0} comments</div>
      </div>
    </div>
  );
}

export default function AdminSeedPage() {
  const { data, isLoading } = useGetSeedPreviewQuery();
  const users = data?.users ?? [];
  const products = data?.products ?? [];
  const [tab, setTab] = useState<"users" | "products">("users");

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Seed
        </h1>
        <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
          The {users.length || 50} demo accounts and {products.length || "—"} products defined in <code>seed.js</code> —
          a reference list only. This page never touches the database; running the actual seed script wipes and
          recreates all users, products, comments, and upvotes, so it stays a manual{" "}
          <code>node src/seed.js</code> command.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Users ({users.length || 50})
        </TabButton>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products ({products.length || "—"})
        </TabButton>
      </div>

      {tab === "users" && (
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
            <div style={{ minWidth: 640 }}>
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
                <div style={{ width: 190, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Email
                </div>
                <div style={{ width: 70, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>
                  Rep
                </div>
                <div style={{ width: 160, fontSize: "var(--font-sm)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Badges
                </div>
              </div>

              {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

              {!isLoading && users.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", fontWeight: 600 }}>
                    No seed users found
                  </p>
                </div>
              )}

              {!isLoading &&
                users.map((user) => (
                  <div
                    key={user.email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "1px solid var(--border)" }} />
                    ) : (
                      <AvatarInitials name={user.name} />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "var(--font-base)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.name}
                        </span>
                        {user.role === "admin" && (
                          <span style={{ fontSize: "var(--font-xs)", fontWeight: 700, padding: "1px 7px", borderRadius: "var(--radius-lg)", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                            admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>@{user.username}</div>
                    </div>

                    <div style={{ width: 190, fontSize: "var(--font-sm)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {user.email}
                    </div>

                    <div style={{ width: 70, textAlign: "right", fontSize: "var(--font-sm)", fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>
                      {(user.reputation ?? 0).toLocaleString()}
                    </div>

                    <div style={{ width: 160, display: "flex", flexWrap: "wrap", gap: 4, flexShrink: 0 }}>
                      {(user.badges ?? []).map((b) => (
                        <span key={b} style={{ fontSize: "var(--font-xs)", fontWeight: 600, padding: "2px 7px", borderRadius: "var(--radius-lg)", background: "var(--bg-active)", color: "var(--text-secondary)", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

          {!isLoading && products.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)", fontWeight: 600 }}>
                No seed products found
              </p>
            </div>
          )}

          {!isLoading && products.map((product) => <ProductRow key={product.name} product={product} />)}
        </div>
      )}
    </div>
  );
}
