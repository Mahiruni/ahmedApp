import type { MetadataRoute } from "next";

const origin = "https://biloo.hisabtechnologies.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/privacy", "/terms"],
      disallow: [
        "/admin/",
        "/api/",
        "/biloo/",
        "/driver/",
        "/onboarding/",
        "/vendor/",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
