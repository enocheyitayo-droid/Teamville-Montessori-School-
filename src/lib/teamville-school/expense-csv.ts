import {parseResultCsv} from './result-csv';
import {parseKobo,validDate,schoolToday} from './operations';
export const expenseHeaders=['description','category','payee','amount','due_date','paid_amount','payment_date','reference'];
export type ExpenseImportRow={description:string;category:string;payee:string;amount_kobo:number;due_date:string;paid_kobo:number|null;payment_date:string|null;reference:string|null};
export function parseExpenseCsv(input:string):ExpenseImportRow[]{
 const lines=parseResultCsv(input),header=lines.shift()||[];
 if(header.length!==expenseHeaders.length||expenseHeaders.some((h,i)=>header[i]!==h)||!lines.length||lines.length>200)throw new Error('Use the expense template with 1–200 rows.');
 return lines.map((r,i)=>{
  const [description,category,payee,amount,due,paid,date,reference]=r,amountKobo=parseKobo(amount),paidKobo=paid?parseKobo(paid):null;
  if(r.length!==8||description.length<2||description.length>200||category.length<2||category.length>80||payee.length<2||payee.length>160||!amountKobo||!validDate(due)||paid&&(!paidKobo||paidKobo>amountKobo||!validDate(date)||date>schoolToday()||reference.length<3||reference.length>100)||!paid&&(date||reference))throw new Error(`Check expense row ${i+2}: descriptions, amounts, dates and payment reference must be complete.`);
  return {description,category,payee,amount_kobo:amountKobo,due_date:due,paid_kobo:paidKobo,payment_date:date||null,reference:reference||null};
 });
}
