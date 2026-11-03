import { EVENTS, PEOPLE, av } from "./data";

// "Happening now" strip: a slow marquee of platform events (pauses on hover).
export default function Trust() {
  const row = EVENTS.map(([u, verb, obj], i) => (
    <span key={i} className="inline-flex items-center gap-[7px] py-2.5 text-[14.5px] whitespace-nowrap text-of-ink-2">
      <img src={av(PEOPLE[u].av)} alt="" className="mr-[3px] size-6 rounded-full object-cover" />
      <b className="font-semibold text-of-ink">{PEOPLE[u].name.split(" ")[0]}</b> {verb} <b className="font-semibold text-of-ink">{obj}</b>
      <span aria-hidden="true" className="ml-[30px] size-1 rounded-full bg-of-line-2" />
    </span>
  ));

  return (
    <section className="pt-[30px]">
      <div className="wrap flex items-center gap-7 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4" data-a="up">
        <p className="flex-none border-r border-of-line-2 pr-7 text-sm leading-[1.45] whitespace-nowrap text-of-ink-2 max-[900px]:border-r-0 max-[900px]:pr-0">
          <b className="inline-flex items-center gap-[7px] font-semibold text-of-ink">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-of-good shadow-[0_0_0_4px_var(--color-of-good-soft)]" />
            Happening now
          </b>{" "}on OnlyFounders
        </p>
        <div className="group min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] max-[900px]:w-full">
          <div className="flex w-max gap-[30px] animate-[of-slide_60s_linear_infinite] group-hover:[animation-play-state:paused]">
            {row}{row}
          </div>
        </div>
      </div>
    </section>
  );
}
