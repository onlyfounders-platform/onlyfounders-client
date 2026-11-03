"use client";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import { isEmail } from "./data";
import { dhm, useNow, weekInfo } from "./hooks";

// Footer: brand, three link columns, the live board countdown with a
// newsletter signup, and the oversized fading wordmark.
// TODO: point the newsletter form at the real subscribe endpoint.

const COLS = [
  { h: "Product", links: [["#reel", "Product tour"], ["#platform", "Platform"], ["#calculator", "DR calculator"], ["#pricing", "Pricing"]] },
  { h: "Community", links: [["/launchpad", "This week’s Launchpad"], ["/launchpad?view=leaderboard", "Leaderboard"], ["/feed", "Feed"], ["/search", "Explore founders"]] },
  { h: "Company", links: [["#", "About"], ["#", "Changelog"], ["#", "Privacy"], ["#", "Terms"]] },
];
const SOCIAL = [["X", "𝕏"], ["LinkedIn", "in"], ["Discord", "dc"], ["YouTube", "yt"]];

export default function HomeFooter() {
  const now = useNow(1000);
  const week = now ? weekInfo(now) : null;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="pt-20 pb-8">
      <div className="wrap">
        <div className="grid grid-cols-[1.5fr_repeat(3,1fr)_1.4fr] gap-8 max-[1100px]:grid-cols-3 max-[620px]:grid-cols-2" data-a="up">
          <div className="max-[1100px]:col-span-full">
            <a href="#top" aria-label="OnlyFounders home" className="flex w-fit rounded-xl"><Logo size={32} /></a>
            <p className="mt-3.5 max-w-[30ch] text-[14.5px] text-of-ink-2">The social network for founders, with a weekly Launchpad and links that keep paying off. Built for founders, by founders.</p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map(([label, glyph]) => (
                <a key={label} href="#" aria-label={label} className="grid size-[38px] place-items-center rounded-full border border-of-line-2 text-[12.5px] font-bold text-of-ink-2 transition hover:-translate-y-0.5 hover:border-of-ac hover:text-of-ac">{glyph}</a>
              ))}
            </div>
          </div>

          {COLS.map(c => (
            <div key={c.h}>
              <h4 className="mb-3.5 text-[13.5px] font-semibold">{c.h}</h4>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[14.5px] text-of-ink-2">
                {c.links.map(([href, label]) => <li key={label}><a href={href} className="transition-colors hover:text-of-ac">{label}</a></li>)}
              </ul>
            </div>
          ))}

          <div className="rounded-[22px] border border-of-line bg-of-bg-2 p-[18px] max-[1100px]:col-span-full">
            <b className="text-[14px]">This week’s board closes in</b>
            <div className="mt-0.5 font-of-display text-[30px] font-bold tracking-[-.03em] tabular-nums">{week ? dhm(week.left) : "--:--:--"}</div>
            <p className="text-[13px] text-of-ink-2">Get the best launches in the weekly newsletter.</p>
            {subscribed ? (
              <p className="mt-3 text-[13px] font-semibold text-of-good-ink">✓ You’re on the list.</p>
            ) : (
              <form noValidate onSubmit={e => { e.preventDefault(); if (isEmail(email)) setSubscribed(true); }}
                className="mt-3 flex gap-1.5 rounded-full border border-of-line-2 bg-white p-1 focus-within:border-of-ac">
                <label htmlFor="ftEmail" className="sr-only">Email</label>
                <input id="ftEmail" type="email" placeholder="you@startup.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-of-ink outline-none" />
                <button type="submit" className="rounded-full bg-of-ink px-[13px] py-[7px] text-[13px] font-semibold text-white">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-of-line pt-6 text-[13px] text-of-ink-3">
          <span>© {new Date().getFullYear()} OnlyFounders. All rights reserved.</span>
          <span>Made for people who ship.</span>
        </div>
        <div aria-hidden="true" className="mt-12 bg-[linear-gradient(180deg,#E6EAEC,rgba(255,255,255,0))] bg-clip-text text-center font-of-display text-[clamp(64px,15.5vw,214px)] leading-[.8] font-extrabold tracking-[-.065em] whitespace-nowrap text-transparent select-none">
          OnlyFounders
        </div>
      </div>
    </footer>
  );
}
