"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useGetAdminSettingsQuery, useUpdateAdminSettingsMutation, useUpdateChallengeMutation, type PlatformSettings } from "@/lib/api/adminApi";
import { AdminPage, Panel, Select } from "@/components/admin/AdminUI";
import { Switch } from "@/components/settings/SettingsUI";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-inline" style={{ gap: 16, padding: "6px 0" }}>
      <span><span style={{ display: "block", fontWeight: 700 }}>{label}</span>{desc && <span style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>{desc}</span>}</span>
      <Switch label={label} checked={checked} onChange={onChange} />
    </label>
  );
}

export default function AdminSettingsPage() {
  const { data } = useGetAdminSettingsQuery();
  const [save, { isLoading }] = useUpdateAdminSettingsMutation();
  const [updateChallenge, { isLoading: savingChallenge }] = useUpdateChallengeMutation();
  const [draft, setDraft] = useState<PlatformSettings | null>(null);
  const [challenge, setChallenge] = useState({ theme: "", description: "" });
  const { push } = useToast();

  useEffect(() => { if (data) setDraft(structuredClone(data)); }, [data]);
  if (!draft) return <AdminPage title="Platform settings"><div className="fp-skeleton" style={{ height: 300, borderRadius: 16 }} /></AdminPage>;

  const set = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) => setDraft(d => d ? { ...d, [k]: v } : d);
  // Toggles save immediately; text fields save with the section's button.
  const saveNow = async (patch: Partial<PlatformSettings>, msg = "Settings saved") => {
    setDraft(d => d ? { ...d, ...patch } : d);
    try { await save(patch).unwrap(); push({ title: msg }); } catch (e: any) { push({ title: "Couldn't save", description: e?.data?.message }); }
  };
  const updatePlan = (i: number, patch: Partial<PlatformSettings["plans"][number]>) =>
    set("plans", draft.plans.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  return (
    <AdminPage title="Platform settings" desc="Runtime controls for the whole platform. Changes apply within seconds — no deploy needed.">
      <div className="adm-grid-2">
        <Panel title="Access">
          <div className="adm-form">
            <Toggle label="Open registration" desc="Allow new founders to create accounts." checked={draft.registrationOpen} onChange={v => saveNow({ registrationOpen: v })} />
            <Toggle label="Maintenance mode" desc="Founders can browse, but posting, messaging and other signed-in actions pause, with a banner everywhere." checked={draft.maintenanceMode} onChange={v => saveNow({ maintenanceMode: v })} />
            <label>Maintenance message<input className="ds-field" value={draft.maintenanceMessage} onChange={e => set("maintenanceMessage", e.target.value)} /></label>
            <Button size="sm" variant="outline" icon={<Save size={14} />} loading={isLoading} onClick={() => saveNow({ maintenanceMessage: draft.maintenanceMessage })}>Save message</Button>
          </div>
        </Panel>

        <Panel title="Content & features">
          <div className="adm-form">
            <Toggle label="Posting enabled" desc="Turn off to pause new posts platform-wide (admins can still post)." checked={draft.postsEnabled} onChange={v => saveNow({ postsEnabled: v })} />
            <Toggle label="Direct messages enabled" checked={draft.messagesEnabled} onChange={v => saveNow({ messagesEnabled: v })} />
            <Toggle label="Launches require approval" desc="New products wait in the Pending queue instead of going live immediately." checked={draft.launchesRequireApproval} onChange={v => saveNow({ launchesRequireApproval: v })} />
            <label>Max post length (characters)
              <input className="ds-field" type="number" min={280} max={5000} value={draft.maxPostLength} onChange={e => set("maxPostLength", Number(e.target.value))} />
            </label>
            <Button size="sm" variant="outline" icon={<Save size={14} />} onClick={() => saveNow({ maxPostLength: Math.min(5000, Math.max(280, draft.maxPostLength)) })}>Save limit</Button>
          </div>
        </Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title="Email">
          <div className="adm-form">
            <Toggle label="Notification emails" desc="Master switch. When off, only sign-in codes, security and billing emails send." checked={draft.emailNotificationsEnabled} onChange={v => saveNow({ emailNotificationsEnabled: v })} />
            <Toggle label="Launch announcement emails" desc="Email every founder (who hasn’t opted out) when a product goes live." checked={draft.productLaunchEmails} onChange={v => saveNow({ productLaunchEmails: v })} />
            <Toggle label="Sign-in alert emails" desc="Email founders on each new sign-in." checked={draft.loginAlertEmails} onChange={v => saveNow({ loginAlertEmails: v })} />
            <label>Message email delay (minutes)
              <input className="ds-field" type="number" min={0} max={120} value={draft.messageEmailDelayMinutes} onChange={e => set("messageEmailDelayMinutes", Number(e.target.value))} />
              <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-secondary)" }}>DM emails wait this long and are skipped if the message gets read in the app.</span>
            </label>
            <label>Support email<input className="ds-field" value={draft.supportEmail} onChange={e => set("supportEmail", e.target.value)} placeholder="support@onlyfounders.site" /></label>
            <Button size="sm" variant="outline" icon={<Save size={14} />} onClick={() => saveNow({ messageEmailDelayMinutes: draft.messageEmailDelayMinutes, supportEmail: draft.supportEmail })}>Save email settings</Button>
          </div>
        </Panel>

        <Panel title="Announcement bar">
          <div className="adm-form">
            <Toggle label="Show announcement" desc="A dismissible bar at the top of every app page." checked={draft.announcement.enabled} onChange={v => saveNow({ announcement: { ...draft.announcement, enabled: v } })} />
            <label>Text<input className="ds-field" value={draft.announcement.text} onChange={e => set("announcement", { ...draft.announcement, text: e.target.value })} placeholder="Launch week #12 starts Monday — get your product ready" /></label>
            <label>Link (optional)<input className="ds-field" value={draft.announcement.link} onChange={e => set("announcement", { ...draft.announcement, link: e.target.value })} placeholder="/launchpad" /></label>
            <label>Tone<Select label="Tone" value={draft.announcement.tone} onChange={v => set("announcement", { ...draft.announcement, tone: v as any })} options={[{ value: "info", label: "Info (blue)" }, { value: "success", label: "Success (green)" }, { value: "warning", label: "Warning (yellow)" }]} /></label>
            <Button size="sm" variant="outline" icon={<Save size={14} />} onClick={() => saveNow({ announcement: draft.announcement })}>Save announcement</Button>
          </div>
        </Panel>
      </div>

      <div id="plans" style={{ marginBottom: 16 }}>
        <Panel title="Plans & pricing" actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => set("plans", [...draft.plans, { id: `plan${draft.plans.length + 1}`, name: "New plan", price: 0, interval: "one_time", description: "", features: [], active: false, highlight: false }])}>Add plan</Button>
            <Button size="sm" variant="secondary" icon={<Save size={14} />} loading={isLoading} onClick={() => saveNow({ plans: draft.plans }, "Plans saved")}>Save plans</Button>
          </div>
        }>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)", marginBottom: 12 }}>
            Shown on the pricing page and in founders’ settings. Checkout amounts for Starter and Pro come from the Paddle price IDs configured on the API — keep them in sync.
          </p>
          <div className="adm-grid-3" style={{ marginBottom: 0 }}>
            {draft.plans.map((p, i) => (
              <div key={i} style={{ border: `1px solid ${p.highlight ? "var(--accent)" : "var(--border)"}`, borderRadius: 14, padding: 14 }} className="adm-form">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label>ID<input className="ds-field" value={p.id} onChange={e => updatePlan(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} disabled={["free", "starter", "pro"].includes(data?.plans[i]?.id ?? "")} /></label>
                  <label>Name<input className="ds-field" value={p.name} onChange={e => updatePlan(i, { name: e.target.value })} /></label>
                  <label>Price (USD)<input className="ds-field" type="number" step="0.01" min={0} value={p.price} onChange={e => updatePlan(i, { price: Number(e.target.value) })} /></label>
                  <label>Billing<Select label="Billing" value={p.interval} onChange={v => updatePlan(i, { interval: v })} options={[{ value: "one_time", label: "One-time" }, { value: "month", label: "Monthly" }, { value: "year", label: "Yearly" }]} /></label>
                </div>
                <label>Description<input className="ds-field" value={p.description} onChange={e => updatePlan(i, { description: e.target.value })} /></label>
                <label>Features (one per line)<textarea className="ds-field" rows={4} value={p.features.join("\n")} onChange={e => updatePlan(i, { features: e.target.value.split("\n") })} /></label>
                <label className="adm-inline">Available <Switch label="Available" checked={p.active} onChange={v => updatePlan(i, { active: v })} /></label>
                <label className="adm-inline">Highlight as recommended <Switch label="Highlight" checked={p.highlight} onChange={v => updatePlan(i, { highlight: v })} /></label>
                {!["free", "starter", "pro"].includes(p.id) && (
                  <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => set("plans", draft.plans.filter((_, idx) => idx !== i))}>Remove plan</Button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="This week’s challenge">
        <div className="adm-form">
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)" }}>The theme shown on the Launchpad for the current Monday–Sunday week.</p>
          <label>Theme<input className="ds-field" value={challenge.theme} onChange={e => setChallenge(c => ({ ...c, theme: e.target.value }))} placeholder="AI-powered tools" /></label>
          <label>Description<input className="ds-field" value={challenge.description} onChange={e => setChallenge(c => ({ ...c, description: e.target.value }))} /></label>
          <Button size="sm" variant="outline" icon={<Save size={14} />} loading={savingChallenge} disabled={!challenge.theme.trim()}
            onClick={async () => { try { await updateChallenge(challenge).unwrap(); push({ title: "Weekly challenge updated" }); } catch (e: any) { push({ title: "Couldn't save", description: e?.data?.message }); } }}>
            Save challenge
          </Button>
        </div>
      </Panel>
    </AdminPage>
  );
}
