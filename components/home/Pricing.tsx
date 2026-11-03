import { Split } from "./Motion";
import { PLANS } from "./data";

// Pricing: one-time, per product. Starter is the featured plan.
export default function Pricing() {
  return (
    <section id="pricing" className="py-[120px] max-[900px]:py-[88px]">
      <div className="wrap">
        <div className="center">
          <span className="tag" data-a="blur"><i>$</i>Pricing</span>
          <Split as="h2" className="h2" reveal="up">Pay once per launch. No subscriptions.</Split>
          <p className="lede" data-a="up" style={{ "--d": 2 }}>Every plan can earn a dofollow link. Paid plans add a verified badge, faster review, and more reach.</p>
        </div>

        <div className="mt-[60px] grid grid-cols-3 items-start gap-[18px] max-[900px]:grid-cols-1">
          {PLANS.map((p, i) => (
            <article key={p.name} data-a="up" style={{ "--d": i }}
              className={`flex flex-col rounded-[30px] border p-[30px] transition-shadow duration-300 ${p.feat
                ? "relative -top-3.5 border-transparent bg-[linear-gradient(170deg,var(--color-of-ac-hi)_0%,var(--color-of-ac)_40%,var(--color-of-ac-lo)_100%)] text-white shadow-[0_44px_74px_-36px_rgba(29,155,240,.85)] max-[900px]:top-0"
                : "border-of-line-2 bg-white hover:shadow-of-2"}`}>
              <div className="flex items-center gap-2.5">
                <h3 className="font-of-display text-[23px] font-semibold tracking-[-.02em]">{p.name}</h3>
                {p.feat && <span className="ml-auto rounded-full bg-white/20 px-[11px] py-1 text-[12px] font-semibold text-white">Most popular</span>}
              </div>
              <p className={`mt-1 min-h-[46px] text-[14.5px] ${p.feat ? "text-white/85" : "text-of-ink-2"}`}>{p.for}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <b className="font-of-display text-[56px] leading-none font-bold tracking-[-.05em]">{p.price}</b>
                <small className={`text-[14px] ${p.feat ? "text-white/85" : "text-of-ink-3"}`}>{p.per}</small>
              </div>
              <a href={p.href} className={`btn mt-[22px] w-full ${p.feat ? "bg-white text-of-ac-lo shadow-[0_10px_20px_-10px_rgba(0,0,0,.4)]" : "btn-ink"}`}>{p.cta}</a>
              <ul className="mt-6 flex list-none flex-col gap-3 p-0 text-[14.5px]">
                {p.items.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <i className={`mt-0.5 grid size-[19px] flex-none place-items-center rounded-full text-[11px] font-extrabold not-italic ${p.feat ? "bg-white/25 text-white" : "bg-of-good-soft text-of-good-ink"}`}>✓</i>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-[30px] text-center text-[13.5px] text-of-ink-3" data-a="up">Prices in USD, per product. Secure checkout by Paddle.</p>
      </div>
    </section>
  );
}
