"use client";
import { useEffect, useRef, useState } from "react";
import { Ic } from "./Icons";
import { Split } from "./Motion";
import { clamp } from "./data";

// DR calculator: an illustrative link-equity model, drawn as an SVG chart
// that re-renders from slider state. Hover/press scrubs to any month.

const model = (L: number, S: number, t: number) => { const eff = L * t * (1 + 0.02 * t); return S + (72 - S) * (1 - Math.exp(-0.018 * eff)); };
const alone = (S: number, t: number) => S + 0.25 * t;

function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function Slider({ id, label, value, min, max, unit = "", onChange }: {
  id: string; label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="ctrl">
      <label htmlFor={id}><span>{label}</span><output>{value}{unit}</output></label>
      <input type="range" id={id} min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ "--p": `${((value - min) / (max - min)) * 100}%` }} />
      <div className="scale"><span>{min}{unit}</span><span>{max}{unit}</span></div>
    </div>
  );
}

export default function Calculator() {
  const [S, setS] = useState(8);
  const [L, setL] = useState(2);
  const [M, setM] = useState(12);
  const [size, setSize] = useState({ W: 900, H: 300 });
  const [hov, setHov] = useState<{ t: number; left: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver(() => setSize({ W: Math.max(300, svg.clientWidth), H: svg.clientHeight || 300 }));
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  const { W, H } = size, narrow = W < 560;
  const top = Math.min(80, Math.ceil((model(L, S, M) + 6) / 20) * 20);
  const pl = 30, pr = narrow ? 52 : 76, pt = 16, pb = 30;
  const x = (t: number) => pl + ((W - pl - pr) * t) / M;
  const y = (d: number) => pt + (H - pt - pb) * (1 - d / top);
  const a: [number, number][] = [], b: [number, number][] = [];
  for (let t = 0; t <= M; t++) { a.push([x(t), y(model(L, S, t))]); b.push([x(t), y(alone(S, t))]); }
  const end = model(L, S, M), endA = alone(S, M), la = smooth(a);
  const ticks = narrow ? [0, M] : [0, Math.round(M / 4), Math.round(M / 2), Math.round((3 * M) / 4), M];

  const scrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current, wrap = wrapRef.current;
    if (!svg || !wrap) return;
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
    const t = clamp(Math.round(((px - pl) / (W - pl - pr)) * M), 0, M);
    const lx = x(t) * (r.width / W) + (r.left - wrap.getBoundingClientRect().left);
    setHov({ t, left: clamp(lx, 90, wrap.clientWidth - 90) });
  };

  return (
    <section className="section" id="calculator">
      <div className="wrap">
        <div className="st-head">
          <div>
            <span className="tag" data-a="blur"><i>%</i>DR calculator</span>
            <Split as="h2" className="h2" reveal="up">See your own <span className="hl">compound</span> curve</Split>
          </div>
          <p className="lede" data-a="right">Move the sliders to see how steady launches could move your Domain Rating compared with doing nothing.</p>
        </div>
        <div className="calc" data-a="up">
          <div className="calc-top">
            <div className="kpi main"><small>Projected DR</small><b>{Math.round(end)}</b><span className="delta">+{Math.round(end - S)}</span></div>
            <div className="kpi"><small>Dofollow links earned</small><b>{L * M}</b></div>
            <div className="kpi"><small>Without launches</small><b className="muted">{Math.round(endA)}</b></div>
            <div className="legend"><span><i />With OnlyFounders</span><span><i className="d" />No link strategy</span></div>
          </div>
          <div className="calc-chart" ref={wrapRef}>
            <svg id="calcChart" ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={hov ? "hov" : undefined}
              aria-label="Projected Domain Rating over time, with and without regular launches" role="img"
              onPointerMove={scrub} onPointerDown={scrub} onPointerLeave={() => setHov(null)}>
              {[0, 0.25, 0.5, 0.75, 1].map(f => Math.round(top * f)).map(v => (
                <g key={v}><line className="gl" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} /><text x="0" y={y(v) + 4}>{v}</text></g>
              ))}
              {ticks.map((t, i) => (
                <text key={i} x={x(t)} y={H - 6} textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}>{t === 0 ? "Today" : "Mo " + t}</text>
              ))}
              <defs><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1D9BF0" stopOpacity=".16" /><stop offset="1" stopColor="#1D9BF0" stopOpacity="0" /></linearGradient></defs>
              <path d={`${la} L${x(M)} ${y(0)} L${x(0)} ${y(0)} Z`} fill="url(#cf)" />
              <path d={smooth(b)} fill="none" stroke="#8B98A5" strokeWidth="2" strokeDasharray="5 5" />
              <path d={la} fill="none" stroke="#1D9BF0" strokeWidth="3" strokeLinecap="round" />
              <circle cx={x(M)} cy={y(end)} r="5" fill="#fff" stroke="#1D9BF0" strokeWidth="3" />
              <text className="endl" x={x(M) + 10} y={y(end) + 4}>DR {Math.round(end)}</text>
              <text className="endm" x={x(M) + 10} y={y(endA) + 4}>DR {Math.round(endA)}</text>
              {hov && (
                <g className="hv">
                  <line x1={x(hov.t)} x2={x(hov.t)} y1={pt} y2={H - pb} stroke="#0F1419" strokeOpacity=".18" />
                  <circle cx={x(hov.t)} cy={y(model(L, S, hov.t))} r="5" fill="#1D9BF0" stroke="#fff" strokeWidth="2" />
                  <circle cx={x(hov.t)} cy={y(alone(S, hov.t))} r="4" fill="#8B98A5" stroke="#fff" strokeWidth="2" />
                </g>
              )}
            </svg>
            {hov && (
              <div className="ctip" style={{ left: hov.left }}>
                <small>{hov.t === 0 ? "Today" : "Month " + hov.t} · {L * hov.t} links</small>
                With launches <b>DR {Math.round(model(L, S, hov.t))}</b><br />
                Without <b>DR {Math.round(alone(S, hov.t))}</b>
              </div>
            )}
          </div>
          <div className="calc-ctl">
            <Slider id="cStart" label="Your DR today" value={S} min={0} max={40} onChange={setS} />
            <Slider id="cRate" label="Launches per month" value={L} min={1} max={8} onChange={setL} />
            <Slider id="cMonths" label="Time horizon" value={M} min={3} max={24} unit=" mo" onChange={setM} />
            <a href="/register" className="btn btn-ac">Start my curve <Ic n="arrow" /></a>
          </div>
          <p className="fine">Illustrative model based on typical link-equity curves. Real movement depends on your niche, content, and other links. Hover the chart to see any month.</p>
        </div>
      </div>
    </section>
  );
}
