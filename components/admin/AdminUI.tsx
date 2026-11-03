"use client";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, Table2, BarChart3 } from "lucide-react";

// Building blocks shared by every /admin page: page header, filter toolbar,
// data table, pagination, KPI tiles, status chips and a single-series bar chart.

export function AdminPage({ title, desc, actions, children }: { title: string; desc?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="adm-page">
      <div className="adm-head">
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {desc && <p>{desc}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="adm-toolbar">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = "Search" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="adm-search">
      <Search size={16} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select className="adm-select" value={value} onChange={e => onChange(e.target.value)} aria-label={label}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; count?: number }[] }) {
  return (
    <div className="adm-seg" role="tablist">
      {options.map(o => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}{o.count !== undefined && <span>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export interface Column<T> { key: string; label: string; render: (row: T) => ReactNode; width?: string | number; align?: "left" | "right" | "center" }

export function DataTable<T extends { _id: string }>({ columns, rows, loading, empty = "Nothing here yet.", onRowClick }: {
  columns: Column<T>[]; rows: T[]; loading?: boolean; empty?: string; onRowClick?: (row: T) => void;
}) {
  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key} style={{ width: c.width, textAlign: c.align ?? "left" }}>{c.label}</th>)}</tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.5 : 1 }}>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="adm-empty">{loading ? "Loading…" : empty}</td></tr>
          ) : rows.map(r => (
            <tr key={r._id} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? "adm-row-click" : undefined}>
              {columns.map(c => <td key={c.key} style={{ textAlign: c.align ?? "left" }}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, total, onChange }: { page: number; pages: number; total?: number; onChange: (p: number) => void }) {
  if (!pages || pages <= 1) return total !== undefined ? <p className="adm-pager-info">{total.toLocaleString()} total</p> : null;
  return (
    <div className="adm-pager">
      <span className="adm-pager-info">Page {page} of {pages}{total !== undefined ? ` · ${total.toLocaleString()} total` : ""}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="ds-icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button>
        <button className="ds-icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="adm-kpis">{children}</div>;
}

export function Kpi({ label, value, sub, tone, icon: Icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "good" | "warn" | "bad"; icon?: any }) {
  return (
    <div className="adm-kpi">
      <div className="adm-kpi-label">{Icon && <Icon size={15} />}{label}</div>
      <div className="adm-kpi-value" data-tone={tone}>{value}</div>
      {sub && <div className="adm-kpi-sub">{sub}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, pad = true }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <section className="adm-panel">
      {(title || actions) && (
        <div className="adm-panel-head">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      <div style={pad ? { padding: 16 } : undefined}>{children}</div>
    </section>
  );
}

const CHIP_TONE: Record<string, string> = {
  active: "success", approved: "success", completed: "success", sent: "success", resolved: "success",
  pending: "warning", queued: "warning", processing: "info", draft: "default", open: "warning",
  suspended: "danger", rejected: "danger", failed: "danger", refunded: "default", deactivated: "default",
  skipped: "default", cancelled: "default", dismissed: "default",
  free: "default", starter: "info", pro: "accent", admin: "accent", user: "default",
};

export function StatusChip({ value, label }: { value: string; label?: string }) {
  return <span className={`ds-chip ds-chip--${CHIP_TONE[value] ?? "default"}`} style={{ textTransform: "capitalize", fontSize: 12, padding: "1px 8px", whiteSpace: "nowrap" }}>{label ?? value}</span>;
}

export const fmtDate = (d?: string | Date | null, withTime = false) =>
  d ? new Date(d).toLocaleString([], withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "—";
export const money = (n = 0) => `$${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

// Single-series daily bars (one hue, so no legend — the panel title names
// it). Every bar has a hover tooltip, and a table view is one click away.
export function BarChart({ data, format = (v: number) => v.toLocaleString(), height = 140, label }: {
  data: { date: string; value: number }[]; format?: (v: number) => string; height?: number; label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...data.map(d => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const n = data.length || 1;
  const w = 100 / n;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{format(total)}</span>
          <span style={{ marginLeft: 6, fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>last {n} days</span>
        </div>
        <button className="ds-icon-btn" style={{ width: 30, height: 30 }} onClick={() => setAsTable(t => !t)} aria-label={asTable ? `Show ${label} as chart` : `Show ${label} as table`} title={asTable ? "Chart view" : "Table view"}>
          {asTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
        </button>
      </div>
      {asTable ? (
        <div style={{ maxHeight: height + 24, overflowY: "auto", fontSize: "var(--font-sm)" }}>
          <table className="adm-table" style={{ minWidth: 0 }}>
            <thead><tr><th>Date</th><th style={{ textAlign: "right" }}>{label}</th></tr></thead>
            <tbody>{[...data].reverse().map(d => <tr key={d.date}><td>{fmtDate(d.date)}</td><td style={{ textAlign: "right" }}>{format(d.value)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div style={{ position: "relative" }} onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" width="100%" height={height} role="img" aria-label={`${label}, daily, total ${format(total)}`} style={{ display: "block", overflow: "visible" }}>
            <line x1="0" x2="100" y1={height} y2={height} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1={height / 2} y2={height / 2} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" opacity=".6" />
            {data.map((d, i) => {
              const h = d.value === 0 ? 0 : Math.max(2, (d.value / max) * (height - 6));
              return (
                <g key={d.date} onMouseEnter={() => setHover(i)}>
                  <rect x={i * w} y={0} width={w} height={height} fill="transparent" />
                  <rect x={i * w + w * 0.18} y={height - h} width={w * 0.64} height={h} rx={Math.min(1.2, w * 0.3)}
                    fill="var(--accent)" opacity={hover === null || hover === i ? 1 : 0.45} />
                </g>
              );
            })}
          </svg>
          {hover !== null && data[hover] && (
            <div className="adm-tip" style={{ left: `${Math.min(84, Math.max(0, (hover + 0.5) * w - 8))}%` }}>
              <strong>{format(data[hover].value)}</strong>
              <span>{fmtDate(data[hover].date)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>
            <span>{fmtDate(data[0]?.date)}</span><span>{fmtDate(data[data.length - 1]?.date)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
