import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthSync from "@/components/AuthSync";
import { ToastProvider } from "@/components/ui/Toast";

// Duolingo Sans and Feather are proprietary in-house typefaces we don't have
// license to self-host — Baloo 2 (rounded display weight) and Nunito (friendly
// body sans) are the closest free stand-ins, used everywhere as the only
// fonts in the product.
const baloo2 = Baloo_2({ subsets: ["latin"], variable: "--font-display" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });

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
    <html lang="en" data-theme="light" className={`${baloo2.variable} ${nunito.variable}`}>
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
