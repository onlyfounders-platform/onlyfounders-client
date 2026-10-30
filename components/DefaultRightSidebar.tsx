"use client";
import Link from "next/link";
import { useGetLeaderboardQuery, useSearchUsersQuery, OPEN_TO_LABELS } from "@/lib/api/usersApi";
import { useGetProductsQuery } from "@/lib/api/productsApi";
import { useAppSelector } from "@/lib/hooks";
import { ProductLogo } from "@/components/ProductCard";
import Avatar from "@/components/ui/Avatar";
import { Link2, ChevronRight, Handshake } from "lucide-react";
export default function DefaultRightSidebar() {
  const { data: foundersData } = useGetLeaderboardQuery(undefined);
  const { data: topData } = useGetProductsQuery({ period: "today" });
  const { data: openToCofounderData } = useSearchUsersQuery({ openTo: "cofounder" });
  const user = useAppSelector(s => s.auth.user);
  const topBuilders = foundersData?.users?.slice(0, 5) ?? [];
  const trending = topData?.products?.slice(0, 3) ?? [];
  const openToCollab = (openToCofounderData?.users ?? []).filter(u => u.username !== user?.username).slice(0, 4);

  return (
    <>
      {/* Submit CTA for guests */}
      {!user && (
        <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5, color: "var(--accent)" }}>Launch your product</div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
            Join 4,200+ founders building in public. Free to list.
          </p>
          <Link href="/register" style={{ display: "block", textAlign: "center", padding: "7px", background: "var(--accent)", color: "#fff", borderRadius: 7, fontSize: 12.5, fontWeight: 700 }}>
            Get started free
          </Link>
        </div>
      )}

      {/* Trending today */}
      {trending.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Trending today</span>
            <Link href="/launchpad" style={{ fontSize: 11, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 2 }}>See all <ChevronRight size={11} /></Link>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {trending.map((p: any, i: number) => (
              <Link key={p._id} href={`/products/${p.slug}`}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderBottom: i < trending.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <ProductLogo name={p.name} logo={p.logo} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{p.upvoteCount ?? 0} upvotes</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top builders */}
      {topBuilders.length > 0 && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Top builders</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {topBuilders.map((f: any, i: number) => (
              <Link key={f._id} href={`/u/${f.username}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <span style={{ fontSize: 11, color: i < 3 ? "var(--accent)" : "var(--text-tertiary)", fontWeight: 700, minWidth: 14, textAlign: "center" }}>{i + 1}</span>
                  <Avatar src={f.avatar} name={f.name} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{f.reputation?.toLocaleString()} rep</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Founders looking for a co-founder */}
      {openToCollab.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Open to co-founding</span>
            <Link href="/search?tab=people" style={{ fontSize: 11, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 2 }}>See all <ChevronRight size={11} /></Link>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {openToCollab.map((f, i) => (
              <Link key={f._id} href={`/u/${f.username}`}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderBottom: i < openToCollab.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <Avatar src={f.avatar} name={f.name} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 3 }}>
                      <Handshake size={10} /> {OPEN_TO_LABELS.cofounder}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Badge promo */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)", padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
          <Link2 size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
          Earn a dofollow link
        </div>
        <p style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 10 }}>
          Embed our badge on your site and get a free dofollow backlink.
        </p>
        <Link href="/pricing" style={{ display: "block", textAlign: "center", padding: "7px", background: "var(--accent)", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700 }}>
          Learn more
        </Link>
      </div>

    </>
  );
}
