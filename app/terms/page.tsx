"use client";
import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 2026" sections={[
      { heading: "Using OnlyFounders", body: ["OnlyFounders is a launchpad and community for founders. You need an account to post, launch, upvote, comment or message. Keep your sign-in email secure — it’s how you access your account."] },
      { heading: "Your content", body: ["You own what you post. By posting, you let OnlyFounders display it on the platform and in emails about activity (for example, a launch announcement or a reply notification).", "Don’t post spam, scams, harassment, hateful content, impersonation or anything illegal. Founders can report content, and our team may remove it or suspend accounts that break these rules."] },
      { heading: "Launches and backlinks", body: ["Launches run on a weekly board. Listings are nofollow until the OnlyFounders badge is verified on your site, after which the link becomes dofollow. Removing the badge may revert the link."] },
      { heading: "Paid plans", body: ["Starter and Pro are one-time upgrades applied to a product. Payments are processed by Paddle. Refunds are handled case by case — contact support."] },
      { heading: "Ending your account", body: ["You can deactivate your account (reversible by signing in) or delete it permanently from Settings → Your account."] },
    ]} />
  );
}
