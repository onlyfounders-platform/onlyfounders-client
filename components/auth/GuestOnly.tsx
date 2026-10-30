"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";

// Gate for pages that only make sense for signed-out visitors (login,
// register). An already-authenticated user is redirected away immediately —
// they never get a usable login/signup form to interact with.
export default function GuestOnly({
  children,
  redirectTo = "/feed",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);
  const status = useAppSelector(s => s.auth.status);

  useEffect(() => {
    if (status === "authenticated" && user) router.replace(redirectTo);
  }, [status, user, router, redirectTo]);

  if (status === "authenticated" && user) return null;

  return <>{children}</>;
}
