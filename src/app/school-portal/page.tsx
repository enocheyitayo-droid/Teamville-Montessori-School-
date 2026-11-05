import { websiteMetadata } from "@/lib/website-seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, HeartHandshake, UsersRound } from "lucide-react";
import { schoolPortals } from "@/lib/teamville-portals";
import s from "@/components/school-website.module.css";

export const metadata = websiteMetadata("/school-portal", "School portal | Teamville Montessori School", "Sign in to the Teamville staff portal. Family accounts are provided by the school when ready.");

export default function SchoolPortal() {
  return <div className={s.site}><main id="main-content" className={s.portalPage}>
    <Link href="/" className={s.returnLink}><ArrowLeft size={16}/>Back to the school website</Link>
    <Image src="/brand/teamville-logo.png" alt="Teamville Montessori School" width={100} height={100}/>
    <p>Teamville Montessori School</p>
    <span className={s.comingSoon}>School portal</span>
    <h1>A more connected school day.</h1>
    <p>Staff with an issued school account can sign in now. The school will provide parents and pupils with access when their accounts are ready.</p>
    <div className={s.portalChoices}>
      {schoolPortals.map((portal, index) => {
        const Icon = [HeartHandshake, UsersRound, GraduationCap][index];
        return <article className={s.portalChoice} key={portal.role}>
          <Icon size={30}/><h2>{portal.role} portal</h2><p>{portal.description}</p>{portal.role==='Staff'?<Link className={s.navyButton} href="/school/login">Sign in to staff portal</Link>:<span>School invitations coming soon</span>}
        </article>;
      })}
    </div>
    <p>The school will confirm your details and provide a private invitation when your account is ready. You do not need to create an account yet.</p>
    <Link className={s.returnLink} href="/school/login">Already invited? Sign in to your school account</Link>
    <div className={s.portalActions}><a className={s.navyButton} href="tel:+2348038548782">Call the school</a><a className={s.goldButton} href="https://wa.me/2348038548782">Chat on WhatsApp</a></div>
    <a className={s.returnLink} href="mailto:teamville01montessori@gmail.com">teamville01montessori@gmail.com</a>
  </main></div>;
}
