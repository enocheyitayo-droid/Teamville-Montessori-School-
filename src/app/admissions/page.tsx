import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";
export const metadata = websiteMetadata("/admissions","Admissions | Teamville Montessori School","Enquire about admission and arrange a visit to Teamville Montessori School.");
export default function Page(){return <SchoolWebsite page="admissions"/>;}
