'use server';
import {requireSchoolAdmin} from './auth';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {validMemberId} from './access-input';
import {currentSchoolSession} from './model';
import {validDate,validTerm,parseKobo} from './operations';
import {validPaymentPurpose} from './payment-purpose';
import {parseExpenseCsv} from './expense-csv';
function done(path:string,ok:boolean):never{revalidatePath('/school','layout');redirect(path+(ok?'?saved=1':'?error=check'));}
export async function issueSelectedBills(f:FormData){
 const {client}=await requireSchoolAdmin(),ids=f.getAll('pupil').map(String),request=String(f.get('request_id')),term=validTerm(f.get('term')),amount=parseKobo(f.get('amount')),due=validDate(f.get('due'));
 if(!validMemberId(request)||!ids.length||ids.length>200||ids.some(id=>!validMemberId(id))||!term||!amount||!due||f.get('verified')!=='yes')done('/school/finance',false);
 const r=await client.rpc('teamville_issue_selected_bills',{p_request:request,p_pupils:ids,p_session:currentSchoolSession,p_term:term,p_description:String(f.get('description')||'').trim(),p_amount:amount,p_due:due});done('/school/finance',!r.error);
}
export async function importSchoolExpenses(f:FormData){
 const {client}=await requireSchoolAdmin(),file=f.get('file'),id=String(f.get('request_id'));
 if(!validMemberId(id)||!(file instanceof File)||!file.name.toLowerCase().endsWith('.csv')||file.size>250000||f.get('checked')!=='yes')done('/school/purse',false);
 let rows;try{rows=parseExpenseCsv(await file.text());}catch{done('/school/purse',false);}
 const r=await client.rpc('teamville_import_expenses',{p_request:id,p_rows:rows});done('/school/purse',!r.error);
}
export async function updateOpeningPayment(f:FormData){
 const {client}=await requireSchoolAdmin(),id=String(f.get('pupil')||''),value=String(f.get('amount')||'').trim(),amount=value==='0'?0:parseKobo(value);
 if(!validMemberId(id))done('/school/finance',false);
 const path=`/school/pupils/${id}`;
 if(amount===null||f.get('checked')!=='yes')done(path,false);
 const r=await client.rpc('teamville_update_opening_payment',{p_pupil:id,p_paid:amount,p_checked:true});done(path,!r.error);
}

export async function recordPupilPayment(f:FormData){
 const {client}=await requireSchoolAdmin(),pupil=String(f.get('pupil')||''),bill=String(f.get('bill')||''),id=String(f.get('request_id')||''),amount=parseKobo(f.get('amount')),date=validDate(f.get('date')),purpose=validPaymentPurpose(f.get('purpose')),note=String(f.get('note')||'').trim();
 if(!validMemberId(pupil))done('/school/finance',false);
 const path=`/school/pupils/${pupil}`;
 if(!validMemberId(id)||!validMemberId(bill)||!amount||!date||!purpose||note.length>500||f.get('verified')!=='yes')done(path,false);
 const r=await client.rpc('teamville_record_itemised_payment',{p_id:id,p_pupil:pupil,p_bill:bill,p_amount:amount,p_date:date,p_method:String(f.get('method')||''),p_reference:String(f.get('reference')||'').trim(),p_purpose:purpose,p_note:note});done(path,!r.error);
}
export async function addPupilCharge(f:FormData){
 const {client}=await requireSchoolAdmin(),pupil=String(f.get('pupil')||''),id=String(f.get('request_id')||''),term=validTerm(f.get('term')),amount=parseKobo(f.get('amount')),due=validDate(f.get('due')),purpose=validPaymentPurpose(f.get('purpose'));
 if(!validMemberId(pupil))done('/school/finance',false);
 const path=`/school/pupils/${pupil}`;
 if(!validMemberId(id)||!term||!amount||!due||!purpose||f.get('verified')!=='yes')done(path,false);
 const r=await client.rpc('teamville_issue_selected_bills',{p_request:id,p_pupils:[pupil],p_session:currentSchoolSession,p_term:term,p_description:purpose,p_amount:amount,p_due:due});done(path,!r.error);
}
