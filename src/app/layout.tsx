import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { InteractionFeedbackController } from "@/components/biloo/interaction-feedback-controller";
import { SearchFocusController } from "@/components/biloo/search-focus-controller";
import { SearchMotionController } from "@/components/biloo/search-motion-controller";
import { EthiopianPhoneController } from "@/components/forms/ethiopian-phone-controller";
import { PwaRegister } from "@/components/pwa-register";

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
import "./customer-navigation-icons.css";
import "./brand-identity.css";
import "./app-entry.css";
import "./public-pages.css";
import "./oauth-homepage.css";
import "./mobile-homepage.css";
import "./phone-input.css";
import "./auth-standard.css";
import "./premium-homepage.css";
import "./role-experience.css";
import "./account-settings.css";
import "./phone-verification.css";

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
  metadataBase: new URL("https://biloo.hisabtechnologies.com"),
  title: {
    default: "BILOO Super App",
    template: "%s · BILOO",
  },
  description:
    "One beautifully connected platform for taxi booking, food delivery, supermarket shopping, construction materials, and car parts.",
  applicationName: "BILOO",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icons/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/biloo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icons/favicon-32.png",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BILOO",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
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
        <PwaRegister />
        <EthiopianPhoneController />
        <InteractionFeedbackController />
        <SearchFocusController />
        <SearchMotionController />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
