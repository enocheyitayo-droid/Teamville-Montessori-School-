import {requireSchoolAccount} from "@/lib/teamville-school/auth";
import {setSchoolPassword,schoolSignOut} from "@/lib/teamville-school/actions";
import {SchoolSubmit} from "@/components/school-submit";
import {PasswordField} from '../_components/password-field';
export default async function SchoolSetup({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {member}=await requireSchoolAccount(true),q=await searchParams;
  return <main id="main-content" className="sp-login"><span className="sp-eyebrow">Welcome, {member.name}{member.username?` · ${member.username}`:''}</span><h1>Choose your password.</h1><p>Choose a new, unique password of at least 12 characters. Your temporary password must be replaced before the dashboard opens.</p>{q.error&&<p className="sp-alert" role="alert">Use matching new passwords of 12–128 characters, different from the temporary password. If it has expired, ask the administrator to reset it.</p>}<form action={setSchoolPassword} className="sp-form"><PasswordField label="New password" name="password" minLength={12} autoComplete="new-password"/><PasswordField label="Confirm password" name="confirmation" minLength={12} autoComplete="new-password"/><SchoolSubmit pendingLabel="Saving password…">Save password & open dashboard</SchoolSubmit></form><form action={schoolSignOut}><p className="sp-small">Signing in for someone else? Sign out before using another staff member’s details.</p><button type="submit" className="sp-button sp-secondary">Sign out</button></form></main>;
}
