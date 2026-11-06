'use client';
import {useState} from 'react';
import {recordPupilPayment} from '@/lib/teamville-school/finance-actions';
import {paymentPurposes} from '@/lib/teamville-school/payment-purpose';
import {moneyKobo} from '@/lib/teamville-school/operations';
import {SchoolSubmit} from '@/components/school-submit';
import {SchoolFormFeedback} from '@/components/school-form-feedback';
export function PupilPaymentForm({pupil,request,today,bills}:{pupil:string;request:string;today:string;bills:{id:string;description:string;session:string;term:number;balance:number}[]}){
 const [billId,setBillId]=useState(bills[0]?.id||''),bill=bills.find(b=>b.id===billId);
 if(!bill)return <p className="sp-empty">There is no outstanding bill to pay. Add a missing charge below only if it has not already been billed.</p>;
 return <form action={recordPupilPayment} className="sp-form"><SchoolFormFeedback/><input name="pupil" type="hidden" value={pupil}/><input name="request_id" type="hidden" value={request}/>
 <label>Bill this payment reduces<select name="bill" value={billId} onChange={e=>setBillId(e.target.value)} required>{bills.map(b=><option key={b.id} value={b.id}>{b.description} · {b.session} Term {b.term} · {moneyKobo(b.balance)} outstanding</option>)}</select></label>
 <div className="sp-account-fields"><label>Paid for<select name="purpose" required defaultValue=""><option value="">Choose what the payment covers</option>{paymentPurposes.map(p=><option key={p}>{p}</option>)}</select></label><label>Amount paid (₦)<input key={bill.id} name="amount" type="number" min="0.01" max={bill.balance/100} step="0.01" required/></label><label>Payment date<input name="date" type="date" max={today} defaultValue={today} required/></label><label>Method<select name="method" defaultValue="cash"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="pos">POS</option></select></label><label>School receipt / bank reference<input name="reference" minLength={3} maxLength={100} required/></label><label>Payment note (optional)<input name="note" maxLength={500} placeholder="For example, part payment for books"/></label></div>
 <p className="sp-small">This records money received against the selected bill; it does not add a charge. For a payment covering several items, record separate amounts with distinct item references (for example RECEIPT123-BOOKS and RECEIPT123-SWIM), or choose Other / combined fees and describe the breakdown in the note.</p><label className="sp-check"><input name="verified" type="checkbox" value="yes" required/>I checked the amount, purpose and date against the school’s payment record.</label><SchoolSubmit pendingLabel="Recording payment…">Record pupil payment</SchoolSubmit></form>;
}
