import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {validMemberId} from '@/lib/teamville-school/access-input';
import {loadPupilStatement,statementCsvRows} from '@/lib/teamville-school/fee-statement';
import {csvCell} from '@/lib/teamville-school/export';
export async function GET(request:Request){
 const {client,member}=await requireSchoolAccount(),id=new URL(request.url).searchParams.get('pupil')||'';
 if(!['admin','parent','student'].includes(member.role))return Response.json({error:'Access denied'},{status:403});
 if(!validMemberId(id))return Response.json({error:'Pupil unavailable'},{status:404});
 try{const s=await loadPupilStatement(client,id);if(!s)return Response.json({error:'Pupil unavailable'},{status:404});
 return new Response('\ufeff'+statementCsvRows(s).map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n',{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="Teamville-pupil-fee-statement.csv"','Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'Statement unavailable'},{status:503});}
}
