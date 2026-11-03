"use client";
import { useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Ic } from "./Icons";
import { Split } from "./Motion";
import { isEmail } from "./data";
import { dhm, useNow, weekInfo } from "./hooks";

// Closing CTA: typing a product name fills in a launch pass for next
// Monday's board; a valid submit stamps it READY.
// TODO: wire the submit to the real waitlist/email endpoint.

export default function LaunchPass() {
  const now = useNow(1000);
  const week = now ? weekInfo(now) : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = !!name.trim() && isEmail(email);
    setErr(!ok);
    if (ok) setDone(true);
  };

  const opensIn = week ? (week.left >= 86400 ? `${Math.floor(week.left / 86400)}d ${Math.floor((week.left % 86400) / 3600)}h` : dhm(week.left)) : "--";

  return (
    <section className="section" id="launch" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="cta" data-a="zoom">
          <div>
            <span className="tag"><i>✦</i>Next week’s board is filling up</span>
            <Split as="h2" className="h2">Claim your spot on Monday’s Launchpad</Split>
            <p className="lede">Type your product name and watch your launch pass fill in. We’ll email you a link to finish your listing before the board opens.</p>
            {!done ? (
              <form className="passform" noValidate onSubmit={submit}>
                <div className="row">
                  <div className="fld"><label htmlFor="passName">Product name</label><input id="passName" type="text" maxLength={28} placeholder="TinyInvoice" autoComplete="off" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div className="fld"><label htmlFor="passEmail">Email</label><input id="passEmail" type="email" placeholder="you@startup.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                </div>
                {err && <span className="perr">Add your product name and a valid email, like you@startup.com.</span>}
                <button className="btn" type="submit">Get my launch pass <Ic n="arrow" /></button>
              </form>
            ) : (
              <div className="pdone"><span className="ok">✓</span><span><b>Pass ready.</b> Check your inbox to finish your listing.</span></div>
            )}
            <div className="pmeta2"><span>✓ Free plan, no card</span><span>✓ Dofollow with the badge</span><span>✓ Ranked by founders</span></div>
          </div>
          <div className="ticket-wrap">
            <div className={`ticket${done ? " done" : ""}`}>
              <div className="tk-main">
                <div className="tk-h"><LogoMark size={26} />OnlyFounders<small>LAUNCH PASS</small></div>
                <div className="tk-prod"><small>Product</small><b>{name.trim() || "Your product"}</b></div>
                <div className="tk-route"><span>Listed</span><span className="ln" /><span style={{ color: "var(--ac)" }}>Top 3</span></div>
                <div className="tk-grid">
                  <div><small>Board</small><b>{week?.nextLabel ?? "--"}</b></div>
                  <div><small>Opens</small><b>Monday</b></div>
                  <div><small>Seat</small><b>#12,048</b></div>
                  <div><small>Gate</small><b>Launchpad</b></div>
                  <div><small>Link</small><b>dofollow</b></div>
                  <div><small>Opens in</small><b>{opensIn}</b></div>
                </div>
                <div className="barcode" aria-hidden="true" />
              </div>
              <div className="tk-stub"><span className="v">ADMIT ONE</span><span className="dr">DR<br />↑</span></div>
              <span className="stamp">READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
