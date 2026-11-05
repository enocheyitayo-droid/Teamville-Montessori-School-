import { SchoolWebsite } from "@/components/school-website";
import { websiteMetadata } from "@/lib/website-seo";

export const metadata = websiteMetadata("/cookies", "Cookies and visitor analytics | Teamville Montessori School", "Understand essential cookies, optional website analytics and how to change your cookie preferences.");
export default function CookiesPage() { return <SchoolWebsite page="cookies"/>; }
