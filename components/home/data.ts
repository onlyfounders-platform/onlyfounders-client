// Content for the home page. Everything here is either a real product fact
// (weekly board, badge → dofollow, one-time plans) or clearly sample data for
// the demo feed and stories — swap in real founders before launch.

export const av = (key: string) => `/home/avatars/${key}.jpg`;

export type PersonKey = keyof typeof PEOPLE;
export const PEOPLE = {
  nadia: { name: "Nadia Torres", handle: "nadiatorres", av: "w68" },
  rohan: { name: "Rohan Singh", handle: "rohan_ships", av: "m32" },
  priya: { name: "Priya Mehra", handle: "priyabuilds", av: "w44" },
  marcus: { name: "Marcus Webb", handle: "marcuswebb", av: "m75" },
  yuki: { name: "Yuki Tanaka", handle: "yuki_makes", av: "w21" },
  daniel: { name: "Daniel Okafor", handle: "danokafor", av: "m46" },
  sofia: { name: "Sofia Reyes", handle: "sofiareyes", av: "w12" },
  arjun: { name: "Arjun Rao", handle: "arjun_rao", av: "m86" },
  emma: { name: "Emma Collins", handle: "emmacollins", av: "w90" },
  liam: { name: "Liam Park", handle: "liampark", av: "m11" },
} as const;

export type FeedPost = {
  u: PersonKey; t: string; x: string;
  img?: { n: string; t: string; g: string };
  r: number; rt: number; lk: number;
};

export const FEED: FeedPost[] = [
  { u: "nadia", t: "2m", x: "TinyInvoice is live on this week’s Launchpad 🚀 Invoices that chase late payments for you. Would love your upvote and honest feedback.", img: { n: "TinyInvoice", t: "Invoices that chase themselves", g: "linear-gradient(135deg,#7CC8F8,#1D9BF0 55%,#0A7CC4)" }, r: 12, rt: 8, lk: 57 },
  { u: "rohan", t: "14m", x: "Week 6 update: DR went from 9 to 21. The badge took two minutes to add and our listing link is now the #2 referrer to Loopmail.", r: 31, rt: 14, lk: 220 },
  { u: "priya", t: "31m", x: "Looking for 5 beta testers for Plotline, a roadmap tool for solo founders. DMs open 👇", img: { n: "Plotline", t: "Roadmaps for solo founders", g: "linear-gradient(135deg,#A58BFF,#7856FF 60%,#5B3FD9)" }, r: 18, rt: 6, lk: 96 },
  { u: "marcus", t: "48m", x: "Closed our pre-seed this morning. Our lead angel found us through an “Open to investment” badge on my profile. Wild month.", r: 64, rt: 41, lk: 812 },
  { u: "daniel", t: "1h", x: "Just joined OnlyFounders 👋 Building Stackwise, cost tracking for your AWS bill. Launching on Monday’s board.", r: 9, rt: 2, lk: 44 },
  { u: "yuki", t: "1h", x: "Shipped dark mode for Formcraft. This week’s challenge is “Solo-founder builds” so it’s going straight on the Launchpad.", img: { n: "Formcraft", t: "Forms that feel like chat", g: "linear-gradient(135deg,#FFB366,#FF7A00 60%,#D95F00)" }, r: 7, rt: 3, lk: 61 },
  { u: "sofia", t: "2h", x: "Hot take: a permanent dofollow link beats a day of launch traffic. Our referral chart agrees.", r: 22, rt: 19, lk: 301 },
  { u: "emma", t: "3h", x: "Brewlog finished #3 on the weekly board 🍺 Podium Finish unlocked. Thank you to every founder who upvoted.", r: 15, rt: 5, lk: 133 },
];

// Trust strip: a quiet ticker of platform events.
export const EVENTS: [PersonKey, string, string][] = [
  ["nadia", "launched", "TinyInvoice"], ["rohan", "verified the badge on", "loopmail.io"],
  ["priya", "finished #2 with", "Plotline"], ["marcus", "is open to", "investment"],
  ["yuki", "posted a build update for", "Formcraft"], ["daniel", "joined and followed", "12 founders"],
  ["emma", "unlocked", "Podium Finish"], ["sofia", "reposted", "TinyInvoice"],
  ["arjun", "started a", "7-day streak"], ["liam", "bookmarked", "Brewlog"],
];

export const STORIES: { u: PersonKey; prod: string; url: string; lg: string; c: string; m: string; ms: string; q: string; feat?: boolean }[] = [
  { u: "rohan", prod: "Loopmail", url: "loopmail.io", lg: "LM", c: "#00BA7C", m: "DR 9 → 28", ms: "in 8 months", q: "Product Hunt gave us one good day. The badge took two minutes to add, and that dofollow link is still our #2 referrer eight months later." },
  { u: "priya", prod: "Plotline", url: "plotline.so", lg: "PL", c: "#7856FF", m: "Top 3", ms: "on the weekly board · Week 6", q: "I posted build updates in the feed all week. By Sunday Plotline was on the podium, and I had 40 new followers who actually ship.", feat: true },
  { u: "yuki", prod: "Formcraft", url: "formcraft.app", lg: "FC", c: "#FF7A00", m: "10 beta users", ms: "from one launch thread", q: "The replies under my launch post were the best part. I found my first ten beta customers right there, then moved to DMs." },
];

export type FaqCat = "links" | "launch" | "plans" | "start";
export const FAQ_CATS: Record<FaqCat, string> = { links: "Backlinks", launch: "Launchpad", plans: "Plans", start: "Getting started" };
export const FAQ: [FaqCat, string, string][] = [
  ["links", "How do I get a dofollow link?", "Add the “Featured on OnlyFounders” badge to your site, then press Verify. We check your page for the badge and switch your listing link from nofollow to dofollow. It works on every plan, including Free."],
  ["links", "What is the difference between dofollow and nofollow?", "A nofollow link carries rel=\"nofollow\", which tells search engines not to pass authority through it. Most launch sites and social networks use nofollow on every link. A verified OnlyFounders listing doesn’t, so it counts toward your domain’s authority."],
  ["links", "Do the links expire?", "No. Your product page stays up and keeps its dofollow link as long as the badge stays on your site. We only remove listings that break the content rules, such as spam or products that no longer exist."],
  ["launch", "How does the weekly Launchpad work?", "Each board runs Monday to Sunday. Products are ranked by upvotes from founders, there is a theme challenge each week, and the makers of the top 3 products earn the Podium Finish achievement."],
  ["launch", "How soon will my DR move?", "DR tools such as Ahrefs usually pick up a new link within 2 to 6 weeks, depending on how often they recrawl. Your product page is added to our sitemap when it goes live, so it gets found quickly."],
  ["launch", "Is it only for launches?", "No. OnlyFounders is a full social network: a For you and Following feed, likes, reposts, bookmarks, real-time messages, and profiles with achievements, streaks, and “Open to” badges."],
  ["plans", "Are Starter and Pro subscriptions?", "No. Both are one-time payments per product. Starter adds a verified badge, priority review, and launch day support. Pro adds 30 days of featured homepage placement, a newsletter mention, and a category spotlight."],
  ["start", "Can I list something that hasn’t launched yet?", "Yes. Betas, waitlists, and MVPs are welcome. Every listing gets a quick review before it goes live, and Starter and Pro listings are reviewed first."],
  ["start", "What do I need to get started?", "A website and about five minutes. Paste your URL and we import the name, tagline, and logo. Add details and screenshots, place the badge, and you’re on the board. No card is needed for the Free plan."],
];

export const PLANS = [
  { name: "Free", for: "Get your product listed and discovered.", price: "$0", per: "forever", cta: "Get started", href: "/register",
    items: ["Product listing on the weekly Launchpad", "Dofollow link once you verify the site badge", "Community upvotes and comments", "Founder profile, feed, and messages"] },
  { name: "Starter", for: "Perfect for your launch week.", price: "$9.80", per: "one-time", cta: "Launch now", href: "/submit?plan=starter", feat: true,
    items: ["Everything in Free", "Verified badge on your listing", "Priority review", "Launch day support"] },
  { name: "Pro", for: "Maximum visibility for your launch.", price: "$79", per: "one-time", cta: "Go Pro", href: "/submit?plan=pro",
    items: ["Everything in Starter", "Featured homepage placement for 30 days", "Newsletter mention", "Category page spotlight"] },
];

export const NAV_LINKS = [
  { href: "#reel", label: "Product tour" }, { href: "#platform", label: "Platform" }, { href: "#how", label: "How it works" },
  { href: "#stories", label: "Stories" }, { href: "#pricing", label: "Pricing" }, { href: "#faq", label: "FAQ" },
];

export const fmt = (n: number) => n.toLocaleString("en-US");
export const kfmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n));
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
