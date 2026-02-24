import type { MetadataRoute } from "next";
import { getAllBenefitSlugs } from "@/lib/welfare-api";

const BASE_URL = "https://silverfit.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllBenefitSlugs();

  const benefitPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/benefits/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/benefits`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/recommend`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/insurance`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...benefitPages,
  ];
}
