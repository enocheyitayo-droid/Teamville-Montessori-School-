import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-settings";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/school$", "/school?", "/school/login", "/school/activate", "/school/setup", "/school/pupils", "/school/staff", "/school/export", "/school/teaching", "/school/teacher-preview", "/school/finance", "/school/directory", "/school/student", "/school/parent", "/school/leadership", "/school/results", "/school/reports", "/school/positions", "/school/purse", "/school/salaries", "/school/notices", "/school/activity", "/school/grading", "/school/search", "/teamville-portal", "/portal", "/demo", "/dashboard", "/access", "/login", "/guide", "/preview", "/api/"] }, sitemap: `${siteOrigin()}/sitemap.xml` };
}
