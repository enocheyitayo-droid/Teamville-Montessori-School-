import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {validMemberId} from '@/lib/teamville-school/access-input';
import {moneyKobo,billBalance,feeMethodLabel,type FeeBill,type FeePayment} from '@/lib/teamville-school/operations';
import {SchoolPrintButton} from '@/components/school-print-button';
import {readablePupilName} from '@/lib/teamville-school/model';
export default async function Receipt({params}:{params:Promise<{id:string}>}){
 const {client,member}=await requireSchoolAccount(),{id}=await params;if(!['admin','parent','student'].includes(member.role)||!validMemberId(id))notFound();
 const payment=await client.from('teamville_fee_payments').select('*').eq('id',id).maybeSingle();if(payment.error)throw new Error('Receipt unavailable.');if(!payment.data)notFound();
 const bill=await client.from('teamville_fee_bills').select('*').eq('id',payment.data.bill_id).maybeSingle();if(bill.error||!bill.data)notFound();
 const [pupil,payments]=await Promise.all([client.from('teamville_pupils').select('id,name,admission_number').eq('id',bill.data.pupil_id).maybeSingle(),client.from('teamville_fee_payments').select('*').eq('bill_id',bill.data.id)]);if(pupil.error||payments.error)throw new Error('Receipt unavailable.');if(!pupil.data)notFound();
 const lines=await client.from('teamville_fee_bill_lines').select('description,amount_kobo').eq('bill_id',bill.data.id);if(lines.error)throw new Error('Fee breakdown unavailable.');
 const p=payment.data as FeePayment,b=bill.data as FeeBill;
 const balance=billBalance(b,payments.data as FeePayment[]),voided=Boolean(p.voided_at||b.voided_at),opening=p.method==='opening_record';
 return <main id="main-content" className="sp-main sp-print-document"><div className="sp-panel-heading sp-no-print"><Link href={`/school/finance?bill=${b.id}`}>← Back to pupil bill</Link><SchoolPrintButton label="Print receipt / save PDF"/></div>
 <article className="sp-receipt">
 <header className="sp-receipt-brand"><Image src="/brand/teamville-logo.png" alt="Teamville school crest" width={78} height={78}/><div><h2>Teamville Montessori School</h2><p>16 University Crescent, Bodija, Ibadan</p><p>0803 854 8782 · teamvillemontessorischool.com</p></div></header>
 <div className="sp-receipt-title"><div><span className="sp-eyebrow">{opening?'School-confirmed opening payment':'School fees'}</span><h1>{voided?'Voided receipt':opening?'Payment confirmation':'Payment receipt'}</h1></div><span className={voided?'sp-badge sp-review':'sp-badge sp-good'}>{voided?'VOIDED':'RECORDED'}</span></div>
 <div className="sp-receipt-details"><div><span>Received for</span><strong>{readablePupilName(pupil.data.name)}</strong><p>Admission no. {pupil.data.admission_number||'Not supplied'}</p></div><div><span>Receipt number</span><strong>TV-{p.id.toUpperCase()}</strong><p>{b.session} · Term {b.term}</p></div><div><span>Payment date</span><strong>{p.payment_date_verified===false?'Original date not supplied':p.payment_date}</strong></div><div><span>Payment method</span><strong>{feeMethodLabel(p.method)}</strong></div></div>
 <div className="sp-receipt-amount"><span>Amount recorded on this receipt</span><strong>{moneyKobo(Number(p.amount_kobo))}</strong></div>
 <h3>Assigned fee breakdown</h3><p className="sp-small">{b.description}</p><table className="sp-receipt-lines"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>{lines.data.length?lines.data.map((line,i)=><tr key={i}><td>{line.description}</td><td>{moneyKobo(Number(line.amount_kobo))}</td></tr>):<tr><td>{b.description}</td><td>{moneyKobo(Number(b.amount_kobo))}</td></tr>}</tbody><tfoot><tr><th>Total billed</th><td>{moneyKobo(Number(b.amount_kobo))}</td></tr></tfoot></table>
 <div className="sp-receipt-balance"><div><span>Total recorded payments on this bill</span><strong>{moneyKobo((payments.data as FeePayment[]).filter(x=>!x.voided_at).reduce((n,x)=>n+Number(x.amount_kobo),0))}</strong></div><div><span>Current outstanding on this bill</span><strong>{moneyKobo(balance)}</strong></div></div>
 {p.voided_at&&<p role="alert">Payment voided: {p.void_reason}. This payment does not count towards the balance.</p>}{b.voided_at&&<p>Bill voided: {b.void_reason}.</p>}
 <footer className="sp-receipt-foot"><p><strong>School reference:</strong> {p.reference}</p><p>{opening?'This confirms the school-reported opening payment against the assigned fees. The original payment date and cash or bank method were not supplied.':'This receipt confirms a payment recorded by the school.'} Current totals include subsequent payments and corrections on this bill; they may differ from the balance at the time of payment.</p><p>Generated from the private school ledger · Retain this receipt for your records.</p></footer>
 </article></main>;
}
