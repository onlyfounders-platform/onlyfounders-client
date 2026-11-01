"use client";
export interface TabItem { key: string; label: string; count?: number; }
export interface TabsProps { items: readonly TabItem[]; active: string; onChange: (key: string) => void; size?: "sm" | "md"; }
export default function Tabs({ items, active, onChange, size = "md" }: TabsProps) {
  return <div className={`ds-tabs ds-tabs--${size}`} role="tablist" aria-label="Sections">
    {items.map((item, index) => <button type="button" key={item.key} role="tab" aria-selected={item.key === active} tabIndex={item.key === active ? 0 : -1} className="ds-tab" onClick={() => onChange(item.key)} onKeyDown={event => {
      let target: number;
      if (event.key === "ArrowRight") target = (index + 1) % items.length;
      else if (event.key === "ArrowLeft") target = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = items.length - 1;
      else return;
      event.preventDefault(); onChange(items[target].key);
      (event.currentTarget.parentElement?.children[target] as HTMLButtonElement)?.focus();
    }}><span className="ds-tab-label">{item.label}{item.count !== undefined && <span className="ds-tab-count">{item.count}</span>}</span></button>)}
  </div>;
}
