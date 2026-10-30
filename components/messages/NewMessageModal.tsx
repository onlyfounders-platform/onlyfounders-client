"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import { useLazySearchUsersQuery } from "@/lib/api/usersApi";
import { Search } from "lucide-react";

export default function NewMessageModal({
  open, onClose, onSelect, excludeUsername,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (username: string) => void;
  excludeUsername?: string;
}) {
  const [q, setQ] = useState("");
  const [search, { data, isFetching }] = useLazySearchUsersQuery();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => search({ q }), 250);
    return () => clearTimeout(id);
  }, [q, open, search]);

  const results = (data?.users ?? []).filter(u => u.username !== excludeUsername);

  return (
    <Modal open={open} onClose={onClose} title="New message" maxWidth={420}>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search founders by name or username…"
          style={{
            width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--text)", fontSize: 13.5, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {isFetching && <div style={{ padding: 20, textAlign: "center", fontSize: 12.5, color: "var(--text-tertiary)" }}>Searching…</div>}
        {!isFetching && results.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", fontSize: 12.5, color: "var(--text-tertiary)" }}>
            {q ? "No founders found" : "Start typing to find someone to message"}
          </div>
        )}
        {results.map(u => (
          <button
            key={u._id}
            onClick={() => onSelect(u.username)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9,
              border: "none", background: "transparent", cursor: "pointer", textAlign: "left", width: "100%",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Avatar src={u.avatar} name={u.name} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>@{u.username}</div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
