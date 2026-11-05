import {requireSchoolAdmin} from '@/lib/teamville-school/auth';
import {expenseHeaders} from '@/lib/teamville-school/expense-csv';
import {csvCell} from '@/lib/teamville-school/export';
export async function GET(request:Request){
 const {client}=await requireSchoolAdmin(),template=new URL(request.url).searchParams.get('template')==='1';
 let rows:unknown[][]=[expenseHeaders];
 if(!template){
  const [expenses,payments]=await Promise.all([client.from('teamville_expenses').select('*').order('due_date'),client.from('teamville_expense_payments').select('*').order('payment_date')]);if(expenses.error||payments.error)return new Response('Export unavailable',{status:503});
  rows=[['Expense ID','Description','Category','Payee','Bill NGN','Due date','Verified paid NGN','Outstanding NGN','Voided','Payment history']];
  for(const e of expenses.data){const ps=payments.data.filter(p=>p.expense_id===e.id),paid=ps.filter(p=>!p.voided_at).reduce((n,p)=>n+Number(p.amount_kobo),0);rows.push([e.id,e.description,e.category,e.payee,(Number(e.amount_kobo)/100).toFixed(2),e.due_date,(paid/100).toFixed(2),e.voided_at?'0.00':((Number(e.amount_kobo)-paid)/100).toFixed(2),e.voided_at?'yes':'no',ps.map(p=>`${p.payment_date}: ${(Number(p.amount_kobo)/100).toFixed(2)} / ${p.reference}${p.voided_at?' [VOIDED]':''}`).join('; ')]);}
 }
 return new Response('\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n',{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="Teamville-expense-${template?'template':'ledger'}.csv"`,'Cache-Control':'private, no-store'}});
}
