import AppShell from "@/components/AppShell";

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <AppShell title={title} backButton>
      <article style={{ padding: "20px 16px 48px", lineHeight: 1.6 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-sm)", marginBottom: 20 }}>Last updated {updated}</p>
        {sections.map(s => (
          <section key={s.heading} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "var(--font-lg)", fontWeight: 800, marginBottom: 6 }}>{s.heading}</h2>
            {s.body.map((p, i) => <p key={i} style={{ color: "var(--text-secondary)", marginBottom: 8 }}>{p}</p>)}
          </section>
        ))}
      </article>
    </AppShell>
  );
}
