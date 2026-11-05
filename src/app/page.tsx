import { SchoolWebsite } from "@/components/school-website";
import { websiteMetadata, schoolStructuredData } from "@/lib/website-seo";
export const metadata = websiteMetadata("/", "Teamville Montessori School | Bodija, Ibadan", "Discover Teamville Montessori School in Bodija, Ibadan. Explore nursery and primary learning, school activities, admissions and our photo gallery.");
export default function Home() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schoolStructuredData()).replace(/</g,"\u003c")}}/><SchoolWebsite/></>; }
