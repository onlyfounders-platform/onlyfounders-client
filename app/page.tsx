"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Leaderboard from "@/components/landing/Leaderboard";
import Showcase from "@/components/landing/Showcase";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const router = useRouter();
  const user = useAppSelector(s => s.auth.user);

  useEffect(() => {
    if (user) router.replace("/launchpad");
  }, [user, router]);

  if (user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
      <LandingNav />
      <Hero />
      <LogoMarquee />
      <Leaderboard />
      <Showcase />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}
