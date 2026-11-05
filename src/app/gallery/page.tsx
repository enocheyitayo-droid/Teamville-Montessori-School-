import { websiteMetadata } from "@/lib/website-seo";
import { SchoolWebsite } from "@/components/school-website";
export const metadata = websiteMetadata("/gallery","Gallery and school stories | Teamville Montessori School","Photographs and school stories from Teamville Montessori School.");
export default function Page(){return <SchoolWebsite page="gallery"/>;}
