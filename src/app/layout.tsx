import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BILOO Super App",
    template: "%s · BILOO",
  },
  description:
    "One connected platform for taxi booking, food delivery, supermarket shopping, construction materials, and car parts.",
  applicationName: "BILOO",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#082640",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
