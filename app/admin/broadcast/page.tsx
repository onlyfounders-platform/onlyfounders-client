"use client";
import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { useSendBroadcastMutation, useGetAdminStatsQuery } from "@/lib/api/adminApi";
import { AdminPage, Panel, Select } from "@/components/admin/AdminUI";
import { Switch } from "@/components/settings/SettingsUI";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const AUDIENCES = [
  { value: "all", label: "Every active founder" },
  { value: "plan:pro", label: "Pro founders" },
  { value: "plan:starter", label: "Starter founders" },
  { value: "verified", label: "Verified founders" },
  { value: "admins", label: "Admins only (test run)" },
];

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({ subject: "", heading: "", message: "", ctaLabel: "", ctaUrl: "", audience: "admins" });
  const [channels, setChannels] = useState({ email: true, inApp: true });
  const [send, { isLoading }] = useSendBroadcastMutation();
  const { data: stats } = useGetAdminStatsQuery();
  const { push } = useToast();
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const label = AUDIENCES.find(a => a.value === form.audience)?.label;
    if (!window.confirm(`Send "${form.subject}" to ${label}${channels.email ? " by email" : ""}${channels.email && channels.inApp ? " and" : ""}${channels.inApp ? " in-app" : ""}?`)) return;
    try {
      const res = await send({ ...form, channels }).unwrap();
      push({ title: "Broadcast queued", description: res.message });
      setForm(f => ({ ...f, subject: "", heading: "", message: "" }));
    } catch (e: any) { push({ title: "Couldn't send", description: e?.data?.message }); }
  };

  return (
    <AdminPage title="Broadcast" desc="Announce something to founders — by email (through the queue, respecting each founder’s announcement setting) and/or as an in-app notification.">
      <div className="adm-grid-2">
        <Panel title="Compose">
          <div className="adm-form">
            <label>Audience<Select label="Audience" value={form.audience} onChange={v => set("audience", v)} options={AUDIENCES} /></label>
            <label>Subject line<input className="ds-field" value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Launch week #12 is live" maxLength={120} /></label>
            <label>Heading (optional)<input className="ds-field" value={form.heading} onChange={e => set("heading", e.target.value)} placeholder="Defaults to the subject" /></label>
            <label>Message<textarea className="ds-field" rows={8} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Leave a blank line between paragraphs." /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>Button label<input className="ds-field" value={form.ctaLabel} onChange={e => set("ctaLabel", e.target.value)} placeholder="Open the board" /></label>
              <label>Button link<input className="ds-field" value={form.ctaUrl} onChange={e => set("ctaUrl", e.target.value)} placeholder="https://onlyfounders.site/launchpad" /></label>
            </div>
            <label className="adm-inline">Send as email <Switch label="Send as email" checked={channels.email} onChange={v => setChannels(c => ({ ...c, email: v }))} /></label>
            <label className="adm-inline">Show in Notifications <Switch label="Show in notifications" checked={channels.inApp} onChange={v => setChannels(c => ({ ...c, inApp: v }))} /></label>
            <Button variant="secondary" icon={<Send size={15} />} loading={isLoading} disabled={!form.subject.trim() || !form.message.trim() || (!channels.email && !channels.inApp)} onClick={submit}>
              Send broadcast
            </Button>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Tip: send to “Admins only” first to preview the real email in your inbox. {stats ? `${stats.users.total.toLocaleString()} founders on the platform.` : ""}</p>
          </div>
        </Panel>

        <Panel title="Email preview">
          <div style={{ background: "#F7F9F9", borderRadius: 12, padding: 16, color: "#0F1419" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 800 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "#1D9BF0", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>F.</span>
              OnlyFounders<span style={{ color: "#1D9BF0", marginLeft: -6 }}>.</span>
            </div>
            <div style={{ background: "#fff", border: "1px solid #EFF3F4", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 12, color: "#8B98A5", marginBottom: 8 }}>Subject: {form.subject || "Your subject line"}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{form.heading || form.subject || "Your heading"}</h3>
              {(form.message || "Your message appears here.").split(/\n{2,}/).map((para, i) => <p key={i} style={{ marginBottom: 10, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{para}</p>)}
              {form.ctaUrl && <span style={{ display: "inline-block", marginTop: 8, background: "#1D9BF0", color: "#fff", borderRadius: 999, padding: "10px 20px", fontWeight: 700 }}>{form.ctaLabel || "Open OnlyFounders"}</span>}
            </div>
            <p style={{ fontSize: 11, color: "#8B98A5", textAlign: "center", marginTop: 12 }}>Unsubscribe · Notification settings</p>
          </div>
          {channels.inApp && (
            <div style={{ marginTop: 14, display: "flex", gap: 12, padding: 12, border: "1px solid var(--border)", borderRadius: 12 }}>
              <Megaphone size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <div><strong>In-app:</strong> {form.subject || "Your subject line"}</div>
            </div>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
