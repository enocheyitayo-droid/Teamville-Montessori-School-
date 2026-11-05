'use server';
import {requireSchoolAdmin} from './auth';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {validMemberId} from './access-input';
import {currentSchoolSession} from './model';
import {validDate,validTerm,parseKobo} from './operations';
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
