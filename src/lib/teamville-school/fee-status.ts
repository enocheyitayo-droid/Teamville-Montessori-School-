import {billBalance,type FeeBill,type FeePayment} from './operations';
export type ReportedFeeStatus={id:string;pupil_id:string|null;session:string;term:number;source_name:string;reported_balance_kobo:number;as_of:string;opening_bill_id:string|null;opening_payment_id?:string|null;note:string};
export type FeeRate={session:string;term:number;class_name:string;category:'tuition'|'books';amount_kobo:number};
export function termFeeStatus(id:string,entry:ReportedFeeStatus|undefined,bills:FeeBill[],payments:FeePayment[],session='2026/2027',term=1){
 const bs=bills.filter(b=>b.pupil_id===id&&b.session===session&&b.term===term),active=bs.filter(b=>!b.voided_at),balance=active.reduce((n,b)=>n+billBalance(b,payments),0);
 const opening=entry?.opening_bill_id?bs.find(b=>b.id===entry.opening_bill_id):undefined;
 if(entry?.reported_balance_kobo&&(!opening||opening.voided_at))return {kind:'review' as const,balance:null,label:'Balance needs review'};
 if(balance>0)return {kind:'outstanding' as const,balance,label:'Outstanding'};
 if(entry||active.length)return {kind:'fully_paid' as const,balance:0,label:entry?'Fully paid':'Paid on recorded bills'};
 return {kind:'unknown' as const,balance:null,label:'Fee status not supplied'};
}
