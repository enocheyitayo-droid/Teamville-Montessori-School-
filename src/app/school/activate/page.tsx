import {activateSchoolAccount} from "@/lib/teamville-school/actions";
import {SchoolSubmit} from "@/components/school-submit";
import {validSchoolActivation} from "@/lib/teamville-school/model";
export default async function ActivateSchool({searchParams}:{searchParams:Promise<{token_hash?:string;type?:string}>}){
  const q=await searchParams;
  const valid=validSchoolActivation(q.token_hash || "",q.type || "");
  return <main id="main-content" className="sp-login"><span className="sp-eyebrow">{q.type==='recovery'?'Private password recovery':'Private account activation'}</span><h1>{q.type==='recovery'?'Reset your password.':'Your Teamville account.'}</h1>{valid?<><p>Continue to verify this private link, then choose your own password. Do not share it.</p><form action={activateSchoolAccount} className="sp-form"><input type="hidden" name="token_hash" value={q.token_hash}/><input type="hidden" name="type" value={q.type}/><SchoolSubmit>{q.type==='recovery'?'Continue to password reset':'Activate my account'}</SchoolSubmit></form></>:<p className="sp-alert">Request a valid invitation from the school administrator.</p>}</main>;
}
