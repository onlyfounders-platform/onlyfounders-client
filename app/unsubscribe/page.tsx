"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailX, CheckCircle2 } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useUnsubscribeQuery } from "@/lib/api/usersApi";

function UnsubscribeInner() {
  const params = useSearchParams();
  const u = params.get("u") ?? "", c = params.get("c") ?? "", t = params.get("t") ?? "";
  const { data, error, isLoading } = useUnsubscribeQuery({ u, c, t }, { skip: !u || !c || !t });
  const ok = !!data;
  return (
    <div style={{ textAlign: "center" }}>
      {isLoading ? <p style={{ color: "#536471" }}>Updating your preferences…</p> : (
        <>
          {ok ? <CheckCircle2 size={40} color="#00BA7C" /> : <MailX size={40} color="#F91880" />}
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "16px 0 8px", color: "#0F1419" }}>{ok ? "You’re unsubscribed" : "This link didn’t work"}</h1>
          <p style={{ color: "#536471", lineHeight: 1.5 }}>{ok ? data.message : (error as any)?.data?.message || "The unsubscribe link is missing or invalid."}</p>
          <Link href="/settings/notifications" style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", borderRadius: 999, background: "#0F1419", color: "#fff", fontWeight: 700 }}>
            Manage all email settings
          </Link>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F7F9F9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", border: "1px solid #EFF3F4", borderRadius: 20, padding: "32px 28px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><Logo size={34} /></div>
        <Suspense fallback={null}><UnsubscribeInner /></Suspense>
      </div>
    </main>
  );
}
