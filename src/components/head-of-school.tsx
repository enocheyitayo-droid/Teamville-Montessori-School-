import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { headOfSchool } from "@/lib/teamville-head";
import s from "./school-website.module.css";

export function HeadOfSchool({ full = false }: { full?: boolean }) {
  return <section className={`${s.section} ${s.headSection}`} aria-labelledby="head-of-school-title">
    <div className={`${s.container} ${s.headLayout} ${full ? s.headFull : ""}`}>
      <div className={s.headPortrait}>
        {headOfSchool.portrait ? <Image src={headOfSchool.portrait} alt={headOfSchool.name ? `${headOfSchool.name}, Head of School` : "Head of School"} width={1254} height={1254} sizes="(max-width:780px) 100vw,40vw"/> : <div className={s.portraitPlaceholder}><UserRound size={90} strokeWidth={1}/><span>Head of School</span><small>Portrait coming soon</small></div>}
        <span className={s.portraitCaption}>Teamville Montessori School</span>
      </div>
      <div className={s.headCopy}>
        <span className={s.label}>The people behind Teamville</span>
        <h2 id="head-of-school-title">{full ? headOfSchool.name : "Meet Our Head of School"}</h2>
        {headOfSchool.name && <p className={s.headRole}>{full ? "Head of School" : headOfSchool.name}</p>}
        <p className={s.headCredentials}>{headOfSchool.titles}</p>
        <div className={s.headBio}>{(full ? headOfSchool.introduction : headOfSchool.summary).split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        {!full && <Link className={s.navyButton} href="/head-of-school">Read more<ArrowRight size={16}/><span className={s.srOnly}> about the Head of School</span></Link>}
        {full && <div className={s.headWelcome}><h3>We would love to meet your family.</h3><p>To arrange a school visit or ask about your child’s next step, get in touch with the Teamville school office.</p><Link className={s.navyButton} href="/contact">Contact the school<ArrowRight size={16}/></Link></div>}
      </div>
    </div>
  </section>;
}
