import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {validMemberId} from '@/lib/teamville-school/access-input';
import {moneyKobo,billBalance,type FeeBill,type FeePayment} from '@/lib/teamville-school/operations';
import {SchoolPrintButton} from '@/components/school-print-button';
import {readablePupilName} from '@/lib/teamville-school/model';
export default async function Receipt({params}:{params:Promise<{id:string}>}){
 const {client,member}=await requireSchoolAccount(),{id}=await params;if(!['admin','parent','student'].includes(member.role)||!validMemberId(id))notFound();
 const payment=await client.from('teamville_fee_payments').select('*').eq('id',id).maybeSingle();if(payment.error)throw new Error('Receipt unavailable.');if(!payment.data)notFound();
 const bill=await client.from('teamville_fee_bills').select('*').eq('id',payment.data.bill_id).maybeSingle();if(bill.error||!bill.data)notFound();
 const [pupil,payments]=await Promise.all([client.from('teamville_pupils').select('id,name,admission_number').eq('id',bill.data.pupil_id).maybeSingle(),client.from('teamville_fee_payments').select('*').eq('bill_id',bill.data.id)]);if(pupil.error||payments.error)throw new Error('Receipt unavailable.');if(!pupil.data)notFound();
 const p=payment.data as FeePayment,b=bill.data as FeeBill;
 return <main id="main-content" className="sp-main"><div className="sp-no-print"><Link href={`/school/finance?bill=${b.id}`}>Back to pupil bill</Link><SchoolPrintButton label="Print receipt / save PDF"/></div><article className="sp-panel"><p>Teamville Montessori School · Bodija, Ibadan</p><h1>{p.voided_at||b.voided_at?'VOIDED PAYMENT RECEIPT':'Payment receipt'}</h1><p>Receipt number: TV-{p.id.toUpperCase()}</p><h2>{readablePupilName(pupil.data.name)}</h2><p>Admission number: {pupil.data.admission_number||'Not supplied'} · {b.session} · Term {b.term}</p><div className="sp-statement"><span>Payment received<strong>{moneyKobo(Number(p.amount_kobo))}</strong></span><span>Date received<strong>{p.payment_date}</strong></span><span>Method<strong>{p.method.replace('_',' ')}</strong></span></div><p>For: <strong>{b.description}</strong></p><p>Bank / school cash receipt reference: {p.reference}</p>{p.voided_at&&<p role="alert">This payment was voided: {p.void_reason}. It does not count towards the balance.</p>}{b.voided_at&&<p>This bill was voided: {b.void_reason}.</p>}<p>Bill amount: {moneyKobo(Number(b.amount_kobo))}</p><p>Current outstanding on this bill: {moneyKobo(billBalance(b,payments.data as FeePayment[]))}</p><p className="sp-small">The outstanding amount reflects all payments and corrections currently recorded for this bill. This receipt acknowledges a school-verified payment; it does not initiate a transfer.</p></article></main>;
}
