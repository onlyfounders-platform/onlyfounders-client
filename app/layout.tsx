import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthSync from "@/components/AuthSync";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "OnlyFounders — Where founders launch and grow",
  description: "The community where founders launch products, earn backlinks, and get discovered on OnlyFounders",
  icons: {
    icon: "/brand/onlyfounders-mark.svg",
    shortcut: "/brand/onlyfounders-mark.svg",
    apple: "/brand/onlyfounders-mark.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement.dataset,l=localStorage;d.theme=l.getItem('fp_theme')==='light'?'light':'dark';d.accent=l.getItem('fp_accent')||'blue';d.font=l.getItem('fp_font')||'md';d.motion=l.getItem('fp_motion')==='1'?'reduce':'full'}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=Syne:wght@400..800&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthSync />
              {children}
            </ToastProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
