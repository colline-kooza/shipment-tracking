import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/private/",
        "/auth/",
        "/*.json$",
        "/login",
        "/signup",
        "/reset-password",
        "/verify-email",
        "/checkout",
        "/payment",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Replace with your domain
  };
}
