"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCreateReportMutation, type ReportReason } from "@/lib/api/platformApi";

const REASONS: { key: ReportReason; label: string; hint: string }[] = [
  { key: "spam", label: "Spam", hint: "Fake engagement, scams, repetitive or misleading links" },
  { key: "harassment", label: "Abuse and harassment", hint: "Insults, threats, targeted harassment" },
  { key: "hate", label: "Hateful conduct", hint: "Attacks based on identity or protected traits" },
  { key: "misinformation", label: "Misleading information", hint: "False claims about a product, funding or a person" },
  { key: "impersonation", label: "Impersonation", hint: "Pretending to be someone or a company" },
  { key: "scam", label: "Fraud or scam", hint: "Phishing, fake products, payment scams" },
  { key: "nsfw", label: "Sensitive or explicit media", hint: "Graphic or adult content" },
  { key: "other", label: "Something else", hint: "Tell us what's going on" },
];

export default function ReportModal({
  open, onClose, targetType, targetId, label,
}: {
  open: boolean; onClose: () => void; targetType: "post" | "user" | "product" | "comment"; targetId: string; label: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [createReport, { isLoading }] = useCreateReportMutation();
  const { push } = useToast();

  const submit = async () => {
    if (!reason) return;
    try {
      const res = await createReport({ targetType, targetId, reason, details }).unwrap();
      push({ title: "Report sent", description: res.message });
      setReason(null); setDetails("");
      onClose();
    } catch (err: any) {
      push({ title: "Couldn't send report", description: err?.data?.message || "Try again in a moment." });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Report ${label}`} maxWidth={520}>
      <div style={{ padding: "0 0 16px" }}>
        <p style={{ padding: "0 16px 12px", color: "var(--text-secondary)" }}>What type of issue are you reporting?</p>
        <div role="radiogroup">
          {REASONS.map(r => (
            <label key={r.key} className="ds-choice-row">
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700 }}>{r.label}</span>
                <span style={{ display: "block", fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>{r.hint}</span>
              </span>
              <input type="radio" name="report-reason" checked={reason === r.key} onChange={() => setReason(r.key)} className="ds-radio" />
            </label>
          ))}
        </div>
        {reason && (
          <div style={{ padding: "12px 16px 0" }}>
            <textarea className="ds-field" rows={3} maxLength={1000} placeholder="Add details (optional)" value={details} onChange={e => setDetails(e.target.value)} aria-label="Report details" />
          </div>
        )}
        <div style={{ padding: "16px 16px 0" }}>
          <Button variant="primary" fullWidth disabled={!reason} loading={isLoading} onClick={submit}>Submit report</Button>
        </div>
      </div>
    </Modal>
  );
}
