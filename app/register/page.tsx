"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequestOtpMutation, useVerifyOtpMutation } from "@/lib/api/authApi";
import { User, AtSign, Mail, Sparkles, ArrowLeft } from "lucide-react";
import { setCredentials } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import GuestOnly from "@/components/auth/GuestOnly";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import {
  AuthShell, ErrorBanner, FieldLabel, IconInput, PrimaryButton, Divider, FooterLink, ghostLinkStyle,
} from "@/components/auth/AuthUI";

const RESEND_COOLDOWN = 45;

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterFlow />
    </GuestOnly>
  );
}

function RegisterFlow() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [requestOtp, { isLoading: sending }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  const [step, setStep] = useState<"details" | "code">("details");
  const [form, setForm] = useState({ name: "", username: "", email: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1 && timerRef.current) clearInterval(timerRef.current);
        return Math.max(0, c - 1);
      });
    }, 1000);
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    try {
      const result = await requestOtp({
        email: form.email.trim().toLowerCase(),
        purpose: "register",
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
      }).unwrap();
      setStep("code");
      setCode("");
      setDevCode((result as any)?.code || null);
      startCooldown();
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.errors?.[0]?.msg || "Couldn't send the code");
    }
  };

  const verify = async (fullCode?: string) => {
    const value = fullCode ?? code;
    if (value.length !== 6) return;
    setError("");
    try {
      const result = await verifyOtp({ email: form.email.trim().toLowerCase(), purpose: "register", code: value }).unwrap();
      dispatch(setCredentials({ user: result.user }));
      router.push("/feed");
    } catch (err: any) {
      setError(err?.data?.message || "Incorrect code");
      setCode("");
    }
  };

  return (
    <AuthShell
      badge="Join the community"
      badgeIcon={<Sparkles size={12} />}
      title="Create your account"
      subtitle={step === "details" ? "Connect with founders, launch products, find your co-founder" : `Enter the 6-digit code we sent to ${form.email}`}
    >
      {error && <ErrorBanner message={error} />}

      {step === "details" ? (
        <>
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <FieldLabel>Full name</FieldLabel>
            <IconInput icon={<User size={15} />} value={form.name} onChange={v => update("name", v)} placeholder="Marc Reid" autoFocus />

            <FieldLabel>Username</FieldLabel>
            <IconInput icon={<AtSign size={15} />} value={form.username} onChange={v => update("username", v.toLowerCase().replace(/[^a-z0-9]/g, ""))} placeholder="marcreid" />

            <FieldLabel>Email address</FieldLabel>
            <IconInput icon={<Mail size={15} />} type="email" value={form.email} onChange={v => update("email", v)} placeholder="you@example.com" />

            <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.6, margin: "-6px 0 0 0" }}>
              By joining you agree to our{" "}
              <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Terms</a> and{" "}
              <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Privacy Policy</a>.
            </p>

            <PrimaryButton type="submit" loading={sending} loadingLabel="Sending code…">
              Send verification code
            </PrimaryButton>
          </form>

          <Divider label="Or" />
          <GoogleSignInButton onError={setError} />

          <Divider label="Existing user" />
          <FooterLink question="Already a member?" cta="Sign in →" href="/login" />
        </>
      ) : (
        <>
          <OtpCodeInput value={code} onChange={setCode} onComplete={verify} disabled={verifying} error={!!error} />

          {devCode && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              borderRadius: 8,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>🚀 Dev Mode: Code is ready</div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "4px",
                color: "var(--accent)",
                fontFamily: "monospace",
                marginBottom: 8,
                cursor: "pointer",
              }}
              onClick={() => setCode(devCode)}
              title="Click to auto-fill">
                {devCode}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Click to auto-fill</div>
            </div>
          )}

          <PrimaryButton onClick={() => verify()} loading={verifying} loadingLabel="Creating account…" style={{ marginTop: 22 }} disabled={code.length !== 6}>
            Verify & create account
          </PrimaryButton>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <button onClick={() => { setStep("details"); setError(""); setDevCode(null); }} style={ghostLinkStyle}>
              <ArrowLeft size={13} /> Edit details
            </button>
            <button onClick={() => sendCode()} disabled={cooldown > 0 || sending} style={{ ...ghostLinkStyle, opacity: cooldown > 0 ? 0.5 : 1 }}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </>
      )}
    </AuthShell>
  );
}
