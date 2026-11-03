"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Mail, Lock, Download, HeartCrack, Trash2, User as UserIcon } from "lucide-react";
import { SettingsPage, ActionRow, GroupTitle, InfoRow, FormBlock } from "@/components/settings/SettingsUI";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch } from "@/lib/hooks";
import { logout, updateUser } from "@/lib/slices/authSlice";
import { disconnectSocket } from "@/lib/socket";
import {
  useGetSettingsQuery, useChangeUsernameMutation, useChangePasswordMutation, useRequestEmailChangeMutation,
  useVerifyEmailChangeMutation, useDeactivateAccountMutation, useDeleteAccountMutation,
} from "@/lib/api/usersApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
type Dialog = null | "username" | "email" | "password" | "deactivate" | "delete";

export default function AccountSettingsPage() {
  const { data } = useGetSettingsQuery();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [exporting, setExporting] = useState(false);
  const { push } = useToast();
  const acc = data?.account;

  const downloadArchive = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/users/me/export`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `onlyfounders-${acc?.username}-archive.json`;
      a.click();
      URL.revokeObjectURL(url);
      push({ title: "Your archive is downloading" });
    } catch {
      push({ title: "Couldn't prepare your archive", description: "Try again in a moment." });
    } finally {
      setExporting(false);
    }
  };

  return (
    <SettingsPage title="Your account" intro="See information about your account, download an archive of your data, or learn about your account deactivation options.">
      <GroupTitle>Account information</GroupTitle>
      <InfoRow label="Name" value={acc?.name ?? "…"} href={acc ? `/u/${acc.username}` : undefined} />
      <ActionRow icon={AtSign} title="Username" desc={acc ? `@${acc.username}` : "…"} onClick={() => setDialog("username")} />
      <ActionRow icon={Mail} title="Email" desc={acc ? `${acc.email}${acc.isEmailVerified ? " · verified" : ""}` : "…"} onClick={() => setDialog("email")} />
      <ActionRow icon={Lock} title={acc?.hasPassword ? "Change your password" : "Set a password"} desc={acc?.hasPassword ? "Change your password at any time." : "You sign in with an email code or Google. Add a password as another way in."} onClick={() => setDialog("password")} />
      <InfoRow label="Account created" value={acc ? new Date(acc.createdAt).toLocaleString([], { dateStyle: "long", timeStyle: "short" }) : "…"} />
      {acc?.lastLoginAt && <InfoRow label="Last sign-in" value={new Date(acc.lastLoginAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} />}
      <InfoRow label="Sign-in methods" value={[acc?.googleLinked && "Google", acc?.hasPassword && "Password", "Email code"].filter(Boolean).join(" · ")} />

      <GroupTitle>Your data</GroupTitle>
      <ActionRow icon={Download} title={exporting ? "Preparing archive…" : "Download an archive of your data"} desc="Get a JSON file with your profile, posts, replies, likes, products, upvotes and messages." onClick={downloadArchive} disabled={exporting} />

      <GroupTitle>Deactivate or delete</GroupTitle>
      <ActionRow icon={HeartCrack} title="Deactivate your account" desc="Hide your profile and posts. Sign in again any time to reactivate." onClick={() => setDialog("deactivate")} danger />
      <ActionRow icon={Trash2} title="Delete your account permanently" desc="Removes your profile, posts, products and messages. This can’t be undone." onClick={() => setDialog("delete")} danger />

      {acc && dialog === "username" && <UsernameDialog current={acc.username} onClose={() => setDialog(null)} />}
      {acc && dialog === "email" && <EmailDialog current={acc.email} onClose={() => setDialog(null)} />}
      {acc && dialog === "password" && <PasswordDialog hasPassword={acc.hasPassword} onClose={() => setDialog(null)} />}
      {acc && (dialog === "deactivate" || dialog === "delete") && <CloseAccountDialog mode={dialog} username={acc.username} onClose={() => setDialog(null)} />}
    </SettingsPage>
  );
}

function ErrorText({ children }: { children?: string }) {
  return children ? <p role="alert" className="ds-error" style={{ fontSize: "var(--font-sm)" }}>{children}</p> : null;
}

function UsernameDialog({ current, onClose }: { current: string; onClose: () => void }) {
  const [value, setValue] = useState(current);
  const [error, setError] = useState("");
  const [change, { isLoading }] = useChangeUsernameMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { push } = useToast();
  const save = async () => {
    setError("");
    try {
      const res = await change(value.trim().toLowerCase()).unwrap();
      dispatch(updateUser({ username: res.username }));
      push({ title: "Username updated", description: `You’re now @${res.username}` });
      onClose();
      router.refresh();
    } catch (err: any) { setError(err?.data?.message || "Couldn't update username"); }
  };
  return (
    <Modal open onClose={onClose} title="Change username">
      <FormBlock>
        <label className="ds-label" htmlFor="un">Username</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 13, color: "var(--text-secondary)" }}>@</span>
          <input id="un" className="ds-field" style={{ paddingLeft: 28 }} value={value} maxLength={20} onChange={e => setValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} autoFocus />
        </div>
        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>3–20 characters. Letters, numbers and underscores. Your old profile link stops working.</p>
        <ErrorText>{error}</ErrorText>
        <Button variant="primary" fullWidth loading={isLoading} disabled={value.length < 3 || value === current} onClick={save}>Save</Button>
      </FormBlock>
    </Modal>
  );
}

function EmailDialog({ current, onClose }: { current: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [request, { isLoading: requesting }] = useRequestEmailChangeMutation();
  const [verify, { isLoading: verifying }] = useVerifyEmailChangeMutation();
  const dispatch = useAppDispatch();
  const { push } = useToast();

  const send = async () => {
    setError("");
    try {
      const res = await request(email.trim()).unwrap();
      if (res.code) setCode(res.code); // dev only: the API hands the code back outside production
      setStep("code");
    } catch (err: any) { setError(err?.data?.message || "Couldn't send a code"); }
  };
  const confirm = async () => {
    setError("");
    try {
      const res = await verify({ email: email.trim(), code: code.trim() }).unwrap();
      dispatch(updateUser({ email: res.email }));
      push({ title: "Email updated", description: `We’ll now email ${res.email}` });
      onClose();
    } catch (err: any) { setError(err?.data?.message || "Couldn't verify the code"); }
  };

  return (
    <Modal open onClose={onClose} title="Change email">
      <FormBlock>
        {step === "email" ? (
          <>
            <p style={{ color: "var(--text-secondary)" }}>Current: <strong style={{ color: "var(--text)" }}>{current}</strong>. We’ll send a 6-digit code to the new address.</p>
            <input className="ds-field" type="email" placeholder="New email address" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            <ErrorText>{error}</ErrorText>
            <Button variant="primary" fullWidth loading={requesting} disabled={!/^\S+@\S+\.\S+$/.test(email)} onClick={send}>Send code</Button>
          </>
        ) : (
          <>
            <p style={{ color: "var(--text-secondary)" }}>Enter the code we sent to <strong style={{ color: "var(--text)" }}>{email}</strong>.</p>
            <input className="ds-field" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
            <ErrorText>{error}</ErrorText>
            <Button variant="primary" fullWidth loading={verifying} disabled={code.length !== 6} onClick={confirm}>Verify and update</Button>
            <button className="ds-link" onClick={() => setStep("email")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer" }}>Use a different email</button>
          </>
        )}
      </FormBlock>
    </Modal>
  );
}

function PasswordDialog({ hasPassword, onClose }: { hasPassword: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [change, { isLoading }] = useChangePasswordMutation();
  const { push } = useToast();
  const save = async () => {
    setError("");
    if (next !== confirm) { setError("Passwords don't match"); return; }
    try {
      await change({ currentPassword: hasPassword ? current : undefined, newPassword: next }).unwrap();
      push({ title: hasPassword ? "Password changed" : "Password set" });
      onClose();
    } catch (err: any) { setError(err?.data?.message || "Couldn't update password"); }
  };
  return (
    <Modal open onClose={onClose} title={hasPassword ? "Change your password" : "Set a password"}>
      <FormBlock>
        {hasPassword && <input className="ds-field" type="password" autoComplete="current-password" placeholder="Current password" value={current} onChange={e => setCurrent(e.target.value)} />}
        <input className="ds-field" type="password" autoComplete="new-password" placeholder="New password (8+ characters)" value={next} onChange={e => setNext(e.target.value)} />
        <input className="ds-field" type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <ErrorText>{error}</ErrorText>
        <Button variant="primary" fullWidth loading={isLoading} disabled={next.length < 8 || (hasPassword && !current)} onClick={save}>Save</Button>
      </FormBlock>
    </Modal>
  );
}

function CloseAccountDialog({ mode, username, onClose }: { mode: "deactivate" | "delete"; username: string; onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [deactivate, { isLoading: deactivating }] = useDeactivateAccountMutation();
  const [del, { isLoading: deleting }] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const go = async () => {
    setError("");
    try {
      if (mode === "deactivate") await deactivate().unwrap();
      else await del(confirm.trim()).unwrap();
      disconnectSocket();
      dispatch(logout());
      router.replace(mode === "deactivate" ? "/login?deactivated=1" : "/");
    } catch (err: any) { setError(err?.data?.message || "Something went wrong"); }
  };

  return (
    <Modal open onClose={onClose} title={mode === "deactivate" ? "Deactivate account" : "Delete account"}>
      <FormBlock>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <UserIcon size={20} style={{ color: "var(--red)", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {mode === "deactivate"
              ? "Your profile, posts and products will be hidden from everyone. Your data is kept, and signing in again reactivates your account instantly."
              : "This permanently deletes @" + username + ", your posts, replies, likes, products you launched alone, and your messages. Nobody can restore it."}
          </p>
        </div>
        {mode === "delete" && (
          <>
            <label className="ds-label" htmlFor="confirm-del">Type <strong>{username}</strong> to confirm</label>
            <input id="confirm-del" className="ds-field" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="off" />
          </>
        )}
        <ErrorText>{error}</ErrorText>
        <Button variant="danger" fullWidth loading={deactivating || deleting} disabled={mode === "delete" && confirm.trim().toLowerCase() !== username} onClick={go}>
          {mode === "deactivate" ? "Deactivate" : "Delete permanently"}
        </Button>
        <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
      </FormBlock>
    </Modal>
  );
}
