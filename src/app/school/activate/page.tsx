import {activateSchoolAccount} from "@/lib/teamville-school/actions";
import {SchoolSubmit} from "@/components/school-submit";
import {validSchoolActivation} from "@/lib/teamville-school/model";
export default async function ActivateSchool({searchParams}:{searchParams:Promise<{token_hash?:string;type?:string}>}){
  const q=await searchParams;
  const valid=validSchoolActivation(q.token_hash || "",q.type || "");
  return <main id="main-content" className="sp-login"><span className="sp-eyebrow">Private account activation</span><h1>Your Teamville account.</h1>{valid?<><p>Continue to verify this invitation, then choose your own password. Do not share this private link.</p><form action={activateSchoolAccount} className="sp-form"><input type="hidden" name="token_hash" value={q.token_hash}/><input type="hidden" name="type" value={q.type}/><SchoolSubmit>Activate my account</SchoolSubmit></form></>:<p className="sp-alert">Request a valid invitation from the school administrator.</p>}</main>;
}
