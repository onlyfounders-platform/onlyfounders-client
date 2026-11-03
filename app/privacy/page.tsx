"use client";
import LegalPage from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026" sections={[
      { heading: "What we collect", body: ["Your name, username, email, profile details, and the content you create (posts, replies, products, messages). We also record activity dates to power streaks and your contribution heatmap, and sign-in times and devices for security alerts."] },
      { heading: "How we use it", body: ["To run the platform, show your profile and launches, send notifications you’ve opted into, keep accounts secure, and process payments through Paddle."] },
      { heading: "Emails", body: ["We send transactional emails (sign-in codes, security alerts, receipts) and activity emails (messages, followers, replies, launches). Every non-essential email has an unsubscribe link, and you can control each type in Settings → Notifications."] },
      { heading: "Your controls", body: ["Choose who can message you, whether you appear in search, and whether your activity and follower lists are visible in Settings → Privacy and safety. Mute or block anyone at any time.", "Download an archive of your data or delete your account from Settings → Your account."] },
    ]} />
  );
}
