import type { Metadata } from "next";
import { CookiePreferences } from "@/components/cookie-preferences";
import { WebsiteTransition } from "@/components/website-transition";
import { googleVerification, siteOrigin } from "@/lib/site-settings";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: "Teamville Montessori School | Ibadan", template: "%s | Teamville" },
  description: "Teamville Montessori School in Ibadan. Raising a total child.",
  icons: { icon: "/brand/teamville-logo.png" },
  verification: { google: googleVerification(process.env.GOOGLE_SITE_VERIFICATION) },
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG"><body><a className="skip-link" href="#main-content">Skip to content</a><WebsiteTransition/>{children}<CookiePreferences/></body></html>;
}
