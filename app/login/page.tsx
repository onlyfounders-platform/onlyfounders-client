"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequestOtpMutation, useVerifyOtpMutation } from "@/lib/api/authApi";
import { Mail, ArrowLeft } from "lucide-react";
import { setCredentials } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import GuestOnly from "@/components/auth/GuestOnly";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import {
  AuthShell, ErrorBanner, FieldLabel, IconInput, PrimaryButton, Divider, FooterLink, ghostLinkStyle,
} from "@/components/auth/AuthUI";

const RESEND_COOLDOWN = 45;

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginFlow />
    </GuestOnly>
  );
}

function LoginFlow() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [requestOtp, { isLoading: sending }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      const result = await requestOtp({ email: email.trim().toLowerCase(), purpose: "login" }).unwrap();
      const code = (result as any)?.code || null;
      // Local/dev backends hand the code straight back (see auth.js) — sign
      // straight in instead of making a dev retype a code they never received.
      if (code) {
        await verify(code, email.trim().toLowerCase());
        return;
      }
      setStep("code");
      setCode("");
      setDevCode(null);
      startCooldown();
    } catch (err: any) {
      setError(err?.data?.message || err?.data?.errors?.[0]?.msg || "Couldn't send the code");
    }
  };

  const verify = async (fullCode?: string, emailOverride?: string) => {
    const value = fullCode ?? code;
    if (value.length !== 6) return;
    setError("");
    try {
      const result = await verifyOtp({ email: emailOverride ?? email.trim().toLowerCase(), purpose: "login", code: value }).unwrap();
      dispatch(setCredentials({ user: result.user }));
      router.push("/feed");
    } catch (err: any) {
      setError(err?.data?.message || "Incorrect code");
      setCode("");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={step === "email" ? "Sign in with a one-time code — no password needed" : `Enter the 6-digit code we sent to ${email}`}
    >
      {error && <ErrorBanner message={error} />}

      {step === "email" ? (
        <>
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <FieldLabel>Email address</FieldLabel>
            <IconInput icon={<Mail size={15} />} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />

            <PrimaryButton type="submit" loading={sending} loadingLabel="Sending code…">
              Send verification code
            </PrimaryButton>
          </form>

          <Divider label="Or" />
          <GoogleSignInButton onError={setError} />

          <Divider label="New here" />
          <FooterLink question="Don't have an account?" cta="Create account →" href="/register" />
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
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginBottom: 6 }}>🚀 Dev Mode: Code is ready</div>
              <div style={{
                fontSize: "var(--font-lg)",
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
              <div style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>Click to auto-fill</div>
            </div>
          )}

          <PrimaryButton onClick={() => verify()} loading={verifying} loadingLabel="Verifying…" style={{ marginTop: 22 }} disabled={code.length !== 6}>
            Verify & continue
          </PrimaryButton>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <button onClick={() => { setStep("email"); setError(""); setDevCode(null); }} style={ghostLinkStyle}>
              <ArrowLeft size={13} /> Change email
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
