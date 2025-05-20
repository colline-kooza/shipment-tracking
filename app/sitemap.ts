import { siteConfig } from "@/config/site";
export default async function sitemap() {
  const baseUrl = siteConfig.url;
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];
}
