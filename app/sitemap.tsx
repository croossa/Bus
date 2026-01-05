import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.croossa.com",
      lastModified: new Date(),
    },
    {
      url: "https://www.croossa.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://www.croossa.com/contact",
      lastModified: new Date(),
    },
    {
      url: "https://www.croossa.com/bus",
      lastModified: new Date(),
    },
  ];
}
