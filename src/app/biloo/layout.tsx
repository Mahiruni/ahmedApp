import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BILOO Super App",
  description:
    "BILOO brings taxi booking, food delivery, supermarket shopping, construction materials and car parts into one connected platform.",
  alternates: { canonical: "/biloo" },
  openGraph: {
    title: "BILOO — One app. Every move.",
    description:
      "A multi-service platform for mobility, delivery, shopping and local commerce.",
    url: "/biloo",
    type: "website",
  },
};

export default function BilooLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
