"use client";
import { PageContent } from "@/components/ui/Surface";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/components/feed/PostCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import EmptyState from "@/components/ui/EmptyState";
import FollowListModal from "@/components/profile/FollowListModal";
import { useGetUserQuery, useToggleFollowMutation, OPEN_TO_LABELS } from "@/lib/api/usersApi";
import { useLazyGetUserPostsQuery, useLazyGetSavedPostsQuery } from "@/lib/api/postsApi";
import type { Post } from "@/lib/api/postsApi";
import { useStartConversationMutation } from "@/lib/api/messagesApi";
import { useAppSelector } from "@/lib/hooks";
import { BadgeCheck, Globe, ChevronUp, Rocket, MessageCircle, Handshake, Camera } from "lucide-react";

function ProfilePostsList({
  posts, loading, hasMore, onLoadMore, loadingMore, emptyLabel,
}: {
  posts: Post[]; loading: boolean; hasMore: boolean; onLoadMore: () => void; loadingMore: boolean; emptyLabel: string;
}) {
  const [items, setItems] = useState(posts);
  useEffect(() => setItems(posts), [posts]);

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", height: 140, opacity: 0.5 }} />
    );
  }
  if (items.length === 0) {
    return (
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: "var(--font-base)" }}>
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
          display: "block", margin: "4px auto 12px", padding: "8px 20px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)",
          fontSize: "var(--font-base)", fontWeight: 600, cursor: "pointer",
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
      <div>
        <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", overflow: "hidden", marginBottom: 0 }}>
          <div className="fp-skeleton" style={{ height: 180, borderRadius: 0 }} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div className="fp-skeleton" style={{ width: 76, height: 76, borderRadius: "50%", marginTop: -48, flexShrink: 0 }} />
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div className="fp-skeleton" style={{ width: "40%", height: 16, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
                <div className="fp-skeleton" style={{ width: "25%", height: 12, borderRadius: "var(--radius-sm)" }} />
              </div>
            </div>
            <div className="fp-skeleton" style={{ width: "90%", height: 12, borderRadius: "var(--radius-sm)", marginBottom: 8 }} />
            <div className="fp-skeleton" style={{ width: "60%", height: 12, borderRadius: "var(--radius-sm)" }} />
          </div>
        </div>
      </div>
    </AppShell>
  );

  if (isError || !founder) return (
    <AppShell title={`@${username}`}>
      <PageContent style={{textAlign: "center", color: "var(--text-secondary)"}}>Founder not found.</PageContent>
    </AppShell>
  );

  return (
    <AppShell
      title={founder.name}
      subtitle={`${userPosts.length} posts`}
      backButton
    >
      <div>
        {/* Profile card */}
        <div style={{
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
          overflow: "hidden", marginBottom: 0,
        }}>
          {/* Banner */}
          <div style={{
            position: "relative", height: 200, overflow: "hidden",
            background: founder.banner
              ? `url('${founder.banner}') center / cover`
              : "var(--bg-active)",
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
                aria-label="Edit cover photo"
                style={{
                  position: "absolute", bottom: 12, right: 12,
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.8)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.6)")}
              >
                <Camera size={18} />
              </button>
            )}
          </div>

          <div style={{ padding: "0 16px 16px", position: "relative" }}>
            {/* Action buttons (top right under banner) */}
            <div style={{ position: "absolute", top: 12, right: 16, display: "flex", alignItems: "center", gap: 10 }}>
              {isOwnProfile ? (
                <button
                  onClick={() => setEditOpen(true)}
                  className="ds-button ds-button--outline ds-button--sm"
                  style={{ fontWeight: 700, paddingInline: 18 }}
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMessage}
                    disabled={startingChat}
                    className="ds-icon-btn"
                    style={{ border: "1px solid var(--border-hover)" }}
                    aria-label="Message"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={handleFollow}
                    style={{
                      padding: "7px 20px",
                      fontSize: "var(--font-base)",
                      fontWeight: 700,
                      borderRadius: "var(--radius-full)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      ...(following
                        ? {
                            background: "transparent",
                            color: "var(--text)",
                            border: "1px solid var(--border-hover)",
                          }
                        : {
                            background: "var(--text)",
                            color: "var(--bg)",
                            border: "1px solid var(--text)",
                          }),
                    }}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                </>
              )}
            </div>

            {/* Overlapping Avatar */}
            <div style={{ display: "flex", gap: 18, marginTop: -60, marginBottom: 12 }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  src={founder.avatar}
                  name={founder.name}
                  size={120}
                  style={{ border: "4px solid var(--bg)", borderRadius: "50%" }}
                />
              </div>
            </div>

            {/* Name, handle, bio */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.4px" }}>{founder.name}</h1>
                  {founder.isVerified && <BadgeCheck size={18} style={{ color: "var(--green)", flexShrink: 0 }} aria-label="Verified" />}
                </div>
                <div style={{ fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>@{founder.username}</div>
                {founder.bio && (
                  <p style={{ fontSize: "var(--font-base)", color: "var(--text)", lineHeight: 1.45, marginTop: 6 }}>{founder.bio}</p>
                )}
              </div>

              {/* Socials & Meta */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                {founder.website && (
                  <a
                    href={founder.website.startsWith("http") ? founder.website : `https://${founder.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--accent)" }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >
                    <Globe size={15} />
                    {founder.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {founder.twitter && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontWeight: 700 }}>X:</span> @{founder.twitter.replace(/^@/, "")}
                  </span>
                )}
                {founder.linkedin && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontWeight: 700 }}>in:</span> {founder.linkedin}
                  </span>
                )}
              </div>

              {founder.openTo?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {founder.openTo.map((tag: string) => (
                    <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)", fontSize: "var(--font-xs)", fontWeight: 600 }}>
                      <Handshake size={11} /> Open to {OPEN_TO_LABELS[tag as keyof typeof OPEN_TO_LABELS] ?? tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Following & Followers row */}
              <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 4, fontSize: "var(--font-base)" }}>
                <span
                  onClick={() => setFollowListMode("following")}
                  style={{ cursor: "pointer", display: "inline-flex", gap: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >
                  <strong style={{ color: "var(--text)" }}>{founder.following?.length ?? 0}</strong>
                  <span style={{ color: "var(--text-secondary)" }}>Following</span>
                </span>
                <span
                  onClick={() => setFollowListMode("followers")}
                  style={{ cursor: "pointer", display: "inline-flex", gap: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >
                  <strong style={{ color: "var(--text)" }}>{founder.followers?.length ?? 0}</strong>
                  <span style={{ color: "var(--text-secondary)" }}>Followers</span>
                </span>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  <strong style={{ color: "var(--text)" }}>{products.length}</strong>
                  <span style={{ color: "var(--text-secondary)" }}>Products</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ds-sticky-tabs">
          <Tabs
            items={["Products", "Posts", ...(isOwnProfile ? ["Saved"] : [])].map(label => ({ key: label, label }))}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
        {/* Products */}
        {activeTab === "Products" && (
          <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
            {products.length === 0 ? (
              <EmptyState icon={Rocket} title="No products yet" description="Launches will show up here." />
            ) : products.map((p: any, i: number) => (
              <Link key={p._id} href={`/products/${p.slug}`}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 18px", borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {p.logo ? <img src={p.logo} width={30} height={30} alt="" style={{ objectFit: "contain" }} /> : <Rocket size={20} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: "var(--font-base)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      {isOwnProfile && p.status !== "approved" && (
                        <span style={{
                          fontSize: "var(--font-xs)", fontWeight: 700, background: "var(--yellow-dim)", color: "var(--yellow)",
                          border: "1px solid var(--yellow-border)", padding: "1px 7px", borderRadius: "var(--radius-lg)", flexShrink: 0,
                        }}>
                          {p.status === "draft" ? "Draft" : "Not verified"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.tagline}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>
                    <ChevronUp size={14} style={{ color: "var(--text-secondary)" }} />
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
