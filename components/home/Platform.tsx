"use client";
import { Ic } from "./Icons";
import { Split, spotlight } from "./Motion";
import { dhm, useNow, useUpvotes, weekInfo } from "./hooks";

// Platform bento: each card is a small, faithful slice of the real app
// (weekly board, badge → dofollow, DMs, profile with achievements).

// 26-week activity heatmap, seeded so it's identical on server and client.
const HEAT = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 168 }, (_, k) => {
    const r = k >= 166 ? 0 : rnd() * (0.4 + k / 140);
    return r > 1 ? "l4" : r > 0.78 ? "l3" : r > 0.55 ? "l2" : r > 0.36 ? "l1" : undefined;
  });
})();

export default function Platform() {
  const now = useNow(1000);
  const upvotes = useUpvotes();
  const week = now ? weekInfo(now) : null;

  return (
    <section className="section" id="platform">
      <div className="wrap">
        <div className="center">
          <span className="tag" data-a="blur"><i>✦</i>The platform</span>
          <Split as="h2" className="h2" reveal="up">Everything you know from X, rebuilt around launches</Split>
          <p className="lede" data-a="up" style={{ '--d': 2 }}>A feed for build updates, a weekly board for launches, real-time DMs, and a profile that shows your track record.</p>
        </div>
        <div className="bento">
          <article className="bx spot" onPointerMove={spotlight} data-a="up">
            <h3>The weekly Launchpad</h3>
            <p>A fresh board every Monday. Founder upvotes decide the ranking, and the top 3 earn a Podium Finish.</p>
            <div className="ui xui lp">
              <div className="lp-tabs"><span className="on">Weekly Launches</span><span>Leaderboard</span></div>
              <div className="lp-wk"><span className="ch">‹</span><span><b>{week ? `Week of ${week.range}` : "This week"}</b><em>Live week</em></span><span className="ch dim">›</span></div>
              <div className="br"><span className="rk">01</span><span className="lg" style={{ background: '#1D9BF0' }}>TI</span><span className="nm"><b>TinyInvoice</b><small>Fintech · Freemium</small></span><span className="upv on">▲<br /><span>{upvotes}</span></span></div>
              <div className="br"><span className="rk">02</span><span className="lg" style={{ background: '#7856FF' }}>PL</span><span className="nm"><b>Plotline</b><small>Productivity · Free</small></span><span className="upv">▲<br />356</span></div>
              <div className="br"><span className="rk">03</span><span className="lg" style={{ background: '#00BA7C' }}>LM</span><span className="nm"><b>Loopmail</b><small>AI · Paid</small></span><span className="upv">▲<br />298</span></div>
              <div className="lp-ft"><span>Ranked by upvotes</span><span>closes in {week ? dhm(week.left) : "--"}</span></div>
            </div>
          </article>
          <article className="bx spot" onPointerMove={spotlight} data-a="up" style={{ '--d': 1 }}>
            <h3>Add the badge, get a dofollow link</h3>
            <p>Paste our badge on your site. We check for it and switch your listing link to dofollow, on every plan.</p>
            <div className="ui bdg">
              <div className="site"><div className="site-bar"><i></i><i></i><i></i><code>tinyinvoice.app</code></div>
                <div className="site-ft"><span>© 2026 TinyInvoice · Privacy · Terms</span><span className="fob"><Ic n="rocket" /><span><small>FEATURED ON</small><b>OnlyFounders</b></span></span></div>
              </div>
              <div className="rel"><span className="k">Your listing link</span><span className="v"><s>rel=&quot;nofollow&quot;</s><b>dofollow ✓</b></span></div>
              <div className="checks"><span>✓ Badge found</span><span>✓ Verified in seconds</span><span>✓ Free plan</span></div>
            </div>
          </article>
          <article className="bx bx-c spot" onPointerMove={spotlight} data-a="up" style={{ '--d': 2 }}>
            <h3>Messages in real time</h3>
            <p>Swap feedback, trade intros, and find beta users among people building next to you.</p>
            <div className="ui xui dmx">
              <div className="uih"><span>Messages</span><small style={{ color: "var(--ac)" }}>4 new</small></div>
              <div className="msg new"><img src="/home/avatars/m75.jpg" alt="" /><div className="tx"><b>Marcus Webb <small>9:30</small></b><p className="typing2">typing…</p></div></div>
              <div className="msg"><img src="/home/avatars/w44.jpg" alt="" /><div className="tx"><b>Priya Mehra <small>9:12</small></b><p>Loved the launch. Want to swap onboarding feedback?</p></div></div>
              <div className="msg"><img src="/home/avatars/m11.jpg" alt="" /><div className="tx"><b>Liam Park <small>8:47</small></b><p>Saw you’re open to a cofounder. Coffee this week?</p></div></div>
              <div className="msg"><img src="/home/avatars/w90.jpg" alt="" /><div className="tx"><b>Emma Collins <small>Yesterday</small></b><p>We&apos;d love to be a beta customer for TinyInvoice</p></div></div>
              <div className="msg"><img src="/home/avatars/m32.jpg" alt="" /><div className="tx"><b>Rohan Singh <small>Yesterday</small></b><p>How did you get to the top 3 so fast?</p></div></div>
              <div className="msg"><img src="/home/avatars/w12.jpg" alt="" /><div className="tx"><b>Sofia Reyes <small>Mon</small></b><p>Can I feature you in our founder roundup?</p></div></div>
              <div className="msg"><img src="/home/avatars/m46.jpg" alt="" /><div className="tx"><b>Daniel Okafor <small>Mon</small></b><p>Upvoted! Mind if I DM a question about Paddle?</p></div></div>
              <div className="msg"><img src="/home/avatars/w21.jpg" alt="" /><div className="tx"><b>Yuki Tanaka <small>Sun</small></b><p>Congrats on the podium 🎉</p></div></div>
              <div className="msg"><img src="/home/avatars/m86.jpg" alt="" /><div className="tx"><b>Arjun Rao <small>Sat</small></b><p>Would love to swap launch notes sometime</p></div></div>
              <div className="dm-in"><span>Start a new message</span><Ic n="arrow" /></div>
            </div>
          </article>
          <article className="bx bx-d spot" onPointerMove={spotlight} data-a="up" style={{ '--d': 1 }}>
            <div className="pf-copy">
              <h3>A profile that proves you ship</h3>
              <p>Your launches, posts, and wins in one place. Achievements unlock as you launch, streaks show how often you show up, and “Open to” badges tell people what you’re looking for.</p>
              <ul className="pf-list"><li><img src="/rank-badges/rank-gold.svg" alt="" /><span><b>Podium Finish</b>Top 3 on a weekly board</span></li><li><img src="/rank-badges/rank-silver.svg" alt="" /><span><b>Crowd Favorite</b>50 upvotes across your products</span></li><li><img src="/rank-badges/rank-bronze.svg" alt="" /><span><b>First Launch</b>Submitted your first product</span></li></ul>
            </div>
            <div className="ui xui prof">
              <div className="pf-ban"></div>
              <div className="pf-head"><img className="pf-av" src="/home/avatars/w65.jpg" alt="" /><span className="pf-edit">Edit profile</span></div>
              <div className="pf-id"><b>Ayesha Rahman <Ic n="vf" f className="vf" /></b><small>@ayesha_builds</small></div>
              <p className="pf-bio">Building TinyInvoice, invoices that chase late payments for you. Three launches, one podium.</p>
              <div className="pf-meta"><span><Ic n="link" /><a>tinyinvoice.app</a></span><span><Ic n="cal" />Joined March 2026</span></div>
              <div className="pf-ff"><span><b>842</b> Following</span><span><b>1,204</b> Followers</span></div>
              <div className="pf-open"><i>Open to a cofounder</i><i>Investment</i><i>Hiring</i></div>
              <div className="pf-act">
                <div className="pf-st"><Ic n="flame" /><b>12 days</b><small>current streak · best 21</small></div>
                <div className="heat" aria-hidden="true">{HEAT.map((c, k) => <i key={k} className={c} />)}</div>
              </div>
              <div className="pf-tabs"><span className="on">Products</span><span>Posts</span></div>
            </div>
          </article>
        </div>
        <p className="also" data-a="up">Also built in: <span>Explore people, posts &amp; products</span><span>Bookmarks</span><span>Notifications</span><span>Weekly theme challenge</span><span>Company pages</span><span>Import from URL</span></p>
      </div>
    </section>
  );
}
