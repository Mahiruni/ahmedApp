import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import "./brand-overrides.css";
import "./navigation.css";
import "./google-maps.css";
import "./premium-system.css";
import "./final-polish.css";

const bilooSans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-biloo-sans",
});

const bilooDisplay = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-biloo-display",
});

export const metadata: Metadata = {
  title: {
    default: "BILOO Super App",
    template: "%s · BILOO",
  },
  description:
    "One beautifully connected platform for taxi booking, food delivery, supermarket shopping, construction materials, and car parts.",
  applicationName: "BILOO",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bilooSans.variable} ${bilooDisplay.variable}`}>
        {children}
      </body>
    </html>
  );
}
