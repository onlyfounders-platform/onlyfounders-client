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
    icon: "/logofavicon.png",
    shortcut: "/logofavicon.png",
    apple: "/logofavicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('fp_theme')==='light'?'light':'dark'}catch{}` }} /></head>
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
