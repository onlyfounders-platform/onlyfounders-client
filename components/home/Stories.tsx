import { Split } from "./Motion";
import { PEOPLE, STORIES, av } from "./data";

// Founder stories. Sample content with stock portraits — replace with real
// founders (with permission) before launch.
export default function Stories() {
  return (
    <section id="stories" className="bg-of-bg-2 py-[120px] max-[900px]:py-[88px]">
      <div className="wrap">
        <div className="st-head">
          <div>
            <span className="tag" data-a="blur"><i>★</i>Founder stories</span>
            <Split as="h2" className="h2" reveal="up">Founders who launched once and kept winning</Split>
          </div>
          <p className="lede" data-a="right">One listing, one badge, and a feed full of people who build. Here’s what came after.</p>
        </div>

        <div className="mt-[52px] grid grid-cols-3 items-stretch gap-[18px] max-[900px]:grid-cols-1">
          {STORIES.map((s, i) => {
            const who = PEOPLE[s.u];
            const muted = s.feat ? "text-white/80" : "text-of-ink-2";
            return (
              <article key={s.prod} data-a="up" style={{ "--d": i }}
                className={`flex min-w-0 flex-col rounded-[28px] border p-7 transition-[translate,box-shadow] duration-400 ease-of hover:-translate-y-1 ${s.feat
                  ? "border-transparent bg-[linear-gradient(165deg,var(--color-of-ac-hi),var(--color-of-ac)_45%,var(--color-of-ac-lo))] text-white shadow-of-feat"
                  : "border-of-line-2 bg-white hover:shadow-of-2"}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`grid size-9 flex-none place-items-center rounded-[11px] font-of-display text-[12px] font-extrabold ${s.feat ? "bg-white text-of-ac" : "text-white"}`}
                    style={s.feat ? undefined : { background: s.c }}>{s.lg}</span>
                  <span className={`text-[13.5px] ${muted}`}><b className="text-inherit">{s.prod}</b> · {s.url}</span>
                </div>
                <div className="mt-[22px] font-of-display text-[clamp(34px,3.4vw,46px)] leading-none font-bold tracking-[-.045em]">
                  {s.m}
                  <small className={`mt-2 block font-of-body text-[13.5px] font-medium tracking-normal ${s.feat ? "text-white/80" : "text-of-ink-3"}`}>{s.ms}</small>
                </div>
                <blockquote className={`mt-[22px] text-[16.5px] leading-[1.55] text-pretty ${s.feat ? "text-white" : "text-of-ink"}`}>{s.q}</blockquote>
                <div className="mt-auto flex items-center gap-3 pt-[26px] font-of-x">
                  <img src={av(who.av)} alt="" className="size-[42px] rounded-full bg-of-bg-3 object-cover" />
                  <span><b className="block text-[15px]">{who.name}</b><small className={`text-[13.5px] ${muted}`}>@{who.handle}</small></span>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-7 block text-center text-[12px] text-of-ink-3">
          <span className="rounded-full border border-dashed border-of-line-2 px-3 py-1">Sample stories with stock portraits · replace with real founders (with permission) before launch</span>
        </p>
      </div>
    </section>
  );
}
