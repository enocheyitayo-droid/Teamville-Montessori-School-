import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";
export const metadata = websiteMetadata("/learning","Nursery and grades | Teamville Montessori School","Explore Nursery 1–2 and Grades 1–5 at Teamville Montessori School.");
export default function Page(){return <SchoolWebsite page="learning"/>;}
