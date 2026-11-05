import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {csvCell} from '@/lib/teamville-school/export';
import {billBalance,type FeeBill,type FeePayment} from '@/lib/teamville-school/operations';
export async function GET(){
 const {client,member}=await requireSchoolAccount();if(member.role!=='admin')return Response.json({error:'Administrator access required'},{status:403});
 const [p,b,r]=await Promise.all([client.from('teamville_pupils').select('id,name,current_class'),client.from('teamville_fee_bills').select('*'),client.from('teamville_fee_payments').select('*')]);
 if(p.error||b.error||r.error)return Response.json({error:'Export unavailable'},{status:503});
 const names=new Map(p.data.map(p=>[p.id,p])),payments=r.data as FeePayment[];
 const rows:unknown[][]=[['Bill ID','Pupil','Current class','Session','Term','Description','Billed NGN','Verified paid NGN','Outstanding NGN','Due date','Voided']];
 for(const bill of b.data as FeeBill[]){const balance=billBalance(bill,payments),paid=payments.filter(p=>p.bill_id===bill.id&&!p.voided_at).reduce((n,p)=>n+Number(p.amount_kobo),0);rows.push([bill.id,names.get(bill.pupil_id)?.name,names.get(bill.pupil_id)?.current_class,bill.session,bill.term,bill.description,(Number(bill.amount_kobo)/100).toFixed(2),(paid/100).toFixed(2),(balance/100).toFixed(2),bill.due_date_verified===false?'Not supplied':bill.due_date,bill.voided_at?'yes':'no']);}
 return new Response('\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n',{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="Teamville-fee-balances.csv"','Cache-Control':'private, no-store'}});
}
