"use client";
import { PageContent } from "@/components/ui/Surface";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/ui/Avatar";
import PostCard from "@/components/feed/PostCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import EmptyState from "@/components/ui/EmptyState";
import FollowListModal from "@/components/profile/FollowListModal";
import ContributionHeatmap from "@/components/profile/ContributionHeatmap";
import TrophyCase from "@/components/profile/TrophyCase";
import ProfileCompletionMeter from "@/components/profile/ProfileCompletionMeter";
import ReportModal from "@/components/ReportModal";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { renderRichText } from "@/components/ui/RichText";
import { useToast } from "@/components/ui/Toast";
import { relativeTime } from "@/lib/relativeTime";
import {
  useGetUserQuery, useToggleFollowMutation, useToggleBlockMutation, useToggleMuteMutation,
  useGetAchievementsQuery, useGetActivityQuery, OPEN_TO_LABELS,
} from "@/lib/api/usersApi";
import {
  useLazyGetUserPostsQuery, useLazyGetSavedPostsQuery, useLazyGetLikedPostsQuery, useLazyGetUserRepliesQuery,
} from "@/lib/api/postsApi";
import type { Post, ReplyItem } from "@/lib/api/postsApi";
import { useStartConversationMutation } from "@/lib/api/messagesApi";
import { useAppSelector } from "@/lib/hooks";
import {
  Globe, ChevronUp, Rocket, MessageCircle, Handshake, Camera, MoreHorizontal, Link2, VolumeX, Ban, Flag,
  CalendarDays, MapPin, Flame, Trophy, Award, Sparkles, Image as ImageIcon, Heart, MessageSquare, Briefcase,
} from "lucide-react";

type TabKey = "posts" | "replies" | "products" | "media" | "likes" | "activity" | "saved";

// One paginated list per tab. Loads its first page when the tab is first
// opened and keeps results when switching away and back.
function usePagedPosts(fetchPage: (page: number) => Promise<{ posts: Post[]; hasMore: boolean; pinned?: Post | null }>) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinned, setPinned] = useState<Post | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (next: number) => {
    if (next === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetchPage(next);
      setPosts(prev => next === 1 ? res.posts : [...prev, ...res.posts]);
      if (next === 1) setPinned(res.pinned ?? null);
      setHasMore(res.hasMore);
      setPage(next);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchPage]);

  const reset = useCallback(() => { setPosts([]); setPinned(null); setPage(0); setHasMore(true); }, []);
  return { posts, setPosts, pinned, setPinned, page, hasMore, loading, loadingMore, load, reset };
}

function PostsTab({
  state, emptyTitle, emptyDescription, emptyIcon, onPinChange, onAuthorHidden,
}: {
  state: ReturnType<typeof usePagedPosts>;
  emptyTitle: string; emptyDescription: string; emptyIcon: any;
  onPinChange?: (postId: string, pinned: boolean) => void;
  onAuthorHidden?: (username: string) => void;
}) {
  const { posts, setPosts, pinned, setPinned, hasMore, loading, loadingMore, load, page } = state;
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting && !loadingMore) load(page + 1); }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, loadingMore, load, page]);

  if (loading && posts.length === 0) {
    return <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>Loading…</div>;
  }
  if (!pinned && posts.length === 0) return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;

  const update = (p: Post) => setPosts(cur => cur.map(x => x._id === p._id ? p : x));
  const remove = (id: string) => setPosts(cur => cur.filter(x => x._id !== id));
  return (
    <div>
      {pinned && (
        <PostCard post={pinned} pinned onPinChange={onPinChange} onAuthorHidden={onAuthorHidden}
          onUpdated={p => setPinned(p)} onDeleted={() => setPinned(null)} />
      )}
      {posts.map(p => (
        <PostCard key={p._id} post={p} onUpdated={update} onDeleted={remove} onPinChange={onPinChange} onAuthorHidden={onAuthorHidden} />
      ))}
      <div ref={sentinel} style={{ height: 1 }} />
      {loadingMore && <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)" }}>Loading…</div>}
    </div>
  );
}

function RepliesTab({ username }: { username: string }) {
  const [fetchReplies] = useLazyGetUserRepliesQuery();
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async (next: number) => {
    setLoading(true);
    try {
      const res = await fetchReplies({ username, page: next, limit: 15 }).unwrap();
      setReplies(prev => next === 1 ? res.replies : [...prev, ...res.replies]);
      setHasMore(res.hasMore); setPage(next);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [username]);

  if (loading && replies.length === 0) return <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>Loading…</div>;
  if (replies.length === 0) return <EmptyState icon={MessageSquare} title="No replies yet" description="When they reply to a post, it shows up here." />;

  return (
    <div>
      {replies.map(r => (
        <Link key={r._id} href={`/post/${r.post._id}`} className="ds-row ds-row--interactive" style={{ display: "block" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Avatar src={r.post.author?.avatar} name={r.post.author?.name} size={40} />
            <div style={{ minWidth: 0, flex: 1, paddingBottom: 10, borderLeft: "2px solid var(--border)", marginLeft: -32, paddingLeft: 44 }}>
              <div className="ds-byline"><span className="ds-byline-name">{r.post.author?.name}</span><span className="ds-byline-meta">@{r.post.author?.username}</span><span className="ds-byline-time">· {relativeTime(r.post.createdAt)}</span></div>
              <p className="ds-post-text" style={{ color: "var(--text-secondary)" }}>{r.post.text ? r.post.text.slice(0, 220) : "Shared an image"}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <Avatar src={r.author.avatar} name={r.author.name} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="ds-byline"><span className="ds-byline-name">{r.author.name}</span><span className="ds-byline-meta">@{r.author.username}</span><span className="ds-byline-time">· {relativeTime(r.createdAt)}</span></div>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>Replying to <span style={{ color: "var(--accent)" }}>@{r.post.author?.username}</span></p>
              <p className="ds-post-text">{renderRichText(r.body)}</p>
            </div>
          </div>
        </Link>
      ))}
      {hasMore && (
        <button onClick={() => load(page + 1)} disabled={loading} className="ds-module-more" style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "center" }}>
          {loading ? "Loading…" : "Show more"}
        </button>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, color, value, label, title }: { icon: any; color: string; value: React.ReactNode; label: string; title?: string }) {
  return (
    <div title={title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", minWidth: 0 }}>
      <Icon size={18} style={{ color, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: "var(--font-base)", lineHeight: 1.15 }}>{value}</div>
        <div style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{label}</div>
      </div>
    </div>
  );
}

export default function FounderProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { push: pushToast } = useToast();
  const me = useAppSelector(s => s.auth.user);
  const { data, isLoading, isError, error } = useGetUserQuery(username);
  const { data: achievementsData } = useGetAchievementsQuery(username);
  const { data: activityData } = useGetActivityQuery(username);
  const [toggleFollow] = useToggleFollowMutation();
  const [toggleBlock] = useToggleBlockMutation();
  const [toggleMute] = useToggleMuteMutation();
  const [startConversation, { isLoading: startingChat }] = useStartConversationMutation();
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [following, setFollowing] = useState(false);
  const [hoverFollow, setHoverFollow] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [followListMode, setFollowListMode] = useState<"followers" | "following" | null>(null);

  const isOwnProfile = me?.username === username;

  useEffect(() => { setFollowing(!!data?.isFollowing); }, [data?.isFollowing]);

  const [fetchUserPosts] = useLazyGetUserPostsQuery();
  const [fetchSavedPosts] = useLazyGetSavedPostsQuery();
  const [fetchLikedPosts] = useLazyGetLikedPostsQuery();

  const postsState = usePagedPosts(useCallback((page: number) => fetchUserPosts({ username, page, limit: 10 }).unwrap(), [fetchUserPosts, username]));
  const mediaState = usePagedPosts(useCallback((page: number) => fetchUserPosts({ username, page, limit: 10, media: true }).unwrap(), [fetchUserPosts, username]));
  const likesState = usePagedPosts(useCallback((page: number) => fetchLikedPosts({ username, page, limit: 10 }).unwrap(), [fetchLikedPosts, username]));
  const savedState = usePagedPosts(useCallback((page: number) => fetchSavedPosts({ page, limit: 10 }).unwrap(), [fetchSavedPosts]));

  useEffect(() => {
    const map: Partial<Record<TabKey, ReturnType<typeof usePagedPosts>>> = { posts: postsState, media: mediaState, likes: likesState, saved: savedState };
    const st = map[activeTab];
    if (st && st.page === 0 && !st.loading) st.load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, username]);

  // Reloads the Posts tab so a newly (un)pinned post moves to/from the top.
  const handlePinChange = () => { postsState.reset(); postsState.load(1); };
  const handleAuthorHidden = (hidden: string) => {
    for (const st of [likesState, savedState]) st.setPosts(cur => cur.filter(p => (p.repostOf ?? p).author.username !== hidden));
  };

  const founder = data?.user;
  const products = data?.products ?? [];
  const stats = data?.stats;

  const handleMessage = async () => {
    if (!me) { router.push("/login"); return; }
    try {
      const res = await startConversation(username).unwrap();
      router.push(`/messages?c=${res.conversation._id}`);
    } catch (err: any) {
      pushToast({ title: "Can't message this founder", description: err?.data?.message });
    }
  };

  const handleFollow = async () => {
    if (!me) { router.push("/login"); return; }
    setFollowing(f => !f);
    try { await toggleFollow(username).unwrap(); } catch (err: any) {
      setFollowing(f => !f);
      pushToast({ title: "Couldn't follow", description: err?.data?.message });
    }
  };

  const copyLink = async () => {
    setMenuOpen(false);
    try { await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`); pushToast({ title: "Profile link copied" }); } catch { /* ignore */ }
  };

  const handleMute = async () => {
    setMenuOpen(false);
    const res = await toggleMute(username).unwrap().catch(() => null);
    if (res) pushToast({ title: res.muted ? `You muted @${username}` : `You unmuted @${username}` });
  };

  const handleBlock = async () => {
    setMenuOpen(false);
    if (!data?.youBlocked && !window.confirm(`Block @${username}? They won't be able to follow or message you, and you won't see their posts.`)) return;
    const res = await toggleBlock(username).unwrap().catch(() => null);
    if (res) pushToast({ title: res.blocked ? `You blocked @${username}` : `You unblocked @${username}` });
  };

  if (isLoading) return (
    <AppShell title={`@${username}`} backButton>
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="fp-skeleton" style={{ height: 200, borderRadius: 0 }} />
        <div style={{ padding: 16 }}>
          <div className="fp-skeleton" style={{ width: 120, height: 120, borderRadius: "50%", marginTop: -76, border: "4px solid var(--bg)" }} />
          <div className="fp-skeleton" style={{ width: "40%", height: 18, borderRadius: 4, margin: "16px 0 8px" }} />
          <div className="fp-skeleton" style={{ width: "25%", height: 13, borderRadius: 4, marginBottom: 16 }} />
          <div className="fp-skeleton" style={{ width: "90%", height: 13, borderRadius: 4 }} />
        </div>
      </div>
    </AppShell>
  );

  if (isError || !founder) return (
    <AppShell title="Profile" backButton>
      <div style={{ height: 200, background: "var(--bg-active)" }} />
      <PageContent style={{ textAlign: "center", color: "var(--text-secondary)" }}>
        <h2 style={{ fontSize: "var(--font-2xl)", fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          {(error as any)?.data?.message || "This account doesn't exist"}
        </h2>
        <p>Try searching for another founder.</p>
      </PageContent>
    </AppShell>
  );

  const blockedView = data?.youBlocked || data?.blockedYou;
  const achievements = achievementsData?.achievements ?? [];
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const streak = activityData?.launchStreak ?? 0;
  const joined = founder.createdAt ? new Date(founder.createdAt).toLocaleDateString([], { month: "long", year: "numeric" }) : null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "replies", label: "Replies" },
    { key: "products", label: "Products" },
    { key: "media", label: "Media" },
    { key: "activity", label: "Activity" },
    { key: "likes", label: "Likes" },
    ...(isOwnProfile ? [{ key: "saved" as TabKey, label: "Saved" }] : []),
  ];

  return (
    <AppShell title={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{founder.name}{founder.isVerified && <VerifiedBadge size={18} />}</span>} subtitle={`${(stats?.posts ?? 0).toLocaleString()} post${stats?.posts === 1 ? "" : "s"}`} backButton>
      <div>
        <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
          {/* Banner */}
          <div style={{
            position: "relative", height: 200, overflow: "hidden",
            background: founder.banner && !blockedView ? `url('${founder.banner}') center / cover` : "var(--bg-active)",
          }}>
            {(!founder.banner || blockedView) && (
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
                maskImage: "linear-gradient(to bottom, black, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
              }} />
            )}
            {isOwnProfile && (
              <button onClick={() => setEditOpen(true)} aria-label="Edit cover photo" className="ds-icon-btn"
                style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                <Camera size={18} />
              </button>
            )}
          </div>

          <div style={{ padding: "0 16px 16px", position: "relative", display: "flow-root" }}>
            {/* Actions */}
            <div style={{ position: "absolute", top: 12, right: 16, display: "flex", alignItems: "center", gap: 8 }}>
              {isOwnProfile ? (
                <>
                  <Link href="/settings" className="ds-icon-btn" style={{ border: "1px solid var(--border-hover)" }} aria-label="Settings"><MoreHorizontal size={18} /></Link>
                  <button onClick={() => setEditOpen(true)} className="ds-button ds-button--outline ds-button--sm" style={{ fontWeight: 700, paddingInline: 18 }}>
                    Edit profile
                  </button>
                </>
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setMenuOpen(o => !o)} className="ds-icon-btn" style={{ border: "1px solid var(--border-hover)" }} aria-label="More" aria-expanded={menuOpen}>
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen && (
                      <>
                        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 25 }} />
                        <div className="ds-menu" style={{ right: 0, top: 42 }}>
                          <button className="ds-menu-item" onClick={copyLink}><Link2 size={17} /> Copy link to profile</button>
                          {me && (
                            <>
                              <button className="ds-menu-item" onClick={handleMute}><VolumeX size={17} /> {data?.youMuted ? "Unmute" : "Mute"} @{username}</button>
                              <button className="ds-menu-item" onClick={handleBlock}><Ban size={17} /> {data?.youBlocked ? "Unblock" : "Block"} @{username}</button>
                              <button className="ds-menu-item" onClick={() => { setMenuOpen(false); setReportOpen(true); }}><Flag size={17} /> Report @{username}</button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {!blockedView && (
                    <button onClick={handleMessage} disabled={startingChat} className="ds-icon-btn" style={{ border: "1px solid var(--border-hover)" }} aria-label="Message">
                      <MessageCircle size={18} />
                    </button>
                  )}
                  {data?.youBlocked ? (
                    <button onClick={handleBlock} className="ds-button ds-button--sm" style={{ background: "var(--red)", color: "#fff", paddingInline: 18 }}>Blocked</button>
                  ) : !data?.blockedYou && (
                    <button
                      onClick={handleFollow}
                      onMouseEnter={() => setHoverFollow(true)}
                      onMouseLeave={() => setHoverFollow(false)}
                      className="ds-button ds-button--sm"
                      style={following
                        ? { background: hoverFollow ? "var(--red-dim)" : "transparent", color: hoverFollow ? "var(--red)" : "var(--text)", border: `1px solid ${hoverFollow ? "var(--red-border)" : "var(--border-hover)"}`, paddingInline: 18, minWidth: 104 }
                        : { background: "var(--text)", color: "var(--bg)", paddingInline: 18 }}
                    >
                      {following ? (hoverFollow ? "Unfollow" : "Following") : data?.followsYou ? "Follow back" : "Follow"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Avatar */}
            <div style={{ marginTop: -68, marginBottom: 12 }}>
              <Avatar src={blockedView ? undefined : founder.avatar} name={founder.name} size={134} style={{ border: "4px solid var(--bg)", borderRadius: "50%" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, letterSpacing: "-0.3px" }}>{founder.name}</h1>
                  {founder.isVerified && <VerifiedBadge size={20} />}
                  {founder.plan && founder.plan !== "free" && (
                    <span className="ds-chip ds-chip--accent" style={{ fontSize: "var(--font-xs)", padding: "1px 8px" }}><Sparkles size={11} /> {founder.plan === "pro" ? "Pro" : "Starter"}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                  @{founder.username}
                  {data?.followsYou && !isOwnProfile && (
                    <span style={{ fontSize: "var(--font-xs)", background: "var(--bg-active)", padding: "1px 5px", borderRadius: 4 }}>Follows you</span>
                  )}
                </div>
              </div>

              {data?.blockedYou ? (
                <div style={{ padding: "16px 0" }}>
                  <h2 style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>You’re blocked</h2>
                  <p style={{ color: "var(--text-secondary)" }}>You can’t follow or see @{founder.username}’s posts.</p>
                </div>
              ) : data?.youBlocked ? (
                <div style={{ padding: "16px 0" }}>
                  <h2 style={{ fontSize: "var(--font-2xl)", fontWeight: 800 }}>@{founder.username} is blocked</h2>
                  <p style={{ color: "var(--text-secondary)" }}>Unblock them to see their posts and profile.</p>
                </div>
              ) : (
                <>
                  {founder.headline && <p style={{ fontWeight: 600 }}>{founder.headline}</p>}
                  {founder.bio && <p style={{ lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{renderRichText(founder.bio)}</p>}

                  <div style={{ display: "flex", gap: "4px 14px", flexWrap: "wrap", alignItems: "center", fontSize: "var(--font-base)", color: "var(--text-secondary)" }}>
                    {founder.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={16} /> {founder.location}</span>}
                    {founder.website && (
                      <a href={founder.website.startsWith("http") ? founder.website : `https://${founder.website}`} target="_blank" rel="noopener noreferrer" className="ds-link"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--accent)" }}>
                        <Globe size={16} /> {founder.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                    {founder.twitter && (
                      <a href={`https://x.com/${founder.twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="ds-link" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--accent)" }}>
                        <span style={{ fontWeight: 800 }}>𝕏</span> @{founder.twitter.replace(/^@/, "")}
                      </a>
                    )}
                    {founder.linkedin && (
                      <a href={founder.linkedin.startsWith("http") ? founder.linkedin : `https://linkedin.com/in/${founder.linkedin}`} target="_blank" rel="noopener noreferrer" className="ds-link" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--accent)" }}>
                        <Briefcase size={15} /> LinkedIn
                      </a>
                    )}
                    {joined && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={16} /> Joined {joined}</span>}
                  </div>

                  {founder.openTo?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {founder.openTo.map((tag: string) => (
                        <span key={tag} className="ds-chip ds-chip--accent" style={{ fontSize: "var(--font-xs)" }}>
                          <Handshake size={11} /> Open to {OPEN_TO_LABELS[tag as keyof typeof OPEN_TO_LABELS] ?? tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 18, alignItems: "center", fontSize: "var(--font-base)", flexWrap: "wrap" }}>
                    {founder.followersHidden ? (
                      <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>Follower lists are private</span>
                    ) : (
                      <>
                        <button onClick={() => setFollowListMode("following")} className="ds-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", display: "inline-flex", gap: 4 }}>
                          <strong>{(founder.followingCount ?? founder.following?.length ?? 0).toLocaleString()}</strong>
                          <span style={{ color: "var(--text-secondary)" }}>Following</span>
                        </button>
                        <button onClick={() => setFollowListMode("followers")} className="ds-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", font: "inherit", display: "inline-flex", gap: 4 }}>
                          <strong>{(founder.followerCount ?? founder.followers?.length ?? 0).toLocaleString()}</strong>
                          <span style={{ color: "var(--text-secondary)" }}>Followers</span>
                        </button>
                      </>
                    )}
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      <strong>{products.length}</strong>
                      <span style={{ color: "var(--text-secondary)" }}>Products</span>
                    </span>
                  </div>

                  {/* Founder highlights — streak, achievements, reputation */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                    <StatPill icon={Flame} color={streak > 0 ? "#FF7A00" : "var(--text-secondary)"} value={`${streak} day${streak === 1 ? "" : "s"}`}
                      label={activityData?.activeToday ? "Streak · active today" : "Current streak"} title="Consecutive days with a post, launch or upvote" />
                    <StatPill icon={Trophy} color="var(--yellow)" value={activityData?.longestStreak ?? 0} label="Best streak" />
                    <StatPill icon={Award} color="var(--accent)" value={`${unlockedCount}/${achievements.length || 8}`} label="Achievements" />
                    <StatPill icon={ChevronUp} color="var(--green)" value={(stats?.upvotesReceived ?? 0).toLocaleString()} label="Upvotes earned" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div style={{ padding: "12px 16px 0" }}>
            <ProfileCompletionMeter
              onEdit={() => setEditOpen(true)}
              input={{
                hasAvatar: !!founder.avatar,
                hasBio: !!founder.bio,
                hasSocial: !!(founder.twitter || founder.website || founder.linkedin),
                hasOpenTo: (founder.openTo?.length ?? 0) > 0,
                hasProduct: products.length > 0,
              }}
            />
          </div>
        )}

        {!blockedView && (
          <>
            <div className="ds-sticky-tabs" style={{ overflowX: "auto", top: "var(--header-height)" }}>
              <Tabs items={tabs} active={activeTab} onChange={k => setActiveTab(k as TabKey)} />
            </div>

            {activeTab === "posts" && (
              <PostsTab state={postsState} emptyIcon={MessageSquare} onPinChange={handlePinChange} onAuthorHidden={handleAuthorHidden}
                emptyTitle={isOwnProfile ? "You haven’t posted yet" : `@${username} hasn’t posted`}
                emptyDescription={isOwnProfile ? "Share what you’re building — your first post unlocks an achievement." : "When they do, their posts show up here."} />
            )}

            {activeTab === "replies" && <RepliesTab username={username} />}

            {activeTab === "media" && (
              <PostsTab state={mediaState} emptyIcon={ImageIcon} emptyTitle="No photos yet" emptyDescription="Posts with images show up here." />
            )}

            {activeTab === "likes" && (
              <PostsTab state={likesState} emptyIcon={Heart} onAuthorHidden={handleAuthorHidden}
                emptyTitle={isOwnProfile ? "You don’t have any likes yet" : "No likes yet"} emptyDescription="Tap the heart on any post to show it some love." />
            )}

            {activeTab === "saved" && isOwnProfile && (
              <PostsTab state={savedState} emptyIcon={Rocket} onAuthorHidden={handleAuthorHidden}
                emptyTitle="Save posts for later" emptyDescription="Bookmark posts to easily find them again." />
            )}

            {activeTab === "activity" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {activityData?.hidden ? (
                  <EmptyState icon={Flame} title="Activity is private" description={`@${username} has chosen to hide their activity.`} />
                ) : (
                  <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
                    <ContributionHeatmap days={activityData?.days ?? []} launchStreak={streak} longestStreak={activityData?.longestStreak ?? 0} />
                    {activityData?.totals && (
                      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                        <span><strong style={{ color: "var(--text)" }}>{activityData.totals.post ?? 0}</strong> posts & replies</span>
                        <span><strong style={{ color: "var(--text)" }}>{activityData.totals.launch ?? 0}</strong> launches</span>
                        <span><strong style={{ color: "var(--text)" }}>{activityData.totals.upvote_given ?? 0}</strong> upvotes given</span>
                        <span style={{ marginLeft: "auto" }}>Last 12 months</span>
                      </div>
                    )}
                  </div>
                )}
                {achievements.length > 0 && <TrophyCase achievements={achievements} />}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                {products.length === 0 ? (
                  <EmptyState icon={Rocket} title="No products yet" description={isOwnProfile ? "Launch on this week’s board to earn a backlink." : "Launches will show up here."}
                    action={isOwnProfile ? <Link href="/submit" className="ds-button ds-button--secondary">Launch a product</Link> : undefined} />
                ) : products.map((p: any) => (
                  <Link key={p._id} href={`/products/${p.slug}`} className="ds-row ds-row--interactive" style={{ alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {p.logo ? <img src={p.logo} width={36} height={36} alt="" style={{ objectFit: "contain" }} /> : <Rocket size={20} style={{ color: "var(--text-secondary)" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        {p.isVerified && <VerifiedBadge size={15} title="Verified listing" />}
                        {p.isFeatured && <span className="ds-chip ds-chip--warning" style={{ fontSize: 11, padding: "0 6px" }}>Featured</span>}
                        {p.linkType === "dofollow" && <span className="ds-chip ds-chip--success" style={{ fontSize: 11, padding: "0 6px" }}>dofollow</span>}
                        {isOwnProfile && p.status !== "approved" && (
                          <span className="ds-chip ds-chip--warning" style={{ fontSize: 11, padding: "0 6px" }}>{p.status === "draft" ? "Draft" : p.status === "pending" ? "In review" : "Not live"}</span>
                        )}
                      </div>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.tagline}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontWeight: 800, flexShrink: 0 }}>
                      <ChevronUp size={16} />
                      {p.upvoteCount}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {editOpen && <EditProfileModal founder={founder} onClose={() => setEditOpen(false)} />}
      {reportOpen && <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={founder._id} label={`@${founder.username}`} />}
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
