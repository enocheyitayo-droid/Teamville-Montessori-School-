import Image from "next/image";
import s from "./school-website.module.css";
export function TeamvilleLoading() {
  return <main className={`${s.site} ${s.logoLoading}`} id="main-content" aria-busy="true">
    <div className={s.loadingEmblem}><Image src="/brand/teamville-logo.png" alt="" width={110} height={110}/></div>
    <strong role="status">Teamville Montessori School</strong>
  </main>;
}
