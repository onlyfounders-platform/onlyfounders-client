"use client";
import { useEffect, useRef } from "react";
import "./home.css";
import { IconSprite } from "./Icons";
import { useReveal } from "./Motion";
import HomeNav from "./HomeNav";
import Hero from "./Hero";
import Trust from "./Trust";
import Problem from "./Problem";
import Reel from "./Reel";
import Platform from "./Platform";
import Calculator from "./Calculator";
import HowItWorks from "./HowItWorks";
import Stories from "./Stories";
import Pricing from "./Pricing";
import Faq from "./Faq";
import LaunchPass from "./LaunchPass";
import HomeFooter from "./HomeFooter";

// The public home page (/). Light editorial canvas with one cinematic
// "lights out" reel band; every product shot is a replica of the real app.
// Section order builds the case: problem → proof in motion → platform →
// your own numbers → how → social proof → price → doubts → claim a spot.

const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400..700&family=Geist+Mono:wght@400..600&display=swap";

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  // in-page anchors (#reel, #pricing …) glide instead of jumping
  useEffect(() => {
    const html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => { html.style.scrollBehavior = prev; };
  }, []);

  return (
    <div className="of-home" ref={root}>
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <IconSprite />
      <HomeNav />
      <Hero />
      <Trust />
      <Problem />
      <Reel />
      <Platform />
      <Calculator />
      <HowItWorks />
      <Stories />
      <Pricing />
      <Faq />
      <LaunchPass />
      <HomeFooter />
    </div>
  );
}
