// X's composer ring: fills as you type, turns yellow in the last 20 chars,
// red with a negative count once over the limit.
export default function CharCounter({ length, max }: { length: number; max: number }) {
  if (length === 0) return null;
  const remaining = max - length;
  const pct = Math.min(1, length / max);
  const r = 9;
  const c = 2 * Math.PI * r;
  const warn = remaining <= 20;
  const over = remaining < 0;
  const size = warn ? 30 : 22;
  const color = over ? "var(--red)" : warn ? "var(--yellow)" : "var(--accent)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }} aria-live="polite" aria-label={`${remaining} characters remaining`}>
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ transition: "width .15s, height .15s" }}>
        <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border)" strokeWidth="2.2" />
        {!over && (
          <circle cx="12" cy="12" r={r} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 12 12)" />
        )}
        {warn && <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="600" fill={over ? "var(--red)" : "var(--text-secondary)"}>{remaining}</text>}
      </svg>
    </span>
  );
}
