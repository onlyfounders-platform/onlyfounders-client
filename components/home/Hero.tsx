"use client";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Ic } from "./Icons";
import { Split } from "./Motion";
import { FEED, PEOPLE, av, fmt, type FeedPost } from "./data";
import { useNow, useReducedMotion, useUpvotes, weekInfo } from "./hooks";

// Hero: headline + a live replica of the real app (lights out by default).
// New founder posts arrive every few seconds and likes tick up, but only
// while the replica is on screen.

type Live = FeedPost & { id: number; likes: number; liked: boolean; bump: number; enter: boolean };
const live = (p: FeedPost, id: number, enter = false): Live => ({ ...p, id, likes: p.lk, liked: false, bump: 0, enter });

function Post({ p }: { p: Live }) {
  const who = PEOPLE[p.u];
  return (
    <article className={`post${p.enter ? " enter" : ""}`}>
      <img className="pav" src={av(who.av)} alt="" />
      <div className="pb">
        <div className="ph"><b>{who.name}</b><span>@{who.handle} · {p.t}</span><span className="more">···</span></div>
        <p className="ptx">{p.x}</p>
        {p.img && (
          <div className="pimg" style={{ "--g": p.img.g }}><div><b>{p.img.n}</b><small>{p.img.t}</small></div></div>
        )}
        <div className="pacts">
          <span><Ic n="msg" />{p.r}</span>
          <span><Ic n="rt" />{p.rt}</span>
          <span className={`lk${p.liked ? " on" : ""}`}><Ic n="heart" /><b key={p.bump} className={p.bump ? "bump" : undefined} style={{ fontWeight: 400 }}>{fmt(p.likes)}</b></span>
          <span><Ic n="bm" /></span>
          <span><Ic n="share" /></span>
        </div>
      </div>
    </article>
  );
}

function FollowButton() {
  const [on, setOn] = useState(false);
  return <button className={`fol${on ? " on" : ""}`} type="button" onClick={() => setOn(v => !v)}>{on ? "Following" : "Follow"}</button>;
}

export default function Hero() {
  const reduced = useReducedMotion();
  const now = useNow(60_000);
  const upvotes = useUpvotes();
  const stageRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(true);
  const [posts, setPosts] = useState<Live[]>(() => FEED.slice(0, 4).map((p, i) => live(p, i)));
  const [pill, setPill] = useState<string[] | null>(null);
  const [notif, setNotif] = useState(3);

  useEffect(() => {
    if (reduced) return;
    const el = stageRef.current;
    let visible = true, next = 4, uid = 100;
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; });
    if (el) io.observe(el);
    const timers: ReturnType<typeof setTimeout>[] = [];

    const push = setInterval(() => {
      if (!visible || document.hidden) return;
      const d = FEED[next % FEED.length]; next++;
      setPill([PEOPLE[d.u].av, PEOPLE[FEED[next % FEED.length].u].av]);
      timers.push(setTimeout(() => {
        setPill(null);
        setPosts(ps => [live(d, uid++, true), ...ps.map(p => ({ ...p, enter: false }))].slice(0, 5));
        setNotif(n => (n % 9) + 1);
      }, 1100));
    }, 4600);

    const like = setInterval(() => {
      if (!visible || document.hidden) return;
      setPosts(ps => {
        const k = Math.floor(Math.random() * Math.min(3, ps.length));
        return ps.map((p, i) => i === k ? { ...p, likes: p.likes + 1 + Math.floor(Math.random() * 3), liked: true, bump: p.bump + 1 } : p);
      });
    }, 1300);

    return () => { io.disconnect(); clearInterval(push); clearInterval(like); timers.forEach(clearTimeout); };
  }, [reduced]);

  const week = now ? weekInfo(now) : null;

  return (
    <section className="hero" id="top">
      <div className="atmos" aria-hidden="true"><div className="glow g1" /><div className="glow g2" /><div className="glow g3" /><div className="streaks" /></div>
      <div className="wrap">
        <div className="hero-copy">
          <a href="#reel" className="announce" data-a="blur">
            <span className="nw">Live</span>
            <span className="tx max-[620px]:max-w-[200px] max-[620px]:truncate">{week ? `Launchpad · week of ${week.range} is live` : "This week's Launchpad is open"}</span>
            <span className="go"><Ic n="arrow" style={{ fontSize: 12 }} /></span>
          </a>
          <Split as="h1" className="h1" reveal="up">
            Launch once. Watch your DR{" "}
            <span className="swoosh">
              <span className="hl">compound.</span>
              <svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 22 C 70 6, 150 4, 296 14" fill="none" stroke="#1D9BF0" strokeWidth="5" strokeLinecap="round" opacity=".35" /></svg>
            </span>
          </Split>
          <p className="hero-sub" data-a="up" style={{ "--d": 3 }}>The social network for founders, built like X, with a weekly Launchpad on top. Post what you&apos;re building, launch it to people who ship, and turn your listing into a permanent dofollow backlink.</p>
          <div className="hero-cta" data-a="up" style={{ "--d": 4 }}>
            <a href="/register" className="btn btn-ac">Launch your product free</a>
            <a href="#reel" className="btn btn-paper"><span className="playi"><Ic n="play" f style={{ fontSize: 9 }} /></span>Watch the 25-second tour</a>
          </div>
          <div className="proof" data-a="up" style={{ "--d": 5 }}>
            <div className="faces">{["w44", "m32", "w68", "m75", "w21"].map(k => <img key={k} src={av(k)} alt="" />)}</div>
            <div><b style={{ color: "var(--ink)" }}>12,000+ founders</b> already posting here</div>
          </div>
        </div>

        <div className="stage" ref={stageRef}>
          <div className="disp" data-a="up" style={{ "--d": 6 }}>
            <div className="seg2" role="group" aria-label="Dashboard display">
              <span>Display</span>
              <button type="button" aria-pressed={!dark} onClick={() => setDark(false)}>Light</button>
              <button type="button" aria-pressed={dark} onClick={() => setDark(true)}>Lights out</button>
            </div>
          </div>

          <div className="fade" data-a="up" style={{ "--d": 7 }}>
            <div className="frame">
              <div className={`xapp xui${dark ? " dark" : ""}`} role="img" aria-label="The OnlyFounders home feed: X-style navigation, a For you timeline with new founder posts arriving live, and a right rail with trending launches">
                <aside className="xnav">
                  <div className="xbrand"><LogoMark size={34} /><span className="t">OnlyFounders.</span></div>
                  <div className="xni on"><Ic n="home" f /><span className="t">Home</span></div>
                  <div className="xni"><Ic n="search" /><span className="t">Explore</span></div>
                  <div className="xni"><span className="iw"><Ic n="bell" /><span className="badge">{notif}</span></span><span className="t">Notifications</span></div>
                  <div className="xni"><span className="iw"><Ic n="msg" /><span className="badge">2</span></span><span className="t">Messages</span></div>
                  <div className="xni"><Ic n="bm" /><span className="t">Bookmarks</span></div>
                  <div className="xni"><Ic n="rocket" /><span className="t">Launchpad</span></div>
                  <div className="xni"><Ic n="user" /><span className="t">Profile</span></div>
                  <div className="xni"><Ic n="gear" /><span className="t">Settings</span></div>
                  <div className="xpost-btn"><span>Post</span><Ic n="feather" style={{ fontSize: 22, display: "none" }} /></div>
                  <div className="xme"><img src={av("w65")} alt="" /><div><b>Ayesha Rahman</b><small>@ayesha_builds</small></div><span className="dots">···</span></div>
                </aside>
                <main className="xfeed">
                  <div className="xtabs"><span className="on">For you</span><span>Following</span></div>
                  <div className="xcomp"><img src={av("w65")} alt="" /><div className="in"><div className="ph">What&apos;s happening?</div><div className="row"><Ic n="img" /><span className="post">Post</span></div></div></div>
                  <div className={`newpill${pill ? " show" : ""}`}>
                    <span className="fcs">{(pill ?? []).map((k, i) => <img key={i} src={av(k)} alt="" />)}</span>Show new posts
                  </div>
                  <div>{posts.map(p => <Post key={p.id} p={p} />)}</div>
                </main>
                <aside className="xright">
                  <div className="xsearch"><Ic n="search" />Search</div>
                  <div className="xbox"><h4>Subscribe to Premium</h4>
                    <p className="xprem">Subscribe to unlock new features, get verified maker status, and amplify your reach across founders.</p>
                    <span className="xsub">Subscribe</span>
                  </div>
                  <div className="xbox"><h4>What’s happening</h4>
                    <div className="xtr"><small>Trending in Tech · Launch</small><b>TinyInvoice</b><span>{fmt(upvotes)} upvotes</span></div>
                    <div className="xtr"><small>Trending in Tech · Launch</small><b>Plotline</b><span>356 upvotes</span></div>
                    <div className="xtr"><small>Trending in Tech · Launch</small><b>Loopmail</b><span>298 upvotes</span></div>
                  </div>
                  <div className="xbox"><h4>Who to follow</h4>
                    <div className="xwho"><img src={av("m11")} alt="" /><div><b>Liam Park</b><span>@liampark</span></div><FollowButton /></div>
                    <div className="xwho"><img src={av("w12")} alt="" /><div><b>Sofia Reyes</b><span>@sofiareyes</span></div><FollowButton /></div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
