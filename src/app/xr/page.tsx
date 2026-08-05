import type { Metadata } from "next";

import { BilooXrExperience } from "@/components/xr/biloo-xr-experience";

export const metadata: Metadata = {
  title: "BILOO Spatial for Galaxy XR",
  description:
    "Launch BILOO services in an immersive WebXR workspace optimized for Samsung Galaxy XR and Android XR headsets.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function BilooXrPage() {
  return <BilooXrExperience />;
}
