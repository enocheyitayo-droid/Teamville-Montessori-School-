export type LessonNote={id:string;class_name:string;session:string;term:number;week_start:string;subject:string;title:string;body:string;state:string;author:string;review_note:string|null;pdf_path?:string|null;pdf_name?:string|null;pdf_size?:number|null};
export type Assessment={id:string;class_name:string;session:string;term:number;subject:string;title:string;component:string;max_score:number;state:string;review_note:string|null};
export type FeeBill={id:string;pupil_id:string;session:string;term:number;description:string;amount_kobo:number;due_date:string;due_date_verified?:boolean;voided_at:string|null;void_reason:string|null};
export type FeePayment={id:string;bill_id:string;amount_kobo:number;payment_date:string;payment_date_verified?:boolean;method:string;reference:string;voided_at:string|null;void_reason:string|null};
export function schoolToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function moneyKobo(kobo:number){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:2}).format(kobo/100);}
export function parseKobo(value:unknown):number|null{
 const text=String(value??'').trim();if(!/^\d{1,9}(?:\.\d{1,2})?$/.test(text))return null;
 const [whole,fraction='']=text.split('.'),amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(amount)&&amount>0&&amount<=10_000_000_000?amount:null;
}
export function billBalance(bill:FeeBill,payments:FeePayment[]){return bill.voided_at?0:Number(bill.amount_kobo)-payments.filter(p=>p.bill_id===bill.id&&!p.voided_at).reduce((sum,p)=>sum+Number(p.amount_kobo),0);}
export function validTerm(value:unknown){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=3?n:null;}
export function validDate(value:unknown){const text=String(value??'');return /^\d{4}-\d{2}-\d{2}$/.test(text)&&!Number.isNaN(Date.parse(text))&&new Date(text).toISOString().slice(0,10)===text?text:null;}

export function feeMethodLabel(method:string){return method==='opening_record'?'School-confirmed opening payment':method.replace('_',' ');}
