import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";

export const metadata = websiteMetadata("/head-of-school","Meet Our Head of School | Teamville Montessori School","Meet Titilope Opeyemi Eleshinnla, Head of School at Teamville Montessori School in Ibadan.");
export default function Page() { return <SchoolWebsite page="head-of-school"/>; }
