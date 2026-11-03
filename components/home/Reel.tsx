"use client";
import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Ic } from "./Icons";
import { Split } from "./Motion";
import { clamp, easeOut, fmt, kfmt } from "./data";

// The 25-second product tour. Five scenes are laid out on a fixed 960×540
// canvas (scaled to fit) and choreographed in CSS: each timed element has
// .k plus --an (keyframe) and --t (delay), and runs once its scene gets
// .play. This component only sequences scenes and drives the live numbers,
// and it pauses whenever the player is off screen.

const SPEED = 1.6; // scene timings are authored at 1x
const REEL = [8500, 7500, 7500, 7000, 8000];
const S1_TEXT = "Just shipped TinyInvoice. Invoices that chase late payments for you 🧾";

export default function Reel() {
  const playerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = playerRef.current, screen = screenRef.current, canvas = canvasRef.current;
    if (!player || !screen || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scenes = [...canvas.querySelectorAll<HTMLElement>(".scene")];
    const $ = (id: string) => canvas.querySelector<HTMLElement>(`[data-n="${id}"]`)!;
    const set = (id: string, v: string | number) => { $(id).textContent = String(v); };
    const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

    const upd: ((t: number) => void)[] = [
      t => {
        set("s1Type", [...S1_TEXT].slice(0, Math.round(S1_TEXT.length * span(t, 700, 2500))).join(""));
        const u = Math.round(512 * easeOut(span(t, 5200, 8000)));
        set("s1Up", u); set("s1Up2", u); set("s1Rank", t > 6400 ? "#2" : "#4");
      },
      t => { const k = Math.round(13 * span(t, 600, 6500)); set("s2Count", fmt(12038 + k)); set("s2Plus", "+" + k); },
      t => {
        set("s3Like", Math.round(41 + 16 * easeOut(span(t, 2100, 5600))));
        set("s3View", kfmt(Math.round(1200 + 2700 * span(t, 500, 7000))));
        set("s3Rt", Math.round(8 + 6 * span(t, 3500, 5000)));
        set("s3Rep", 24 + Number(t > 2800) + Number(t > 3800) + Number(t > 4800));
      },
      () => {},
      t => set("s5DR", Math.round(18 + 23 * span(t, 600, 6200))),
    ];

    const ro = new ResizeObserver(() => canvas.style.setProperty("--s", String(screen.clientWidth / 960)));
    ro.observe(screen);

    let ci = 0, el = 0, inView = false, last = 0, raf = 0;
    const show = (i: number) => {
      ci = i; el = 0;
      scenes.forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.remove("play"); });
      void scenes[i].offsetWidth; // restart the scene's CSS animations
      scenes[i].classList.add("play");
      scenes[i].getAnimations?.({ subtree: true }).forEach(a => { a.playbackRate = SPEED; });
      upd[ci](el);
    };
    const loop = (ts: number) => {
      const dt = last ? Math.min(ts - last, 100) : 0; last = ts;
      if (inView && !document.hidden) {
        el += dt * SPEED;
        if (el >= REEL[ci]) show((ci + 1) % REEL.length); else upd[ci](el);
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(es => {
      inView = es[0].isIntersecting && !reduce;
      player.classList.toggle("paused", !inView);
    }, { threshold: 0.35 });
    io.observe(player);

    show(0);
    if (reduce) { el = REEL[0] - 1; upd[0](el); }
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <section className="section reel-sec" id="reel">
      <div className="wrap">
        <div className="center">
          <span className="tag dk" data-a="blur"><i><Ic n="play" f style={{ fontSize: '9px' }} /></i>Product tour</span>
          <Split as="h2" className="h2" reveal="up" style={{ color: '#fff' }}>Don&apos;t read about it. <span className="hl">Watch it happen.</span></Split>
          <p className="lede" data-a="up" style={{ '--d': 2 }}>25 seconds inside the real OnlyFounders interface. A product launches, founders follow, the post takes off, the badge turns the link dofollow, and the DR climbs.</p>
        </div>

        <div className="player" ref={playerRef} data-a="zoom" role="img" aria-label="A 24-second tour of OnlyFounders: a product launches, founders follow, the post takes off, the badge turns the link dofollow, and the DR climbs">
          <div className="screen" ref={screenRef}>
            <div className="canvas" ref={canvasRef}>

              {/* 1 · Launch */}
              <div className="scene" data-scene="0">
                <div className="sx-nav"><LogoMark size={36} /><Ic n="home" f /><Ic n="search" /><Ic n="bell" /><Ic n="mail" /><Ic n="rocket" className="r" /><Ic n="user" /></div>
                <div className="sx-col">
                  <div className="sx-tabs"><span className="on">For you</span><span>Following</span></div>
                  <div className="s1-comp k" style={{ '--an': 'of-kIn', '--t': '.2s' }}>
                    <img className="sav" src="/home/avatars/w68.jpg" alt="" />
                    <div className="b">
                      <p className="s1-text"><span data-n="s1Type"></span><i className="caret"></i></p>
                      <div className="s1-card k" style={{ '--t': '2.7s' }}><div className="pthumb" style={{ '--g': 'linear-gradient(135deg,#7CC8F8,#1D9BF0)' }}>TI</div><div className="pmeta" style={{ color: '#E7E9EA' }}><small style={{ color: '#71767B' }}>tinyinvoice.app</small><b>TinyInvoice</b><span style={{ color: '#71767B' }}>Invoices that chase late payments for you</span></div></div>
                      <div className="s1-bar"><Ic n="img" /><Ic n="gif" /><Ic n="poll" /><Ic n="cal" /><span className="s1-btn">Launch</span></div>
                    </div>
                  </div>
                  <div className="s1-post k">
                    <div className="post" style={{ '--xl': '#2F3336', '--x2': '#71767B', '--xf': '#E7E9EA', borderColor: '#2F3336' }}>
                      <img className="pav" src="/home/avatars/w68.jpg" alt="" />
                      <div className="pb">
                        <div className="ph"><b>Nadia Torres</b><Ic n="vf" f className="vf" /><span>@nadiatorres · now</span></div>
                        <p className="ptx">Just shipped TinyInvoice. Invoices that chase late payments for you 🧾</p>
                        <span className="lbadge"><Ic n="rocket" />On this week’s Launchpad · <span data-n="s1Rank">#4</span></span>
                        <div className="pcard" style={{ borderColor: '#2F3336' }}><div className="pthumb" style={{ '--g': 'linear-gradient(135deg,#7CC8F8,#1D9BF0)' }}>TI</div><div className="pmeta"><small>tinyinvoice.app</small><b>TinyInvoice</b><span className="dof">onlyfounders.site/products/tinyinvoice</span></div></div>
                        <div className="pacts"><span><Ic n="reply" />12</span><span><Ic n="rt" />8</span><span><Ic n="heart" />57</span><span className="up"><Ic n="up" f /><b data-n="s1Up">0</b></span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sbox s1-side k" style={{ '--an': 'of-kRight', '--t': '.6s' }}>
                  <h5>This week on Launchpad</h5>
                  <div className="s1-rank"><span>01</span><span>02</span><span>03</span><span>04</span></div>
                  <div className="s1-rows">
                    <div className="lrow" style={{ '--r': 0 }}><span className="lg" style={{ background: '#7856FF' }}>PL</span><b>Plotline</b><em>488</em></div>
                    <div className="lrow dn" style={{ '--r': 1 }}><span className="lg" style={{ background: '#FF7A00' }}>SF</span><b>ShipFast Docs</b><em>356</em></div>
                    <div className="lrow dn" style={{ '--r': 2 }}><span className="lg" style={{ background: '#00BA7C' }}>LM</span><b>Loopmail</b><em>298</em></div>
                    <div className="lrow me" style={{ '--r': 3 }}><span className="lg" style={{ background: '#1D9BF0' }}>TI</span><b>TinyInvoice</b><em data-n="s1Up2">0</em></div>
                  </div>
                </div>
                <div className="stoast s1-toast k"><span className="ok"><Ic n="link" /></span><span><b>Product page published</b><code>/products/tinyinvoice</code></span></div>
              </div>

              {/* 2 · Founders joining */}
              <div className="scene" data-scene="1">
                <div className="orb" style={{ width: '300px', height: '300px' }}></div><div className="orb" style={{ width: '470px', height: '470px' }}></div><div className="orb" style={{ width: '640px', height: '640px' }}></div>
                <div className="s2-core k" style={{ '--an': 'of-kPop', '--t': '.2s' }}><b data-n="s2Count">12,038</b><span>founders on OnlyFounders</span><br /><span className="chip">▲ <span data-n="s2Plus">+0</span> in the last minute</span></div>
                <div className="join-pos" style={{ left: '330px', top: '70px' }}><div className="join k" style={{ '--t': '.8s', position: 'static', transform: 'none' }}><img src="/home/avatars/m46.jpg" alt="" /><small>Daniel · Lagos</small></div></div>
                <div className="join-pos" style={{ left: '540px', top: '180px' }}><div className="join k" style={{ '--t': '1.5s', position: 'static', transform: 'none' }}><img src="/home/avatars/w12.jpg" alt="" /><small>Sofia · Madrid</small></div></div>
                <div className="join-pos" style={{ left: '560px', top: '430px' }}><div className="join k" style={{ '--t': '2.2s', position: 'static', transform: 'none' }}><img src="/home/avatars/m86.jpg" alt="" /><small>Arjun · Bengaluru</small></div></div>
                <div className="join-pos" style={{ left: '330px', top: '490px' }}><div className="join k" style={{ '--t': '2.9s', position: 'static', transform: 'none' }}><img src="/home/avatars/w90.jpg" alt="" /><small>Emma · London</small></div></div>
                <div className="join-pos" style={{ left: '130px', top: '400px' }}><div className="join k" style={{ '--t': '3.6s', position: 'static', transform: 'none' }}><img src="/home/avatars/m52.jpg" alt="" /><small>Marc · Berlin</small></div></div>
                <div className="join-pos" style={{ left: '120px', top: '170px' }}><div className="join k" style={{ '--t': '4.3s', position: 'static', transform: 'none' }}><img src="/home/avatars/w21.jpg" alt="" /><small>Yuki · Tokyo</small></div></div>
                <div className="sbox s2-who k" style={{ '--an': 'of-kRight', '--t': '.5s' }}>
                  <h5>Who to follow</h5>
                  <div className="xwho k" style={{ '--t': '1.2s' }}><img src="/home/avatars/m46.jpg" alt="" /><div><b>Daniel Okafor</b><span>Building Stackwise</span></div><span className="fol">Follow</span></div>
                  <div className="xwho k" style={{ '--t': '1.9s' }}><img src="/home/avatars/w12.jpg" alt="" /><div><b>Sofia Reyes</b><span>Building Plotline</span></div><span className="fol swap"><span className="a">Follow</span><span className="b2">Following</span></span></div>
                  <div className="xwho k" style={{ '--t': '2.6s' }}><img src="/home/avatars/m86.jpg" alt="" /><div><b>Arjun Rao</b><span>Building Formcraft</span></div><span className="fol">Follow</span></div>
                  <div className="xwho k" style={{ '--t': '3.3s' }}><img src="/home/avatars/w90.jpg" alt="" /><div><b>Emma Collins</b><span>Building Brewlog</span></div><span className="fol">Follow</span></div>
                </div>
                <div className="stoast s2-tick k"><img className="sav" style={{ width: '34px', height: '34px' }} src="/home/avatars/w12.jpg" alt="" /><span><b>Sofia Reyes joined</b><code>open to · cofounder, investment</code></span></div>
              </div>

              {/* 3 · Posting & replies */}
              <div className="scene" data-scene="2">
                <div className="sx-nav"><LogoMark size={36} /><Ic n="home" /><Ic n="search" /><Ic n="bell" /><Ic n="mail" /><Ic n="rocket" /><Ic n="user" f /></div>
                <div className="sx-col">
                  <div className="sx-tabs" style={{ gridTemplateColumns: '1fr' }}><span className="on" style={{ textAlign: 'left', paddingLeft: '18px' }}>Post</span></div>
                  <div className="s3-post k" style={{ '--an': 'of-kIn', '--t': '.1s' }}>
                    <img className="sav" src="/home/avatars/w44.jpg" alt="" />
                    <div style={{ flex: '1' }}>
                      <div className="ph"><b>Priya Mehra</b><Ic n="vf" f className="vf" /><span>@priyabuilds · 1h</span></div>
                      <p className="tx">We hit 1,000 users three weeks after launching Plotline here. Everything that worked, in one thread 🧵</p>
                      <div className="s3-acts">
                        <span><Ic n="reply" /><b data-n="s3Rep" style={{ fontWeight: 400 }}>24</b></span>
                        <span><Ic n="rt" /><b data-n="s3Rt" style={{ fontWeight: 400 }}>8</b></span>
                        <span className="heart"><Ic n="heart" /><Ic n="heart" f className="on" /><i className="burst"></i><b className="cnt" data-n="s3Like" style={{ fontWeight: 400 }}>41</b><svg className="cursor" viewBox="0 0 24 24"><path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/></svg></span>
                        <span><Ic n="views" /><b data-n="s3View" style={{ fontWeight: 400 }}>1.2K</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="reply k" style={{ '--t': '2.8s' }}><img className="sav" src="/home/avatars/m75.jpg" alt="" /><div><b>Marcus Webb</b> <span>@marcuswebb · now</span><br />The onboarding checklist idea is gold. Stealing it for ShipFast.</div></div>
                  <div className="reply k" style={{ '--t': '3.8s' }}><img className="sav" src="/home/avatars/w21.jpg" alt="" /><div><b>Yuki Tanaka</b> <span>@yuki_makes · now</span><br />Which category did you launch under? Planning mine for Tuesday.</div></div>
                  <div className="reply k" style={{ '--t': '4.8s' }}><img className="sav" src="/home/avatars/m11.jpg" alt="" /><div><b>Liam Park</b> <span>@liampark · now</span><br />Bookmarked. The DR chart at the end is wild 📈</div></div>
                </div>
                <div className="s3-notes">
                  <div className="stoast k" style={{ '--t': '2.3s' }}><span className="ok"><Ic n="heart" f /></span><span><b>Marcus and 15 others</b><code>liked your post</code></span></div>
                  <div className="stoast k" style={{ '--t': '3.5s' }}><span className="ok"><Ic n="rt" /></span><span><b>6 founders reposted</b><code>reach +2.7K</code></span></div>
                  <div className="stoast k" style={{ '--t': '5.2s' }}><span className="ok" style={{ background: 'rgba(0,186,124,.15)', color: '#00BA7C' }}><Ic n="user" /></span><span><b>+38 new followers</b><code>@priyabuilds</code></span></div>
                </div>
              </div>

              {/* 4 · Backlink */}
              <div className="scene" data-scene="3">
                <div className="sbox brw k" style={{ '--an': 'of-kIn' }}>
                  <div className="bar"><i></i><i></i><i></i><code>onlyfounders.site/products/tinyinvoice</code></div>
                  <div className="pg">
                    <div className="hd"><div className="pthumb" style={{ '--g': 'linear-gradient(135deg,#7CC8F8,#1D9BF0)' }}>TI</div><div><b>TinyInvoice</b><span>Invoices that chase late payments for you</span></div><div className="upb">▲<br />412</div></div>
                    <div className="skel" style={{ width: '96%' }}></div><div className="skel" style={{ width: '88%' }}></div><div className="skel" style={{ width: '92%' }}></div><div className="skel" style={{ width: '60%' }}></div>
                    <span className="visit">Visit TinyInvoice <Ic n="arrow" /></span>
                    <div className="skel" style={{ width: '80%', marginTop: '26px' }}></div><div className="skel" style={{ width: '70%' }}></div>
                  </div>
                  <div className="scan"></div>
                </div>
                <div className="sbox pipe k" style={{ '--an': 'of-kRight', '--t': '.3s' }}>
                  <h5>Badge verification</h5>
                  <div className="pr"><i className="st" style={{ '--t': '.9s' }}></i><span>Badge added<small>tinyinvoice.app · footer</small></span></div>
                  <div className="pr"><i className="st" style={{ '--t': '2.3s' }}></i><span>Badge found<small>checked by OnlyFounders</small></span></div>
                  <div className="pr"><i className="st" style={{ '--t': '3.7s' }}></i><span>Link set to dofollow<small>rel=&quot;nofollow&quot; removed</small></span></div>
                  <div className="pr"><i className="st" style={{ '--t': '5.1s' }}></i><span>Indexed<small>product page in sitemap</small></span></div>
                </div>
                <div className="sbox s4-code k" style={{ '--t': '3s' }}>
                  <span className="c">&lt;!-- on tinyinvoice.app --&gt;</span>{"\n"}
                  <span className="t">&lt;a</span> <span className="a">href</span>=<span className="s">&quot;https://onlyfounders.site&quot;</span>{"\n   "}
                  <span className="a">data-onlyfounders-badge</span>=<span className="s">&quot;verified&quot;</span><span className="t">&gt;</span>{"\n  "}
                  <span className="t">&lt;img</span> <span className="a">src</span>=<span className="s">&quot;/api/badge.svg&quot;</span><span className="t">&gt;</span>{"\n"}
                  <span className="t">&lt;/a&gt;</span>
                </div>
              </div>

              {/* 5 · DR */}
              <div className="scene" data-scene="4">
                <div className="sbox s5 k" style={{ '--an': 'of-kIn' }}>
                  <div className="top"><div><small>ayesha.so · Domain Rating</small><b data-n="s5DR">18</b></div><span className="plus k">+23 in 6 months</span></div>
                  <svg viewBox="0 0 790 300" width="790" height="300" aria-hidden="true">
                    <defs><linearGradient id="s5g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1D9BF0" stopOpacity=".35"/><stop offset="1" stopColor="#1D9BF0" stopOpacity="0"/></linearGradient></defs>
                    <line className="gl" x1="30" x2="790" y1="40" y2="40"/><line className="gl" x1="30" x2="790" y1="120" y2="120"/><line className="gl" x1="30" x2="790" y1="200" y2="200"/><line className="gl" x1="30" x2="790" y1="270" y2="270"/>
                    <text className="lbl" x="0" y="44">45</text><text className="lbl" x="0" y="124">30</text><text className="lbl" x="0" y="204">15</text>
                    <path className="dfill" d="M30 250 C90 246 120 240 170 232 S250 214 300 200 S390 176 440 158 S540 118 600 96 S700 68 780 54 L780 270 L30 270Z" fill="url(#s5g)"/>
                    <path className="dline" d="M30 250 C90 246 120 240 170 232 S250 214 300 200 S390 176 440 158 S540 118 600 96 S700 68 780 54" fill="none" stroke="#1D9BF0" strokeWidth="4" strokeLinecap="round"/>
                    <g className="pin k" style={{ '--t': '1.8s', transformOrigin: '170px 232px' }}><circle cx="170" cy="232" r="7" fill="#000" stroke="#1D9BF0" strokeWidth="3"/><rect x="128" y="186" width="84" height="28" rx="14" fill="#16181C" stroke="#2F3336"/><text x="170" y="205" textAnchor="middle" fill="#E7E9EA" fontSize="12" fontWeight="700" fontFamily="-apple-system,Segoe UI,sans-serif">Launch #1</text></g>
                    <g className="pin k" style={{ '--t': '3.2s', transformOrigin: '440px 158px' }}><circle cx="440" cy="158" r="7" fill="#000" stroke="#1D9BF0" strokeWidth="3"/><rect x="398" y="112" width="84" height="28" rx="14" fill="#16181C" stroke="#2F3336"/><text x="440" y="131" textAnchor="middle" fill="#E7E9EA" fontSize="12" fontWeight="700" fontFamily="-apple-system,Segoe UI,sans-serif">Launch #2</text></g>
                    <g className="pin k" style={{ '--t': '4.6s', transformOrigin: '600px 96px' }}><circle cx="600" cy="96" r="7" fill="#000" stroke="#1D9BF0" strokeWidth="3"/><rect x="530" y="50" width="140" height="28" rx="14" fill="#16181C" stroke="#2F3336"/><text x="600" y="69" textAnchor="middle" fill="#E7E9EA" fontSize="12" fontWeight="700" fontFamily="-apple-system,Segoe UI,sans-serif">Top 3 · weekly board</text></g>
                    <g className="pin k" style={{ '--t': '6.1s', transformOrigin: '780px 54px' }}><circle cx="780" cy="54" r="14" fill="#1D9BF0" opacity=".25"/><circle cx="780" cy="54" r="7" fill="#fff" stroke="#1D9BF0" strokeWidth="3"/></g>
                    <text className="lbl" x="30" y="296">Jan</text><text className="lbl" x="180" y="296">Feb</text><text className="lbl" x="330" y="296">Mar</text><text className="lbl" x="480" y="296">Apr</text><text className="lbl" x="630" y="296">May</text><text className="lbl" x="755" y="296">Jun</text>
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
