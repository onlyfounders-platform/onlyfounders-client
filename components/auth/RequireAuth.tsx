"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

// Gate for pages that require a signed-in user. `status` starts "idle" while
// AuthSync asks the server who the session cookie belongs to — we wait for
// that to resolve before redirecting, so a logged-in user never gets bounced
// to /login during that brief window right after a hard reload.
export default function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);
  const status = useAppSelector(s => s.auth.status);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(redirectTo);
  }, [status, router, redirectTo]);

  if (status === "authenticated" && user) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <Loader2 size={22} style={{ color: "var(--text-secondary)", animation: "spin 0.8s linear infinite" }} />
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
