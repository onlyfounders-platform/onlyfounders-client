"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/components/feed/PostCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import TrophyCase from "@/components/profile/TrophyCase";
import ProfileCompletionMeter from "@/components/profile/ProfileCompletionMeter";
import ContributionHeatmap from "@/components/profile/ContributionHeatmap";
import FollowListModal from "@/components/profile/FollowListModal";
import { useGetUserQuery, useToggleFollowMutation, useGetAchievementsQuery, useGetActivityQuery, OPEN_TO_LABELS } from "@/lib/api/usersApi";
import { useLazyGetUserPostsQuery, useLazyGetSavedPostsQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useStartConversationMutation } from "@/lib/api/messagesApi";
import { useAppSelector } from "@/lib/hooks";
import { BadgeCheck, Globe, ChevronUp, UserPlus, UserCheck, Rocket, Bookmark, Pencil, MessageCircle, Handshake, Camera } from "lucide-react";

function ProfilePostsList({
  posts, loading, hasMore, onLoadMore, loadingMore, emptyLabel,
}: {
  posts: Post[]; loading: boolean; hasMore: boolean; onLoadMore: () => void; loadingMore: boolean; emptyLabel: string;
}) {
  const [items, setItems] = useState(posts);
  useEffect(() => setItems(posts), [posts]);

  if (loading) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", height: 140, opacity: 0.5 }} />
    );
  }
  if (items.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
        {emptyLabel}
      </div>
    );
  }
  return (
    <div>
      {items.map(p => (
        <PostCard
          key={p._id}
          post={p}
          onUpdated={updated => setItems(cur => cur.map(x => x._id === updated._id ? updated : x))}
          onDeleted={id => setItems(cur => cur.filter(x => x._id !== id))}
        />
      ))}
      {hasMore && (
        <button onClick={onLoadMore} disabled={loadingMore} style={{
          display: "block", margin: "4px auto 12px", padding: "8px 20px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}

export default function FounderProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const me = useAppSelector(s => s.auth.user);
  const { data, isLoading, isError } = useGetUserQuery(username);
  const { data: achievementsData } = useGetAchievementsQuery(username);
  const { data: activityData } = useGetActivityQuery(username);
  const [toggleFollow] = useToggleFollowMutation();
  const [startConversation, { isLoading: startingChat }] = useStartConversationMutation();
  const [activeTab, setActiveTab] = useState("Products");
  const [following, setFollowing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [followListMode, setFollowListMode] = useState<"followers" | "following" | null>(null);

  const isOwnProfile = me?.username === username;

  useEffect(() => {
    setFollowing(!!data?.isFollowing);
  }, [data?.isFollowing]);

  const handleMessage = async () => {
    if (!me) { router.push("/login"); return; }
    try {
      const res = await startConversation(username).unwrap();
      router.push(`/messages?c=${res.conversation._id}`);
    } catch {
      // conversation start failed — user can retry the button
    }
  };

  const [fetchUserPosts] = useLazyGetUserPostsQuery();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userPostsPage, setUserPostsPage] = useState(0);
  const [userPostsHasMore, setUserPostsHasMore] = useState(true);
  const [userPostsLoading, setUserPostsLoading] = useState(false);
  const [userPostsLoadingMore, setUserPostsLoadingMore] = useState(false);

  const [fetchSavedPosts] = useLazyGetSavedPostsQuery();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedPostsPage, setSavedPostsPage] = useState(0);
  const [savedPostsHasMore, setSavedPostsHasMore] = useState(true);
  const [savedPostsLoading, setSavedPostsLoading] = useState(false);
  const [savedPostsLoadingMore, setSavedPostsLoadingMore] = useState(false);

  const loadUserPosts = async (nextPage: number) => {
    if (nextPage === 1) setUserPostsLoading(true); else setUserPostsLoadingMore(true);
    try {
      const res = await fetchUserPosts({ username, page: nextPage, limit: 10 }).unwrap();
      setUserPosts(prev => nextPage === 1 ? res.posts : [...prev, ...res.posts]);
      setUserPostsHasMore(res.hasMore);
      setUserPostsPage(nextPage);
    } finally {
      setUserPostsLoading(false);
      setUserPostsLoadingMore(false);
    }
  };

  const loadSavedPosts = async (nextPage: number) => {
    if (nextPage === 1) setSavedPostsLoading(true); else setSavedPostsLoadingMore(true);
    try {
      const res = await fetchSavedPosts({ page: nextPage, limit: 10 }).unwrap();
      setSavedPosts(prev => nextPage === 1 ? res.posts : [...prev, ...res.posts]);
      setSavedPostsHasMore(res.hasMore);
      setSavedPostsPage(nextPage);
    } finally {
      setSavedPostsLoading(false);
      setSavedPostsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Posts" && userPostsPage === 0) loadUserPosts(1);
    if (activeTab === "Saved" && isOwnProfile && savedPostsPage === 0) loadSavedPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, username]);

  const founder = data?.user;
  const products = data?.products ?? [];

  const handleFollow = async () => {
    if (!me) { window.location.href = "/login"; return; }
    setFollowing(f => !f);
    try { await toggleFollow(username).unwrap(); } catch { setFollowing(f => !f); }
  };

  if (isLoading) return (
    <AppShell title={`@${username}`}>
      <div style={{ padding: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 16 }}>
          <div className="fp-skeleton" style={{ height: 200, borderRadius: 0 }} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div className="fp-skeleton" style={{ width: 76, height: 76, borderRadius: "50%", marginTop: -48, flexShrink: 0 }} />
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div className="fp-skeleton" style={{ width: "40%", height: 16, borderRadius: 4, marginBottom: 8 }} />
                <div className="fp-skeleton" style={{ width: "25%", height: 12, borderRadius: 4 }} />
              </div>
            </div>
            <div className="fp-skeleton" style={{ width: "90%", height: 12, borderRadius: 4, marginBottom: 8 }} />
            <div className="fp-skeleton" style={{ width: "60%", height: 12, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </AppShell>
  );

  if (isError || !founder) return (
    <AppShell title={`@${username}`}>
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-secondary)" }}>Founder not found.</div>
    </AppShell>
  );

  return (
    <AppShell title={`@${founder.username}`}>
      <div style={{ padding: 24 }}>
        {/* Profile card */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          overflow: "hidden", marginBottom: 16,
        }}>
          {/* Banner */}
          <div style={{
            position: "relative", height: 200, overflow: "hidden",
            background: founder.banner
              ? `url('${founder.banner}') center / cover`
              : `
                radial-gradient(120% 140% at 15% -10%, var(--aurora-1), transparent 55%),
                radial-gradient(90% 120% at 85% 10%, var(--aurora-2), transparent 60%),
                radial-gradient(80% 100% at 50% 120%, var(--aurora-3), transparent 60%)
              `,
          }}>
            {!founder.banner && (
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
                maskImage: "linear-gradient(to bottom, black, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
              }} />
            )}
            {isOwnProfile && (
              <button
                onClick={() => setEditOpen(true)}
                style={{
                  position: "absolute", bottom: 8, right: 8,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.5)")}
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          <div style={{ padding: "0 24px 24px", position: "relative" }}>
            {!isOwnProfile && (
              <div style={{ position: "absolute", top: 60, right: 24, display: "flex", gap: 8 }}>
                <button onClick={handleFollow} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 18px", fontSize: 13, fontWeight: 600,
                  background: following ? "transparent" : "var(--accent)",
                  color: following ? "var(--text-secondary)" : "#fff",
                  border: following ? "1px solid var(--border)" : "1px solid var(--accent)",
                  borderRadius: 8, cursor: "pointer",
                }}>
                  {following
                    ? <UserCheck size={14} style={{ color: "var(--text-secondary)" }} />
                    : <UserPlus size={14} style={{ color: "#fff" }} />}
                  {following ? "Following" : "Follow"}
                </button>
                <button onClick={handleMessage} disabled={startingChat} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 18px", fontSize: 13, fontWeight: 600,
                  background: "transparent", color: "var(--text)",
                  border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer",
                  opacity: startingChat ? 0.6 : 1,
                }}>
                  <MessageCircle size={14} style={{ color: "var(--text-secondary)" }} />
                  Message
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 18, marginTop: -40, marginBottom: 10 }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  src={founder.avatar}
                  name={founder.name}
                  size={88}
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setEditOpen(true)}
                    aria-label="Edit profile"
                    style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--bg-card)", border: "none",
                      color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "var(--shadow-xs)", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-card)")}
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px" }}>{founder.name}</h1>
                  {founder.isVerified && <BadgeCheck size={18} style={{ color: "#22c55e", flexShrink: 0 }} aria-label="Verified" />}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontWeight: 600 }}>@{founder.username}</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{founder.bio || "No bio yet."}</p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {founder.twitter && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 6px", borderRadius: 20, fontSize: 12.5,
                    color: "#fafafa", fontWeight: 600, letterSpacing: "0.1px",
                    background: "radial-gradient(ellipse at 50% 50%, #000 0%, #0d0d10 10%, #1c1c20 70%, #5a5a63 100%)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}>
                    <img src="/social-icons/icons8-x.svg" alt="" width={20} height={20} style={{ flexShrink: 0 }} />
                    {founder.twitter}
                  </span>
                )}
                {founder.linkedin && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 6px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.1px",
                    color: "#fff",
                    background: "linear-gradient(135deg, #0a66c2, #084b90)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}>
                    <img src="/social-icons/icons8-linkedin.svg" alt="" width={20} height={20} style={{ flexShrink: 0 }} />
                    {founder.linkedin}
                  </span>
                )}
                {founder.website && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600,
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}>
                    <Globe size={13} style={{ color: "var(--text-tertiary)" }} />
                    {founder.website}
                  </span>
                )}
              </div>

              {founder.openTo?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {founder.openTo.map((tag: string) => (
                    <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)", fontSize: 11.5, fontWeight: 600 }}>
                      <Handshake size={11} /> Open to {OPEN_TO_LABELS[tag as keyof typeof OPEN_TO_LABELS] ?? tag}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexWrap: "wrap", padding: "10px 20px 20px" }}>
            {[
              { num: products.length, label: "Products" },
              { num: founder.reputation?.toLocaleString() ?? 0, label: "Reputation" },
              { num: founder.followers?.length ?? 0, label: "Followers", onClick: () => setFollowListMode("followers") },
              { num: founder.following?.length ?? 0, label: "Following", onClick: () => setFollowListMode("following") },
              { num: activityData?.launchStreak ?? 0, label: "Day streak" },
            ].map((stat, i) => (
              <div key={stat.label}
                onClick={stat.onClick}
                style={{
                  display: "flex", alignItems: "baseline", gap: 5,
                  padding: "2px 16px", marginLeft: i === 0 ? 0 : -1,
                  borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                  cursor: stat.onClick ? "pointer" : "default",
                }}
                onMouseEnter={e => { if (stat.onClick) (e.currentTarget.querySelector("span:first-child") as HTMLSpanElement).style.color = "var(--accent)"; }}
                onMouseLeave={e => { if (stat.onClick) (e.currentTarget.querySelector("span:first-child") as HTMLSpanElement).style.color = "var(--text)"; }}
              >
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px", color: "var(--text)", transition: "color 0.15s" }}>{stat.num}</span>
                <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completion */}
        {isOwnProfile && (
          <ProfileCompletionMeter
            input={{
              hasAvatar: !!founder.avatar,
              hasBio: !!founder.bio,
              hasSocial: !!(founder.twitter || founder.website || founder.linkedin),
              hasOpenTo: (founder.openTo?.length ?? 0) > 0,
              hasProduct: products.length > 0,
            }}
            onEdit={() => setEditOpen(true)}
          />
        )}

        {/* Achievements */}
        {achievementsData?.achievements && (
          <TrophyCase achievements={achievementsData.achievements} />
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, padding: 4, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", width: "fit-content" }}>
          {["Products", "Posts", ...(isOwnProfile ? ["Saved"] : []), "Activity"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 16px", fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "#fff" : "var(--text-secondary)",
              background: activeTab === tab ? "var(--accent)" : "transparent",
              border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
              transition: "background var(--transition-fast), color var(--transition-fast)",
            }}>
              {tab === "Saved" && <Bookmark size={13} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Products */}
        {activeTab === "Products" && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {products.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>No products launched yet</div>
            ) : products.map((p: any, i: number) => (
              <Link key={p._id} href={`/products/${p.slug}`}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 18px", borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {p.logo ? <img src={p.logo} width={30} height={30} alt="" style={{ objectFit: "contain" }} /> : <Rocket size={20} style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      {isOwnProfile && p.status !== "approved" && (
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, background: "var(--yellow-dim)", color: "var(--yellow)",
                          border: "1px solid var(--yellow-border)", padding: "1px 7px", borderRadius: 20, flexShrink: 0,
                        }}>
                          {p.status === "draft" ? "Draft" : "Not verified"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.tagline}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>
                    <ChevronUp size={14} style={{ color: "var(--text-tertiary)" }} />
                    {p.upvoteCount}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Posts */}
        {activeTab === "Posts" && (
          <ProfilePostsList
            posts={userPosts}
            loading={userPostsLoading}
            hasMore={userPostsHasMore}
            loadingMore={userPostsLoadingMore}
            onLoadMore={() => loadUserPosts(userPostsPage + 1)}
            emptyLabel="No posts yet"
          />
        )}

        {/* Saved */}
        {activeTab === "Saved" && isOwnProfile && (
          <ProfilePostsList
            posts={savedPosts}
            loading={savedPostsLoading}
            hasMore={savedPostsHasMore}
            loadingMore={savedPostsLoadingMore}
            onLoadMore={() => loadSavedPosts(savedPostsPage + 1)}
            emptyLabel="You haven't saved any posts yet"
          />
        )}

        {/* Activity */}
        {activeTab === "Activity" && (
          <ContributionHeatmap
            days={activityData?.days ?? []}
            launchStreak={activityData?.launchStreak ?? 0}
            longestStreak={activityData?.longestStreak ?? 0}
          />
        )}
      </div>

      {editOpen && (
        <EditProfileModal founder={founder} onClose={() => setEditOpen(false)} />
      )}

      {followListMode && (
        <FollowListModal
          title={followListMode === "followers" ? "Followers" : "Following"}
          founders={followListMode === "followers" ? (founder.followers ?? []) : (founder.following ?? [])}
          mode={followListMode}
          onClose={() => setFollowListMode(null)}
        />
      )}
    </AppShell>
  );
}
