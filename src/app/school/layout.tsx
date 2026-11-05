import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {schoolAccount} from "@/lib/teamville-school/auth";
import {SchoolWorkspace} from "@/components/school-workspace";
import "./school.css";
import "./operations.css";
import "./leadership.css";
import "./search.css";
import "./demo-workspace.css";
import "./demo-refinements.css";
import "./responsiveness.css";
import "./report-search.css";
import "./family-reports.css";
import "./developer.css";
export const metadata:Metadata={title:{default:"Teamville school portal",template:"%s | Teamville portal"},robots:{index:false,follow:false},referrer:"same-origin"};
export const dynamic="force-dynamic";
export default async function SchoolLayout({children}:{children:React.ReactNode}){
  const account=await schoolAccount();
  if(account?.member.password_ready)return <div className="sp-school"><SchoolWorkspace key={`${account.member.user_id}:${account.member.role}`} member={account.member}>{children}</SchoolWorkspace></div>;
  return <div className="sp-school"><header className="sp-header"><Link href="/school" className="sp-brand"><Image src="/brand/teamville-logo.png" alt="" width={48} height={48}/><span><strong>Teamville</strong><small>School portal</small></span></Link><Link href="/" className="sp-website">Visit school website ↗</Link></header>{children}<footer className="sp-footer">Teamville Montessori School · Private school records</footer></div>;
}
