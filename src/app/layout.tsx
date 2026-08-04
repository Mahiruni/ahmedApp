import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { InteractionFeedbackController } from "@/components/biloo/interaction-feedback-controller";
import { SearchFocusController } from "@/components/biloo/search-focus-controller";
import { SearchMotionController } from "@/components/biloo/search-motion-controller";

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
import "./hero-service-motion.css";
import "./responsive-shell.css";
import "./search-experience.css";
import "./motion-boundaries.css";
import "./cart-experience.css";
import "./payment-experience.css";
import "./post-order-experience.css";
import "./operations-experience.css";
import "./completion-system.css";
import "./dark-surface-contrast.css";
import "./interaction-feedback.css";
import "./search-standard-fix.css";
import "./live-location.css";
import "./customer-signup.css";
import "./customer-navigation.css";

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
  viewportFit: "cover",
  themeColor: "#5146e5",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bilooSans.variable} ${bilooDisplay.variable}`}>
        <InteractionFeedbackController />
        <SearchFocusController />
        <SearchMotionController />
        {children}
      </body>
    </html>
  );
}
