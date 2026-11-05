export const officialSiteOrigin = "https://teamvillemontessorischool.com";
export const publicWebsitePaths = ["/", "/about", "/learning", "/activities", "/admissions", "/gallery", "/head-of-school", "/contact", "/school-portal", "/cookies"];

export function siteOrigin() {
  try {
    const configured = new URL(process.env.NEXT_PUBLIC_SITE_URL || officialSiteOrigin);
    return configured.protocol === "https:" && !["localhost", "127.0.0.1"].includes(configured.hostname) ? configured.origin : officialSiteOrigin;
  } catch { return officialSiteOrigin; }
}
export function publicPath(pathname: string) { return publicWebsitePaths.includes(pathname.replace(/\/$/, "") || "/"); }
export function analyticsMeasurementId(value: string | undefined) { return /^G-[A-Z0-9]+$/.test(value || "") ? value! : null; }
export function analyticsPermitted(pathname: string, consent: string, hostname: string, measurementId: string | null, production: boolean) {
  return Boolean(production && measurementId && consent === "granted" && publicPath(pathname) && ["teamvillemontessorischool.com", "www.teamvillemontessorischool.com"].includes(hostname));
}
export function googleVerification(value: string | undefined) { return value && /^[A-Za-z0-9_-]{10,200}$/.test(value) ? value : undefined; }
