import type {SupabaseClient} from '@supabase/supabase-js';
import {billBalance,type FeeBill,type FeePayment,feeMethodLabel} from './operations';
export async function loadPupilStatement(client:SupabaseClient,id:string){
 const [pupil,bills]=await Promise.all([client.from('teamville_pupils').select('id,name,admission_number,current_class').eq('id',id).maybeSingle(),client.from('teamville_fee_bills').select('*').eq('pupil_id',id).order('session').order('term').order('created_at')]);
 if(pupil.error||bills.error)throw new Error('Unable to load fee statement.');
 if(!pupil.data)return null;
 const ids=bills.data.map(b=>b.id);
 const [payments,lines]=ids.length?await Promise.all([client.from('teamville_fee_payments').select('*').in('bill_id',ids).order('payment_date').order('created_at'),client.from('teamville_fee_bill_lines').select('bill_id,description,amount_kobo').in('bill_id',ids)]):[{data:[],error:null},{data:[],error:null}];
 if(payments.error||lines.error)throw new Error('Unable to load statement payments.');
 return {pupil:pupil.data,bills:bills.data as FeeBill[],payments:payments.data as FeePayment[],lines:lines.data as {bill_id:string;description:string;amount_kobo:number}[]};
}
export type PupilStatement=NonNullable<Awaited<ReturnType<typeof loadPupilStatement>>>;
export function statementTotals(bills:FeeBill[],payments:FeePayment[]){
 const active=bills.filter(b=>!b.voided_at),ids=new Set(active.map(b=>b.id));
 return {billed:active.reduce((n,b)=>n+Number(b.amount_kobo),0),paid:payments.filter(p=>!p.voided_at&&ids.has(p.bill_id)).reduce((n,p)=>n+Number(p.amount_kobo),0),balance:active.reduce((n,b)=>n+billBalance(b,payments),0)};
}
export function statementCsvRows(s:PupilStatement):unknown[][]{
 const rows:unknown[][]=[['Record type','Pupil','Admission number','Class','Session','Term','Bill / charge','Paid for','Payment date','Method','Reference','Charge NGN','Payment NGN','Outstanding NGN','Status','Note']];
 for(const b of s.bills){
  const base=[s.pupil.name,s.pupil.admission_number||'',s.pupil.current_class||'',b.session,b.term,b.description];
  rows.push(['Bill',...base,'','','','',(Number(b.amount_kobo)/100).toFixed(2),'',(billBalance(b,s.payments)/100).toFixed(2),b.voided_at?'Voided':'Active',s.lines.filter(l=>l.bill_id===b.id).map(l=>`${l.description}: NGN ${(Number(l.amount_kobo)/100).toFixed(2)}`).join('; ')]);
  for(const p of s.payments.filter(p=>p.bill_id===b.id))rows.push(['Payment',...base,p.purpose||b.description,p.payment_date_verified===false?'Not supplied':p.payment_date,feeMethodLabel(p.method),p.reference,'',(Number(p.amount_kobo)/100).toFixed(2),'',p.voided_at||b.voided_at?'Voided':'Recorded',p.note||'']);
 }
 return rows;
}
