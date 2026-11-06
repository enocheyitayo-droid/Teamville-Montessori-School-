"use server";
import {validPaymentPurpose} from './payment-purpose';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireSchoolAccount,requireSchoolAdmin} from './auth';
import {currentSchoolSession} from './model';
import {validMemberId} from './access-input';
import {parseKobo,validTerm,validDate} from './operations';
import {randomUUID} from 'node:crypto';
import {validLessonPdf} from './lesson-pdf';
const text=(f:FormData,k:string)=>String(f.get(k)??'').trim();
const finish=(path:string,ok:boolean):never=>{revalidatePath('/school','layout');redirect(`${path}${path.includes('?')?'&':'?'}${ok?'saved=1':'error=check'}`);};
async function teaching(){const account=await requireSchoolAccount();if(!['admin','teacher'].includes(account.member.role))redirect('/school');return account;}
export async function saveAttendance(f:FormData){
 const {client}=await teaching(),className=text(f,'class'),date=validDate(f.get('date')),term=validTerm(f.get('term'));
 const path=`/school/teaching?tab=attendance&class=${encodeURIComponent(className)}&date=${date || ''}&term=${term || 1}`;
 const ids=f.getAll('pupil_id').map(String);if(!date||!term||!ids.length||ids.length>150||ids.some(id=>!validMemberId(id))||new Set(ids).size!==ids.length)finish(path,false);
 const rows=ids.map(id=>({id,status:text(f,`status_${id}`)}));
 const r=await client.rpc('teamville_save_attendance',{p_class:className,p_date:date,p_session:currentSchoolSession,p_term:term,p_rows:rows});finish(path,!r.error);
}
export async function saveLesson(f:FormData){
 const {client,member}=await teaching(),className=text(f,'class'),term=validTerm(f.get('term')),week=validDate(f.get('week')),id=text(f,'id');
 const path=`/school/teaching?tab=lessons&class=${encodeURIComponent(className)}`;
 if(!term||!week||(id&&!validMemberId(id)))finish(path,false);
 const file=f.get('pdf');let attachment:string|null=null,name:string|null=null,size:number|null=null,oldPath:string|null=null;
 if(file instanceof File&&file.size){
  if(file.size>3*1024*1024)finish(path,false);const bytes=new Uint8Array(await file.arrayBuffer());if(!validLessonPdf(file.name,file.type,bytes))finish(path,false);
  const access=await client.rpc('teamville_can_teach',{p_class:className});if(access.error||!access.data)finish(path,false);
  if(id){const old=await client.from('teamville_lesson_notes').select('pdf_path,author,state').eq('id',id).maybeSingle();if(old.error||!old.data||old.data.author!==member.user_id||!['draft','returned'].includes(old.data.state))finish(path,false);oldPath=old.data?.pdf_path||null;}
  attachment=`${member.user_id}/${randomUUID()}.pdf`;name=file.name.replace(/[\r\n\x00-\x1f]/g,'').slice(-160);size=file.size;
  const uploaded=await client.storage.from('teamville-lesson-pdfs').upload(attachment,bytes,{contentType:'application/pdf',upsert:false});if(uploaded.error)finish(path,false);
 }
 const r=await client.rpc('teamville_save_lesson_pdf',{p_id:id||null,p_class:className,p_session:currentSchoolSession,p_term:term,p_week:week,p_subject:text(f,'subject'),p_title:text(f,'title'),p_body:text(f,'body'),p_submit:text(f,'intent')==='submit',p_path:attachment,p_name:name,p_size:size});
 if(r.error&&attachment)await client.storage.from('teamville-lesson-pdfs').remove([attachment]);
 if(!r.error&&oldPath&&attachment)await client.storage.from('teamville-lesson-pdfs').remove([oldPath]);finish(path,!r.error);
}
export async function createAssessment(f:FormData){
 const {client}=await requireSchoolAdmin(),className=text(f,'class'),term=validTerm(f.get('term')),max=Number(f.get('max'));
 const path=`/school/teaching?tab=scores&class=${encodeURIComponent(className)}`;
 if(!term||!Number.isFinite(max)||max<=0||max>1000)finish(path,false);
 const r=await client.rpc('teamville_create_assessment',{p_class:className,p_session:currentSchoolSession,p_term:term,p_subject:text(f,'subject'),p_title:text(f,'title'),p_component:text(f,'component'),p_max:max});finish(path,!r.error);
}
export async function saveScores(f:FormData){
 const {client}=await teaching(),id=text(f,'assessment'),ids=f.getAll('pupil_id').map(String),className=text(f,'class');
 const path=`/school/teaching?tab=scores&class=${encodeURIComponent(className)}&assessment=${id}`;
 if(!validMemberId(id)||!ids.length||ids.length>150||ids.some(v=>!validMemberId(v))||new Set(ids).size!==ids.length)finish(path,false);
 const r=await client.rpc('teamville_save_scores',{p_assessment:id,p_rows:ids.map(p=>({id:p,score:text(f,`score_${p}`)})),p_submit:text(f,'intent')==='submit'});finish(path,!r.error);
}
export async function reviewSchoolWork(f:FormData){
 const {client}=await requireSchoolAdmin(),id=text(f,'id'),kind=text(f,'kind');if(!validMemberId(id)||!['lesson','assessment'].includes(kind))finish('/school/teaching',false);
 const r=await client.rpc('teamville_review_work',{p_kind:kind,p_id:id,p_approve:text(f,'decision')==='approve',p_note:text(f,'note')});finish(`/school/teaching?tab=${kind==='lesson'?'lessons':'scores'}`,!r.error);
}
export async function issueFeeBill(f:FormData){
 const {client}=await requireSchoolAdmin(),id=text(f,'request_id'),pupil=text(f,'pupil'),term=validTerm(f.get('term')),amount=parseKobo(f.get('amount')),due=validDate(f.get('due'));
 if(!validMemberId(id)||!validMemberId(pupil)||!term||!amount||!due||f.get('verified')!=='yes')finish('/school/finance',false);
 const r=await client.rpc('teamville_issue_bill',{p_id:id,p_pupil:pupil,p_session:currentSchoolSession,p_term:term,p_description:text(f,'description'),p_amount:amount,p_due:due});finish('/school/finance',!r.error);
}
export async function issueClassBills(f:FormData){
 const {client}=await requireSchoolAdmin(),id=text(f,'request_id'),term=validTerm(f.get('term')),amount=parseKobo(f.get('amount')),due=validDate(f.get('due'));
 if(!validMemberId(id)||!term||!amount||!due||f.get('verified')!=='yes')finish('/school/finance',false);
 const r=await client.rpc('teamville_issue_class_bills',{p_request:id,p_class:text(f,'class'),p_session:currentSchoolSession,p_term:term,p_description:text(f,'description'),p_amount:amount,p_due:due});finish('/school/finance',!r.error);
}
export async function recordFeePayment(f:FormData){
 const {client}=await requireSchoolAdmin(),id=text(f,'request_id'),bill=text(f,'bill'),amount=parseKobo(f.get('amount')),date=validDate(f.get('date'));
 const path=`/school/finance?bill=${bill}`;
 if(!validMemberId(id)||!validMemberId(bill)||!amount||!date||f.get('verified')!=='yes')finish(path,false);
 const purpose=validPaymentPurpose(f.get('purpose')||'Other / combined fees'),target=await client.from('teamville_fee_bills').select('pupil_id').eq('id',bill).maybeSingle();if(!purpose||target.error||!target.data)return finish(path,false);
 const r=await client.rpc('teamville_record_itemised_payment',{p_id:id,p_pupil:target.data.pupil_id,p_bill:bill,p_amount:amount,p_date:date,p_method:text(f,'method'),p_reference:text(f,'reference'),p_purpose:purpose,p_note:text(f,'note')});finish(path,!r.error);
}
export async function voidFeeRecord(f:FormData){
 const {client}=await requireSchoolAdmin(),id=text(f,'id'),kind=text(f,'kind');if(!validMemberId(id)||!['bill','payment'].includes(kind))finish('/school/finance',false);
 const r=await client.rpc('teamville_void_finance',{p_kind:kind,p_id:id,p_reason:text(f,'reason')});finish('/school/finance',!r.error);
}
