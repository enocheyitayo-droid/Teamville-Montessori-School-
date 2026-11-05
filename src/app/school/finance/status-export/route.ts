import {requireSchoolAdmin} from '@/lib/teamville-school/auth';
import {csvCell} from '@/lib/teamville-school/export';
import {termFeeStatus,type ReportedFeeStatus} from '@/lib/teamville-school/fee-status';
import type {FeeBill,FeePayment} from '@/lib/teamville-school/operations';
export async function GET(){
 const {client}=await requireSchoolAdmin();
 const [pupils,entries,bills,payments]=await Promise.all([client.from('teamville_pupils').select('id,name,current_class').eq('enrolment_status','active').order('name'),client.from('teamville_fee_status').select('*').eq('session','2026/2027').eq('term',1),client.from('teamville_fee_bills').select('*'),client.from('teamville_fee_payments').select('*')]);
 if(pupils.error||entries.error||bills.error||payments.error)return new Response('Export unavailable',{status:503});
 const rows:unknown[][]=[['Pupil','Class','Session','Term','Fee status','Current outstanding NGN','Source balance NGN','Source as of','Breakdown']];
 for(const p of pupils.data){const e=(entries.data as ReportedFeeStatus[]).find(e=>e.pupil_id===p.id),status=termFeeStatus(p.id,e,bills.data as FeeBill[],payments.data as FeePayment[]);rows.push([p.name,p.current_class,'2026/2027',1,status.label,status.balance===null?'Not supplied':(status.balance/100).toFixed(2),e?(Number(e.reported_balance_kobo)/100).toFixed(2):'Not supplied',e?.as_of||'',e?.opening_payment_id?'School-confirmed opening payment recorded; original transaction date not supplied':e?'Earlier paid total not supplied; reported outstanding retained':'Not supplied']);}
 return new Response('\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n',{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="Teamville-Term-1-fee-status.csv"','Cache-Control':'private, no-store'}});
}
