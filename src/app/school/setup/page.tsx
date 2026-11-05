import {requireSchoolAccount} from "@/lib/teamville-school/auth";
import {setSchoolPassword} from "@/lib/teamville-school/actions";
import {SchoolSubmit} from "@/components/school-submit";
export default async function SchoolSetup({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {member}=await requireSchoolAccount(true),q=await searchParams;
  return <main id="main-content" className="sp-login"><span className="sp-eyebrow">Welcome, {member.name}{member.username?` · ${member.username}`:''}</span><h1>Choose your password.</h1><p>Choose a new, unique password of at least 12 characters. Your temporary password must be replaced before the dashboard opens.</p>{q.error&&<p className="sp-alert" role="alert">Use matching new passwords of 12–128 characters, different from the temporary password. If it has expired, ask the administrator to reset it.</p>}<form action={setSchoolPassword} className="sp-form"><label>New password<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required/></label><label>Confirm password<input name="confirmation" type="password" minLength={12} maxLength={128} autoComplete="new-password" required/></label><SchoolSubmit pendingLabel="Saving password…">Save password & open dashboard</SchoolSubmit></form></main>;
}
