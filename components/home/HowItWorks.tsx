"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Ic } from "./Icons";
import { Split } from "./Motion";
import { useNow, weekInfo } from "./hooks";

// How it works: a full-circle drum (4 steps × 3 laps) beside the real
// submit flow. The drum turns on a timer and by drag/keys, never by
// scroll. Row transforms are written imperatively each frame for smooth
// physics; the active step is React state that drives the app screens.

const STEPS = ["Paste your URL", "Add the details", "Place the badge", "Climb the board"];
const DESC = [
  "We pull your name, tagline, and logo straight from your site.",
  "Pick a category, tags, and pricing, then drop in a few screenshots.",
  "Paste one snippet on your site. Once we find it, your link is dofollow.",
  "Post about it in the feed, collect upvotes, and aim for the top 3.",
];
const ROWS = 12, ANG = 360 / ROWS, R = 158, ROWPX = 84, HOLD = 5200;

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [desc, setDesc] = useState(0);
  const [descOut, setDescOut] = useState(false);
  const [hiwUp, setHiwUp] = useState(131);
  const now = useNow(60_000);
  const week = now ? weekInfo(now) : null;

  // Step changes come from the drum's frame loop, so their side effects
  // (description cross-fade, the climbing upvote count) run from here.
  const timers = useRef<{ desc?: ReturnType<typeof setTimeout>; up?: ReturnType<typeof setInterval> }>({});
  const onStep = useCallback((i: number) => {
    const tm = timers.current;
    setActive(i);
    setDescOut(true);
    clearTimeout(tm.desc);
    tm.desc = setTimeout(() => { setDesc(i); setDescOut(false); }, 180);
    clearInterval(tm.up);
    if (i === 3) {
      let v = 131; setHiwUp(v);
      tm.up = setInterval(() => {
        v = Math.min(362, v + Math.ceil(Math.random() * 5)); setHiwUp(v);
        if (v >= 362) clearInterval(tm.up);
      }, 140);
    }
  }, []);
  useEffect(() => () => { clearTimeout(timers.current.desc); clearInterval(timers.current.up); }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = [...wrap.querySelectorAll<HTMLElement>(".wr")];
    let pos = 0, target = 0, seen = false, raf = 0, hold: ReturnType<typeof setTimeout> | undefined, step = -1;
    let drag: { y: number; p: number; moved: boolean; lastY: number; lastT: number; v: number; row: HTMLElement | null } | null = null;
    const wrapD = (d: number) => ((d % ROWS) + ROWS + ROWS / 2) % ROWS - ROWS / 2;

    const render = () => {
      rows.forEach((w, j) => {
        const a = wrapD(j - pos) * ANG, c = Math.cos((a * Math.PI) / 180);
        w.style.transform = `translateZ(${-R}px) rotateX(${-a}deg) translateZ(${R}px)`;
        w.style.opacity = c <= 0.05 ? "0" : Math.pow(c, 1.6).toFixed(3);
      });
      const row = ((Math.round(pos) % ROWS) + ROWS) % ROWS;
      rows.forEach((w, j) => w.classList.toggle("on", j === row));
      if (row % 4 !== step) { step = row % 4; onStep(step); }
    };
    const animate = (dur = 760) => {
      cancelAnimationFrame(raf);
      const from = pos, to = target, t0 = performance.now();
      if (reduce) dur = 1;
      const tick = (n: number) => {
        const k = Math.min(1, (n - t0) / dur);
        pos = from + (to - from) * (1 - Math.pow(1 - k, 4)); render();
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      clearTimeout(hold);
      if (reduce || !seen || drag) return;
      hold = setTimeout(() => go(target + 1), HOLD);
    };
    const go = (n: number, dur?: number) => { target = n; animate(dur); schedule(); };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); go(Math.round(target) + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); go(Math.round(target) - 1); }
    };
    const onDown = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      drag = { y: e.clientY, p: pos, moved: false, lastY: e.clientY, lastT: performance.now(), v: 0, row: (e.target as HTMLElement).closest(".wr") };
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) > 4) { drag.moved = true; try { wrap.setPointerCapture(e.pointerId); } catch {} wrap.classList.add("grab"); }
      if (!drag.moved) return;
      const n = performance.now(), dt = Math.max(1, n - drag.lastT);
      drag.v = 0.8 * drag.v + 0.2 * ((e.clientY - drag.lastY) / dt); drag.lastY = e.clientY; drag.lastT = n;
      pos = drag.p - dy / ROWPX; render();
    };
    const onUp = () => {
      if (!drag) return;
      const d = drag; drag = null; wrap.classList.remove("grab");
      if (d.moved) go(Math.round(pos - (d.v * 220) / ROWPX), 900);
      else if (d.row) go(target + wrapD(Number(d.row.dataset.i) - target));
      else schedule();
    };

    wrap.addEventListener("keydown", onKey);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    const io = new IntersectionObserver(es => { seen = es[0].isIntersecting; schedule(); }, { threshold: 0.4 });
    io.observe(wrap);
    render();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(hold); io.disconnect();
      wrap.removeEventListener("keydown", onKey);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, [onStep]);

  return (
    <section className="section" id="how" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="st-head">
          <div><span className="tag" data-a="blur"><i>⏱</i>How it works</span>
          <Split as="h2" className="h2" reveal="up">From URL to the Launchpad in about five minutes</Split></div>
          <p className="lede" data-a="right">This is the actual submit flow. Drag the roller to any step, or let it turn on its own.</p>
        </div>
        <div className="hiw" data-a="up">
          <div className="roll">
            <div className="wheel-wrap" ref={wrapRef} tabIndex={0} role="slider" aria-label="Launch steps. Drag, or use the arrow keys."
              aria-valuemin={1} aria-valuemax={4} aria-valuenow={active + 1} aria-valuetext={STEPS[active]}>
              <div className="wheel">
                {Array.from({ length: ROWS }, (_, j) => (
                  <div className="wr" data-i={j} key={j}><span className="n">0{(j % 4) + 1}</span><b>{STEPS[j % 4]}</b></div>
                ))}
              </div>
              <div className="sel" aria-hidden="true" />
            </div>
            <div className="roll-foot">
              <p className={`wdesc${descOut ? " out" : ""}`} aria-live="polite">{DESC[desc]}</p>
              <span className="whint" aria-hidden="true">
                <svg className="ic" viewBox="0 0 24 24"><path d="M8 9l4-4 4 4M8 15l4 4 4-4" /></svg>Drag to roll · <span>0{active + 1} / 04</span>
              </span>
            </div>
          </div>
          <div className="app xui dark" aria-hidden="true">
            <div className="app-h"><LogoMark size={30} /><b>{active === 3 ? "Launchpad" : "Submit product"}</b><span className="app-me"><img src="/home/avatars/w65.jpg" alt="" /></span></div>
            <div className={`scr${active === 0 ? " on" : ""}`}>
              <div className="sp-steps"><span className="cur"><i>1</i>Basics</span><span><i>2</i>Details</span><span><i>3</i>Media</span><span><i>4</i>Plan</span><span><i>5</i>Badge</span></div>
              <div className="sp-box q" style={{ '--q': 0 }}><div className="sp-bh"><span className="ico"><Ic n="link" /></span><b>Import from URL</b><small>Auto-fill from your website</small></div>
                <div className="sp-row"><span className="fld2">https://tinyinvoice.app<i className="caret"></i></span><span className="btn2">Fetch details</span></div>
              </div>
              <div className="sp-ok q" style={{ '--q': 1 }}>✓ Details imported successfully. Review and edit below.</div>
              <div className="sp-f q" style={{ '--q': 2 }}><label>Product name</label><span className="fld2">TinyInvoice</span></div>
              <div className="sp-f q" style={{ '--q': 3 }}><label>Tagline</label><span className="fld2">Invoices that chase late payments for you</span></div>
            </div>
            <div className={`scr${active === 1 ? " on" : ""}`}>
              <div className="sp-steps"><span className="done"><i>✓</i>Basics</span><span className="cur"><i>2</i>Details</span><span><i>3</i>Media</span><span><i>4</i>Plan</span><span><i>5</i>Badge</span></div>
              <div className="sp-f q" style={{ '--q': 0 }}><label>Category</label><div className="chips"><span className="on">Fintech</span><span>SaaS</span><span>AI</span><span>Productivity</span><span>Developer tools</span></div></div>
              <div className="sp-f q" style={{ '--q': 1 }}><label>Pricing model</label><div className="seg3"><span>Free</span><span className="on">Freemium</span><span>Paid</span><span>Open source</span></div></div>
              <div className="sp-f q" style={{ '--q': 2 }}><label>Tags</label><span className="fld2">Invoicing, Freelancers, Payments</span></div>
              <div className="sp-f q" style={{ '--q': 3 }}><label>Screenshots</label><div className="shots"><i style={{ '--g': 'linear-gradient(135deg,#7CC8F8,#1D9BF0)' }}></i><i style={{ '--g': 'linear-gradient(135deg,#1D9BF0,#0A5C91)' }}></i><i className="add">+</i></div></div>
            </div>
            <div className={`scr${active === 2 ? " on" : ""}`}>
              <div className="sp-steps"><span className="done"><i>✓</i>Basics</span><span className="done"><i>✓</i>Details</span><span className="done"><i>✓</i>Media</span><span className="done"><i>✓</i>Plan</span><span className="cur"><i>5</i>Badge</span></div>
              <h4 className="q" style={{ '--q': 0 }}>Add the OnlyFounders badge</h4>
              <p className="sp-p q" style={{ '--q': 0 }}>Paste this badge on your website to verify ownership.</p>
              <div className="sp-code q" style={{ '--q': 1 }}><div className="sp-ch"><span>Embed code</span><span className="cp">Copy</span></div><code>{'<a href="https://onlyfounders.site" data-onlyfounders-badge="verified"><img src="…/api/badge.svg" alt="Featured on OnlyFounders"></a>'}</code></div>
              <div className="sp-ver q" style={{ '--q': 2 }}><span className="fob"><Ic n="rocket" /><span><small>FEATURED ON</small><b>OnlyFounders</b></span></span><div className="verif-wrap"><span className="verif v1"><span className="sp"></span>Checking tinyinvoice.app…</span><span className="verif v2">✓ Verified · link is dofollow</span></div></div>
            </div>
            <div className={`scr${active === 3 ? " on" : ""}`}>
              <div className="lp-tabs q" style={{ '--q': 0 }}><span className="on">Weekly Launches</span><span>Leaderboard</span></div>
              <div className="lp-wk q" style={{ '--q': 0 }}><span className="ch">‹</span><span><b>{week ? `Week of ${week.range}` : "This week"}</b><em>Live week</em></span><span className="ch dim">›</span></div>
              <div className="board q" style={{ '--q': 1 }}>
                <div className="br"><span className="rk">01</span><span className="lg" style={{ background: '#7856FF' }}>PL</span><span className="nm"><b>Plotline</b><small>Productivity · Free</small></span><span className="upv">▲<br />356</span></div>
                <div className="br me"><span className="rk">02</span><span className="lg" style={{ background: '#1D9BF0' }}>TI</span><span className="nm"><b>TinyInvoice</b><small>You · launched 2m ago</small></span><span className="upv on">▲<br /><span>{hiwUp}</span></span></div>
                <div className="br"><span className="rk">03</span><span className="lg" style={{ background: '#00BA7C' }}>LM</span><span className="nm"><b>Loopmail</b><small>AI · Paid</small></span><span className="upv">▲<br />298</span></div>
              </div>
              <p className="sp-p q" style={{ '--q': 2 }}>Finish in the top 3 by Sunday to unlock Podium Finish.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
