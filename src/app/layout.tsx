import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import "./brand-overrides.css";
import "./navigation.css";
import "./google-maps.css";
import "./premium-system.css";
import "./final-polish.css";
import "./notifications.css";
import "./analytics-polish.css";
import "./award-experience.css";
import "./clarity-fix.css";
import "./signature-color.css";

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
  themeColor: "#5146e5",
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
