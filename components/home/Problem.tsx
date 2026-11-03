import { Ic } from "./Icons";
import { Split } from "./Motion";

// The launch-day problem: three cards with small, honest charts. The bars
// and lines draw in when the card is revealed (see .pbc .chart in home.css).
export default function Problem() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="pb-head">
          <div data-a="left">
            <span className="tag"><i>!</i>The launch-day problem</span>
            <Split as="h2" className="h2">Launching is easy. Being found a year later is the hard part.</Split>
          </div>
          <div className="r" data-a="right">
            <p>Most launch sites give you one loud day. Then the traffic fades, the link is nofollow, and your domain is right where it started.</p>
            <a href="#reel" className="btn btn-paper btn-sm">See the fix in motion <Ic n="arrow" /></a>
          </div>
        </div>
        <div className="pb-grid">
          <article className="pbc" data-a="up">
            <h3>Launch-day traffic fades in 48 hours</h3>
            <p>You get a spike, a few signups, and a link that search engines are told to ignore.</p>
            <div className="vis"><div className="vis-h"><span>Daily visits after a typical launch</span><span className="drop">−95% by day 9</span></div>
              <svg className="chart" viewBox="0 0 300 156" aria-label="Bar chart: about 2,840 visits on launch day, falling to about 130 by day 9" role="img"><g className="gl"><line x1="30" x2="296" y1="132" y2="132"/><text x="0" y="135">0</text><line x1="30" x2="296" y1="92" y2="92"/><text x="0" y="95">1k</text><line x1="30" x2="296" y1="52" y2="52"/><text x="0" y="55">2k</text><line x1="30" x2="296" y1="12" y2="12"/><text x="0" y="15">3k</text></g><rect className="bar e" style={{ '--k': 0 }} x="35.8" y="18.4" width="18" height="113.6" rx="3"/><rect className="bar" style={{ '--k': 1 }} x="65.4" y="79.6" width="18" height="52.4" rx="3"/><rect className="bar" style={{ '--k': 2 }} x="95.0" y="107.2" width="18" height="24.8" rx="3"/><rect className="bar" style={{ '--k': 3 }} x="124.6" y="117.2" width="18" height="14.8" rx="3"/><rect className="bar" style={{ '--k': 4 }} x="154.2" y="122.0" width="18" height="10.0" rx="3"/><rect className="bar" style={{ '--k': 5 }} x="183.8" y="124.4" width="18" height="7.6" rx="3"/><rect className="bar" style={{ '--k': 6 }} x="213.4" y="125.6" width="18" height="6.4" rx="3"/><rect className="bar" style={{ '--k': 7 }} x="243.0" y="126.4" width="18" height="5.6" rx="3"/><rect className="bar" style={{ '--k': 8 }} x="272.6" y="126.8" width="18" height="5.2" rx="3"/><text className="vl" x="44.8" y="12" textAnchor="middle">2,840</text><text className="vl m" x="281" y="121" textAnchor="end">130</text><text x="44.8" y="148" textAnchor="middle">D1</text><text x="74.4" y="148" textAnchor="middle">D2</text><text x="104.0" y="148" textAnchor="middle">D3</text><text x="133.6" y="148" textAnchor="middle">D4</text><text x="163.2" y="148" textAnchor="middle">D5</text><text x="192.8" y="148" textAnchor="middle">D6</text><text x="222.4" y="148" textAnchor="middle">D7</text><text x="252.0" y="148" textAnchor="middle">D8</text><text x="281.6" y="148" textAnchor="middle">D9</text></svg>
            </div>
          </article>
          <article className="pbc hot" data-a="up" style={{ '--d': 1 }}>
            <h3>One good backlink costs $300 or more</h3>
            <p>Guest posts and link brokers charge per link, often monthly, with no promise the link stays live.</p>
            <div className="vis"><div className="vis-h"><span>Quote from a link agency</span><span>Monthly</span></div>
              <div className="inv"><div><span>Guest post · DR 50</span><span>$420</span></div><div><span>Niche edit · DR 45</span><span>$310</span></div><div><span>Link retention fee</span><span>$90/mo</span></div><div className="tot"><span>For 2 links</span><b>$820</b></div></div>
            </div>
          </article>
          <article className="pbc" data-a="up" style={{ '--d': 2 }}>
            <h3>Your DR sits still for years</h3>
            <p>Without steady, permanent links, new domains stay under DR 10 and never rank for the terms that matter.</p>
            <div className="vis"><div className="vis-h"><span>Domain Rating</span><span className="lgd"><i></i>No links <i className="b"></i>With launches</span></div>
              <svg className="chart" viewBox="0 0 300 156" aria-label="Line chart: with no link strategy, Domain Rating moves from 6 to 8 over 24 months; with steady launches it reaches about 31" role="img"><g className="gl"><line x1="30" x2="262" y1="132" y2="132"/><text x="0" y="135">0</text><line x1="30" x2="262" y1="102" y2="102"/><text x="0" y="105">10</text><line x1="30" x2="262" y1="72" y2="72"/><text x="0" y="75">20</text><line x1="30" x2="262" y1="42" y2="42"/><text x="0" y="45">30</text><line x1="30" x2="262" y1="12" y2="12"/><text x="0" y="15">40</text></g><text x="30" y="148" textAnchor="start">Now</text><text x="146" y="148" textAnchor="middle">12 mo</text><text x="262" y="148" textAnchor="end">24 mo</text><path className="cmp" d="M30 114 C 80 110, 120 92, 160 74 S 230 46, 262 39" fill="none" stroke="#1D9BF0" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round"/><path className="ln" d="M30 114 C 100 113, 180 111, 262 108" fill="none" stroke="#536471" strokeWidth="3" strokeLinecap="round"/><circle cx="262" cy="108" r="4" fill="#536471"/><circle className="cmp" cx="262" cy="39" r="4" fill="#1D9BF0"/><text className="vl m" x="268" y="111">DR 8</text><text className="vl a cmp" x="268" y="42">DR 31</text></svg>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
