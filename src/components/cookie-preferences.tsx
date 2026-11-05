"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { analyticsMeasurementId, analyticsPermitted, publicPath } from "@/lib/site-settings";
import s from "./cookie-preferences.module.css";

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}
const cookieName = "teamville_cookie_choice";
const changeEvent = "teamville-cookie-change";
function readChoice() {
  if (typeof document === "undefined") return "unset";
  const value = document.cookie.split("; ").find(cookie => cookie.startsWith(`${cookieName}=`))?.split("=")[1];
  return value === "v1.granted" ? "granted" : value === "v1.denied" ? "denied" : "unset";
}
function subscribe(callback: () => void) { window.addEventListener(changeEvent, callback); return () => window.removeEventListener(changeEvent, callback); }
function clearAnalyticsCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const domain of ["", location.hostname, ".teamvillemontessorischool.com"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}${location.protocol === "https:" ? "; Secure" : ""}`;
    }
  }
}
const measurementId = analyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export function CookiePreferences() {
  const pathname = usePathname() || "/";
  const consent = useSyncExternalStore(subscribe, readChoice, () => "unset");
  const [managing, setManaging] = useState(false), [customising, setCustomising] = useState(false), [optional, setOptional] = useState(false), [ready, setReady] = useState(false);
  const lastPage = useRef<string | null>(null);
  const publicPage = publicPath(pathname);
  const allowed = analyticsPermitted(pathname, consent, typeof window === "undefined" ? "" : window.location.hostname, measurementId, process.env.NODE_ENV === "production");
  useEffect(() => {
    const open = () => { setOptional(readChoice() === "granted"); setCustomising(true); setManaging(true); };
    window.addEventListener("teamville-open-cookies", open);
    return () => window.removeEventListener("teamville-open-cookies", open);
  }, []);
  useEffect(() => {
    if (!measurementId) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = !allowed;
    if (!allowed) { lastPage.current = null; return; }
    if (!ready || !window.gtag || lastPage.current === pathname) return;
    // No query strings, activation tokens, personal identifiers or private paths are sent.
    window.gtag("event", "page_view", { send_to: measurementId, page_path: pathname, page_location: `${location.origin}${pathname}`, page_referrer: "", page_title: document.title });
    lastPage.current = pathname;
  }, [allowed, ready, pathname]);

  function save(accept: boolean) {
    const previouslyEnabled = readChoice() === "granted";
    document.cookie = `${cookieName}=v1.${accept ? "granted" : "denied"}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    if (!accept) {
      if (measurementId) (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true;
      clearAnalyticsCookies();
    }
    window.dispatchEvent(new Event(changeEvent)); setManaging(false); setCustomising(false);
    if (!accept && previouslyEnabled && window.gtag) location.reload();
  }

  return <>
    {allowed && measurementId && <Script id="teamville-ga" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" onReady={() => {
      if (!analyticsPermitted(location.pathname, readChoice(), location.hostname, measurementId, process.env.NODE_ENV === "production")) return;
      (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = false;
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => { window.dataLayer!.push(args); };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, page_location: `${location.origin}${location.pathname}`, page_referrer: "" });
      setReady(true);
    }}/>} 
    {publicPage && (consent === "unset" || managing) && <aside className={s.banner} aria-labelledby="cookie-title">
      <div><h2 id="cookie-title">Your cookie choices</h2><p>Essential cookies keep staff sign-in secure and remember your preferences. With your permission, we can use Google Analytics to understand visits to our public website. <Link href="/cookies">About cookies</Link></p>
        {customising && <div className={s.options}><label><input type="checkbox" checked disabled/>Essential cookies <span>Always on</span></label><label><input type="checkbox" checked={optional} onChange={event => setOptional(event.target.checked)}/>Optional visitor analytics</label><p>Staff and pupil portal pages are excluded from analytics.</p></div>}
      </div><div className={s.actions}><button onClick={() => save(false)}>Reject optional</button><button onClick={() => save(true)}>Accept analytics</button>{customising ? <button onClick={() => save(optional)}>Save choices</button> : <button onClick={() => { setOptional(consent === "granted"); setCustomising(true); }}>Choose settings</button>}</div>
    </aside>}
  </>;
}

export function CookieSettingsButton() { return <button type="button" className={s.settings} onClick={() => window.dispatchEvent(new Event("teamville-open-cookies"))}>Cookie settings</button>; }
