import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";
export const metadata = websiteMetadata("/activities","School activities | Teamville Montessori School","Discover Cultural Day, celebrations and school life at Teamville.");
export default function Page(){return <SchoolWebsite page="activities"/>;}
