import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BILOO — One app. Every move.",
    short_name: "BILOO",
    description:
      "Book rides and order food, groceries, construction materials and car parts from one connected app.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#17105f",
    theme_color: "#5146e5",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    categories: ["shopping", "food", "travel", "business"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/biloo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
