import type { Metadata } from "next";
import { siteOrigin } from "./site-settings";

export function websiteMetadata(path: string, title: string, description: string): Metadata {
  return { metadataBase: new URL(siteOrigin()), title: { absolute: title }, description, alternates: { canonical: path }, robots: { index: true, follow: true }, openGraph: { title, description, url: path, siteName: "Teamville Montessori School", locale: "en_NG", type: "website", images: [{ url: "/school/class-of-2026.png", width: 2048, height: 1536, alt: "Teamville Montessori School Class of 2026" }] }, twitter: { card: "summary_large_image", title, description, images: ["/school/class-of-2026.png"] } };
}
export function schoolStructuredData() {
  return { "@context": "https://schema.org", "@type": "School", name: "Teamville Montessori School", url: siteOrigin(), logo: `${siteOrigin()}/brand/teamville-logo.png`, image: `${siteOrigin()}/school/class-of-2026.png`, telephone: "+2348038548782", email: "teamville01montessori@gmail.com", address: { "@type": "PostalAddress", streetAddress: "16 University Cres Rd", addressLocality: "Ibadan", postalCode: "200285", addressRegion: "Oyo", addressCountry: "NG" }, sameAs: ["https://www.tiktok.com/@teamville_montessorisch"] };
}
