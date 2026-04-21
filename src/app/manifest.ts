import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mrGlassFinance",
    short_name: "mrFinance",
    description: "Personal finance and budgeting SaaS",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [{ src: "/next.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
