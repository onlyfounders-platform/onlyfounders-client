"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft, ExternalLink, ShieldOff, ShieldCheck, BadgeCheck, Mail, LogOut, Trash2, Crown, Sparkles, Flame,
} from "lucide-react";
import {
  useGetAdminUserQuery, useUpdateUserMutation, useAdminLogoutUserMutation, useAdminEmailUserMutation, useAdminDeleteUserMutation,
} from "@/lib/api/adminApi";
import { AdminPage, KpiGrid, Kpi, Panel, StatusChip, fmtDate, money, Select } from "@/components/admin/AdminUI";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useToast } from "@/components/ui/Toast";
import { useAppSelector } from "@/lib/hooks";

type Dialog = null | "suspend" | "email" | "plan" | "delete";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useAppSelector(s => s.auth.user);
  const { push } = useToast();
  const { data, isLoading, isError } = useGetAdminUserQuery(id);
  const [update, { isLoading: saving }] = useUpdateUserMutation();
  const [logoutUser] = useAdminLogoutUserMutation();
  const [dialog, setDialog] = useState<Dialog>(null);

  if (isLoading) return <AdminPage title="Loading…"><div className="fp-skeleton" style={{ height: 240, borderRadius: 16 }} /></AdminPage>;
  if (isError || !data) return <AdminPage title="User not found"><Link href="/admin/users" className="ds-link" style={{ color: "var(--accent)" }}>Back to users</Link></AdminPage>;

  const { user: u, stats } = data;
  const isSelf = me?.id === u._id;
  const status = u.status ?? "active";

  const act = async (body: Record<string, unknown>, msg: string) => {
    try { await update({ id: u._id, ...body }).unwrap(); push({ title: msg }); } catch (err: any) { push({ title: "Action failed", description: err?.data?.message }); }
  };

  return (
    <AdminPage
      title={u.name}
      desc={<span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>@{u.username} · {u.email} <StatusChip value={status} /> <StatusChip value={u.role} /> <StatusChip value={u.subscription?.plan ?? "free"} /></span>}
      actions={
        <>
          <Link href="/admin/users" className="ds-button ds-button--outline ds-button--sm"><ArrowLeft size={14} /> All users</Link>
          <Link href={`/u/${u.username}`} target="_blank" className="ds-button ds-button--outline ds-button--sm"><ExternalLink size={14} /> Public profile</Link>
        </>
      }
    >
      {/* Account controls */}
      <Panel title="Account controls">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {status === "suspended" ? (
            <Button size="sm" variant="secondary" icon={<ShieldCheck size={15} />} loading={saving} onClick={() => act({ status: "active" }, "Account reactivated")}>Reactivate account</Button>
          ) : (
            <Button size="sm" variant="danger" icon={<ShieldOff size={15} />} disabled={isSelf} onClick={() => setDialog("suspend")}>Suspend</Button>
          )}
          {status === "deactivated" && <Button size="sm" variant="outline" onClick={() => act({ status: "active" }, "Account reactivated")}>Reactivate (founder deactivated it)</Button>}
          <Button size="sm" variant="outline" icon={<BadgeCheck size={15} />} onClick={() => act({ isVerified: !u.isVerified }, u.isVerified ? "Verification removed" : "Founder verified")}>
            {u.isVerified ? "Remove verification" : "Verify founder"}
          </Button>
          <Button size="sm" variant="outline" icon={<Sparkles size={15} />} onClick={() => setDialog("plan")}>Change plan</Button>
          <Button size="sm" variant="outline" icon={<Crown size={15} />} disabled={isSelf}
            onClick={() => { if (window.confirm(u.role === "admin" ? `Remove admin access from @${u.username}?` : `Give @${u.username} full admin access?`)) act({ role: u.role === "admin" ? "user" : "admin" }, "Role updated"); }}>
            {u.role === "admin" ? "Remove admin" : "Make admin"}
          </Button>
          <Button size="sm" variant="outline" icon={<Mail size={15} />} onClick={() => setDialog("email")}>Email founder</Button>
          <Button size="sm" variant="outline" icon={<LogOut size={15} />}
            onClick={async () => { await logoutUser(u._id).unwrap().catch(() => null); push({ title: "All sessions revoked" }); }}>Sign out everywhere</Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={15} />} disabled={isSelf} onClick={() => setDialog("delete")}>Delete permanently</Button>
        </div>
        {status === "suspended" && (
          <p style={{ marginTop: 12, color: "var(--red)", fontSize: "var(--font-sm)" }}>
            Suspended{u.suspendedUntil ? ` until ${fmtDate(u.suspendedUntil)}` : " indefinitely"}{u.suspendedReason ? ` — ${u.suspendedReason}` : ""}
          </p>
        )}
      </Panel>

      <div style={{ height: 16 }} />
      <KpiGrid>
        <Kpi label="Posts" value={stats.posts} sub={`${stats.replies} replies`} />
        <Kpi label="Products" value={stats.products} sub={`${stats.upvotesGiven} upvotes given`} />
        <Kpi label="Followers" value={stats.followers} sub={`${stats.following} following`} />
        <Kpi label="Messages sent" value={stats.messagesSent} sub={`${stats.conversations} conversations`} />
        <Kpi label="Reputation" value={u.reputation ?? 0} sub={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Flame size={12} /> {u.launchStreak ?? 0} day streak · best {u.longestStreak ?? 0}</span>} />
        <Kpi label="Total spent" value={money(stats.totalSpent)} sub={`${data.payments.length} payments`} tone={stats.totalSpent > 0 ? "good" : undefined} />
        <Kpi label="Reports against" value={stats.reportsAgainst} tone={stats.reportsAgainst > 0 ? "warn" : undefined} sub={`${stats.reportsFiled} filed by them`} />
        <Kpi label="Likes given" value={stats.likesGiven} />
      </KpiGrid>

      <div className="adm-grid-2">
        <Panel title="Profile">
          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <Avatar src={u.avatar} name={u.name} size={64} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "var(--font-lg)", display: "flex", alignItems: "center", gap: 4 }}>{u.name}{u.isVerified && <VerifiedBadge size={17} />}</div>
              <div style={{ color: "var(--text-secondary)" }}>@{u.username}</div>
              {u.bio && <p style={{ marginTop: 6 }}>{u.bio}</p>}
            </div>
          </div>
          <dl className="adm-dl">
            <dt>User ID</dt><dd style={{ fontFamily: "monospace", fontSize: 12 }}>{u._id}</dd>
            <dt>Email</dt><dd>{u.email} {u.isEmailVerified ? "· verified" : "· unverified"}</dd>
            <dt>Sign-in</dt><dd>{[u.googleId && "Google", "Email code"].filter(Boolean).join(", ")}</dd>
            <dt>Joined</dt><dd>{fmtDate(u.createdAt, true)}</dd>
            <dt>Last sign-in</dt><dd>{fmtDate(u.lastLoginAt, true)}</dd>
            <dt>Last seen</dt><dd>{fmtDate(u.lastSeenAt, true)}</dd>
            <dt>Location</dt><dd>{u.location || "—"}</dd>
            <dt>Links</dt><dd>{[u.website, u.twitter && `x.com/${u.twitter}`, u.linkedin].filter(Boolean).join(" · ") || "—"}</dd>
            <dt>Open to</dt><dd>{u.openTo?.join(", ") || "—"}</dd>
            <dt>Achievements</dt><dd>{u.unlockedAchievements?.map(a => a.key.replace(/_/g, " ")).join(", ") || "None yet"}</dd>
            <dt>Activity (all time)</dt><dd>{Object.entries(stats.activity).map(([k, n]) => `${n} ${k.replace("_", " ")}`).join(" · ") || "—"}</dd>
            <dt>Blocked / muted</dt><dd>{u.blocked.length} / {u.muted.length}</dd>
          </dl>
        </Panel>

        <Panel title="Subscription & payments">
          <dl className="adm-dl" style={{ marginBottom: 14 }}>
            <dt>Plan</dt><dd><StatusChip value={u.subscription?.plan ?? "free"} /></dd>
            <dt>Status</dt><dd>{u.subscription?.status ?? "active"}</dd>
            <dt>Source</dt><dd>{u.subscription?.source === "admin" ? "Granted by an admin" : u.subscription?.source === "payment" ? "Payment" : "—"}</dd>
            <dt>Started</dt><dd>{fmtDate(u.subscription?.startedAt)}</dd>
            <dt>Expires</dt><dd>{u.subscription?.expiresAt ? fmtDate(u.subscription.expiresAt) : "Never"}</dd>
            {u.subscription?.note && <><dt>Note</dt><dd>{u.subscription.note}</dd></>}
          </dl>
          {data.payments.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No payments.</p> : data.payments.map((p: any) => (
            <div key={p._id} className="adm-list-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{p.plan} · {money(p.amount)}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.product?.name ?? "Deleted product"} · {fmtDate(p.createdAt)}</div>
              </div>
              <StatusChip value={p.status} />
            </div>
          ))}
        </Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title={`Products (${data.products.length})`}>
          {data.products.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No products.</p> : data.products.map((p: any) => (
            <Link key={p._id} href={`/products/${p.slug}`} className="adm-list-row">
              {p.logo ? <img src={p.logo} alt="" width={30} height={30} style={{ borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)" }} /> : <span style={{ width: 30 }} />}
              <span style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.upvoteCount} ▲</span>
              <StatusChip value={p.status} /> <StatusChip value={p.plan ?? "free"} />
            </Link>
          ))}
        </Panel>
        <Panel title="Recent posts">
          {data.recentPosts.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No posts.</p> : data.recentPosts.map((p: any) => (
            <Link key={p._id} href={`/post/${p.repostOf || p._id}`} className="adm-list-row" style={{ alignItems: "flex-start" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.repostOf ? "↻ Repost" : p.text || `${p.images.length} image(s)`}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{fmtDate(p.createdAt)} · {p.likeCount} likes · {p.commentCount} replies</span>
              </span>
            </Link>
          ))}
        </Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title="Emails sent to this founder">
          {data.emails.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No emails yet.</p> : data.emails.map((e: any) => (
            <div key={e._id} className="adm-list-row">
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject || e.template}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.template} · {fmtDate(e.sentAt || e.createdAt, true)}{e.skipReason ? ` · ${e.skipReason}` : ""}{e.lastError ? ` · ${e.lastError}` : ""}</span>
              </span>
              <StatusChip value={e.status} />
            </div>
          ))}
        </Panel>
        <Panel title="Reports & admin history">
          {data.reportsAgainst.map((r: any) => (
            <div key={r._id} className="adm-list-row">
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600 }}>{r.reason} · {r.targetType}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>by @{r.reporter?.username} · {fmtDate(r.createdAt)}</span>
              </span>
              <StatusChip value={r.status} />
            </div>
          ))}
          {data.adminLogs.map((l: any) => (
            <div key={l._id} className="adm-list-row">
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block" }}>{l.summary}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.action} by @{l.admin?.username} · {fmtDate(l.createdAt, true)}</span>
              </span>
            </div>
          ))}
          {!data.reportsAgainst.length && !data.adminLogs.length && <p style={{ color: "var(--text-secondary)" }}>Nothing on record.</p>}
        </Panel>
      </div>

      {dialog === "suspend" && <SuspendDialog username={u.username} onClose={() => setDialog(null)} onConfirm={(reason, days) => { act({ status: "suspended", suspendedReason: reason, suspendedDays: days || undefined }, `@${u.username} suspended`); setDialog(null); }} />}
      {dialog === "plan" && <PlanDialog current={u.subscription?.plan ?? "free"} onClose={() => setDialog(null)} onConfirm={(plan, expiresAt, note) => { act({ subscription: { plan, expiresAt: expiresAt || undefined, note } }, `Plan changed to ${plan}`); setDialog(null); }} />}
      {dialog === "email" && <EmailDialog id={u._id} username={u.username} onClose={() => setDialog(null)} />}
      {dialog === "delete" && <DeleteDialog id={u._id} username={u.username} onClose={() => setDialog(null)} onDeleted={() => router.replace("/admin/users")} />}
    </AdminPage>
  );
}

function SuspendDialog({ username, onClose, onConfirm }: { username: string; onClose: () => void; onConfirm: (reason: string, days: number) => void }) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("0");
  return (
    <Modal open onClose={onClose} title={`Suspend @${username}`}>
      <div className="adm-form" style={{ padding: 16 }}>
        <p style={{ color: "var(--text-secondary)" }}>They’ll be signed out everywhere, hidden from feeds and search, and emailed the reason.</p>
        <label>Reason (shown to the founder)<textarea className="ds-field" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Repeated spam in replies" /></label>
        <label>Duration
          <Select label="Duration" value={days} onChange={setDays} options={[{ value: "0", label: "Until lifted manually" }, { value: "1", label: "1 day" }, { value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
        </label>
        <Button variant="danger" fullWidth onClick={() => onConfirm(reason.trim(), Number(days))}>Suspend account</Button>
      </div>
    </Modal>
  );
}

function PlanDialog({ current, onClose, onConfirm }: { current: string; onClose: () => void; onConfirm: (plan: string, expiresAt: string, note: string) => void }) {
  const [plan, setPlan] = useState(current);
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  return (
    <Modal open onClose={onClose} title="Change plan">
      <div className="adm-form" style={{ padding: 16 }}>
        <label>Plan<Select label="Plan" value={plan} onChange={setPlan} options={[{ value: "free", label: "Free" }, { value: "starter", label: "Starter" }, { value: "pro", label: "Pro" }]} /></label>
        <label>Expires (optional)<input className="ds-field" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></label>
        <label>Internal note<input className="ds-field" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Comped for beta feedback" /></label>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>Paid plans show a blue check on the founder’s profile. They’re emailed about the change.</p>
        <Button variant="primary" fullWidth onClick={() => onConfirm(plan, expiresAt, note)}>Save plan</Button>
      </div>
    </Modal>
  );
}

function EmailDialog({ id, username, onClose }: { id: string; username: string; onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [send, { isLoading }] = useAdminEmailUserMutation();
  const { push } = useToast();
  return (
    <Modal open onClose={onClose} title={`Email @${username}`} maxWidth={560}>
      <div className="adm-form" style={{ padding: 16 }}>
        <label>Subject<input className="ds-field" value={subject} onChange={e => setSubject(e.target.value)} /></label>
        <label>Message<textarea className="ds-field" rows={7} value={message} onChange={e => setMessage(e.target.value)} placeholder="Blank lines start new paragraphs." /></label>
        <Button variant="primary" fullWidth loading={isLoading} disabled={!subject.trim() || !message.trim()}
          onClick={async () => { try { await send({ id, subject, message }).unwrap(); push({ title: "Email queued" }); onClose(); } catch (e: any) { push({ title: "Couldn't send", description: e?.data?.message }); } }}>
          Send email
        </Button>
      </div>
    </Modal>
  );
}

function DeleteDialog({ id, username, onClose, onDeleted }: { id: string; username: string; onClose: () => void; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [del, { isLoading }] = useAdminDeleteUserMutation();
  const { push } = useToast();
  return (
    <Modal open onClose={onClose} title={`Delete @${username}`}>
      <div className="adm-form" style={{ padding: 16 }}>
        <p style={{ color: "var(--text-secondary)" }}>Permanently deletes the account, their posts, replies, likes, solo products and conversations. This can’t be undone — consider suspending instead.</p>
        <label>Type <strong>{username}</strong> to confirm<input className="ds-field" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="off" /></label>
        <Button variant="danger" fullWidth loading={isLoading} disabled={confirm.trim().toLowerCase() !== username}
          onClick={async () => { try { await del(id).unwrap(); push({ title: `@${username} deleted` }); onDeleted(); } catch (e: any) { push({ title: "Couldn't delete", description: e?.data?.message }); } }}>
          Delete permanently
        </Button>
      </div>
    </Modal>
  );
}
