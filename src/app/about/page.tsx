import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";
export const metadata = websiteMetadata("/about","Our school | Teamville Montessori School","Meet the Teamville Montessori School community in Ibadan.");
export default function Page(){return <SchoolWebsite page="about"/>;}
