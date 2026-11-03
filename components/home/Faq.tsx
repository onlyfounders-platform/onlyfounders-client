"use client";
import { useEffect, useRef, useState } from "react";
import { Ic } from "./Icons";
import { FAQ, FAQ_CATS, av, type FaqCat } from "./data";

// FAQ: searchable, filterable accordion. Press "/" while the section is on
// screen to jump to the search box.

function Helpful() {
  const [done, setDone] = useState(false);
  if (done) return <div className="helpful"><span className="thx">✓ Thanks for the feedback</span></div>;
  return (
    <div className="helpful">Was this helpful?
      <button type="button" onClick={() => setDone(true)}>Yes</button>
      <button type="button" onClick={() => setDone(true)}>No</button>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [cat, setCat] = useState<"all" | FaqCat>("all");
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = sectionRef.current;
      if (e.key !== "/" || !el || /INPUT|TEXTAREA/.test(document.activeElement?.tagName ?? "")) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); inputRef.current?.focus(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const s = q.trim().toLowerCase();
  const shown = FAQ.map(([c, qq, a], i) => ({ c, q: qq, a, i }))
    .filter(f => (cat === "all" || f.c === cat) && (!s || `${f.q} ${f.a} ${FAQ_CATS[f.c]}`.toLowerCase().includes(s)));

  return (
    <section className="section" id="faq" ref={sectionRef} style={{ paddingTop: 40 }}>
      <div className="wrap faq">
        <div className="faq-l" data-a="left">
          <span className="tag"><i>?</i>FAQ</span>
          <h2 className="h2">Answers before you ask</h2>
          <label className="fsearch" htmlFor="faqQ">
            <Ic n="search" /><span className="sr">Search questions</span>
            <input id="faqQ" ref={inputRef} type="search" placeholder="Search, e.g. “nofollow”" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} />
            <kbd>/</kbd>
          </label>
          <div className="fcats" role="group" aria-label="Filter by topic">
            {(["all", "links", "launch", "plans", "start"] as const).map(c => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c === "all" ? "All" : FAQ_CATS[c]}</button>
            ))}
          </div>
          <div className="help">
            <div className="faces">{["w65", "m52", "w90"].map(k => <img key={k} src={av(k)} alt="" />)}</div>
            <b>Still have a question?</b>
            <p>Send the team a DM on OnlyFounders. Real founders reply, usually within a few hours.</p>
            <div className="row"><a href="/messages" className="btn btn-ink btn-sm"><Ic n="msg" />Message the team</a></div>
            <span className="mail">hello@onlyfounders.site</span>
          </div>
        </div>

        <div className="qa">
          {shown.map(f => {
            const isOpen = open === f.i;
            return (
              <div key={f.i} className={`qi${isOpen ? " open" : ""}`}>
                <button className="qb" type="button" aria-expanded={isOpen} aria-controls={`qa${f.i}`} onClick={() => setOpen(isOpen ? null : f.i)}>
                  <span className="no">{String(f.i + 1).padStart(2, "0")}</span>
                  <span className="qt">{f.q}</span>
                  <span className="cat">{FAQ_CATS[f.c]}</span>
                  <span className="pm"><Ic n="plus" /></span>
                </button>
                <div className="qa-a" id={`qa${f.i}`} role="region">
                  <div><p>{f.a}</p><Helpful /></div>
                </div>
              </div>
            );
          })}
          {!shown.length && (
            <div className="nores">No questions match that search.<br />
              <button type="button" onClick={() => { setQ(""); setCat("all"); inputRef.current?.focus(); }}>Clear search</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
