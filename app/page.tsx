"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import HomePage from "@/components/home/HomePage";

export default function LandingPage() {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);

  useEffect(() => {
    if (user) router.replace("/launchpad");
  }, [user, router]);

  if (user) return null;

  return <HomePage />;
}
