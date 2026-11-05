"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { publicPath } from "@/lib/site-settings";
import s from "./website-transition.module.css";

// Route-keyed branding also runs for instant, prefetched production navigations.
export function WebsiteTransition() {
  const pathname = usePathname();
  if (!publicPath(pathname)) return null;

  return <div key={pathname} className={s.curtain} aria-hidden="true">
    <div className={s.emblem}>
      <Image src="/brand/teamville-logo.png" alt="" width={110} height={110} loading="eager"/>
    </div>
    <strong>Teamville Montessori School</strong>
  </div>;
}
