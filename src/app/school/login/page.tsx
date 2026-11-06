import Link from 'next/link';
import {redirect} from "next/navigation";
import {schoolAccount} from "@/lib/teamville-school/auth";
import {schoolSignIn} from "@/lib/teamville-school/actions";
import {SchoolSubmit} from "@/components/school-submit";
import {PasswordField} from '../_components/password-field';
export default async function SchoolLogin({searchParams}:{searchParams:Promise<{error?:string;reset?:string}>}){
  if(await schoolAccount())redirect("/school");
  const {error,reset}=await searchParams;
  return <main id="main-content" className="sp-login"><span className="sp-eyebrow">Your own school account</span><h1>Welcome to Teamville.</h1><p>School staff can use their assigned username. Other invited accounts can use their email address.</p>{reset==='done'&&<p className="sp-success" role="status">Password changed. Sign in with your new password. Previous sessions have been signed out.</p>}{error&&<p role="alert" className="sp-alert">{error==="activation"?"This activation link is invalid or has expired. Request a fresh link from the school administrator.":"Unable to sign in. Check your details, or ask the school administrator for a new temporary password."}</p>}<form action={schoolSignIn} className="sp-form"><label>Username or email<input name="email" type="text" maxLength={254} autoComplete="username" autoCapitalize="none" spellCheck={false} required/></label><PasswordField label="Password" name="password"/><SchoolSubmit pendingLabel="Signing in…">Sign in</SchoolSubmit></form><p><Link href="/school/forgot-password">Forgot your password?</Link></p><p className="sp-small">A temporary password opens password setup first. Choose your own password before accessing school records. Accounts are issued by the school administrator.</p></main>;
}
