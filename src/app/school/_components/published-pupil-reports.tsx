import Link from 'next/link';
import {SchoolReportCard} from './report-card';
import type {ArchiveResult} from '@/lib/teamville-school/model';
import {schoolClient} from '@/lib/teamville-school/auth';
import type {ReportSnapshot} from '@/lib/teamville-school/term-results';
import {groupReportHistory,type HistoryReport} from '@/lib/teamville-school/report-history';
export async function PublishedPupilReports({id,viewOnly=false}:{id:string;viewOnly?:boolean}){
 const client=await schoolClient();
 const [cycles,archive,pupil]=await Promise.all([
  client.from('teamville_term_cycles').select('current_run').not('current_run','is',null),
  client.from('teamville_result_archive').select('*').eq('pupil_id',id).eq('verified',true),
  client.from('teamville_pupils').select('current_class,current_session').eq('id',id).maybeSingle(),
 ]);
 if(cycles.error||archive.error||pupil.error)throw new Error('Unable to load report history.');
 const ids=cycles.data.map(c=>c.current_run),result=ids.length?await client.from('teamville_report_snapshots').select('*').eq('pupil_id',id).in('run_id',ids):{data:[],error:null};
 if(result.error)throw new Error('Unable to load pupil reports.');
 const reports:HistoryReport[]=(result.data as ReportSnapshot[]).map(s=>({id:s.id,session:s.payload.session,className:s.payload.class_name,term:s.payload.term,kind:s.payload.kind}));
 for(const a of archive.data)if(a.term&&a.session_label&&a.entered_subjects>0)reports.push({id:a.id,session:a.session_label,className:a.original_class,term:a.term,kind:'archive'});
 const groups=groupReportHistory(reports,pupil.data?.current_class&&pupil.data.current_session?{session:pupil.data.current_session,className:pupil.data.current_class}:undefined);
 return <section id="student-reports" className="sp-panel sp-history"><h2>Results by school year & class</h2><p className="sp-small">Choose a school year, then a term. Past reports keep the class your child attended that year. {viewOnly?'View published reports below. Downloads are disabled for this account.':'Open a published report to print or save a PDF.'}</p>
 {groups.map((g,index)=><details key={g.key} open={index===0} className="sp-history-year"><summary><strong>{g.session} · {g.className}</strong><span>{g.reports.length} published {g.reports.length===1?'report':'reports'}</span></summary><div className="sp-history-terms">{[1,2,3].map(term=>{const rows=g.reports.filter(r=>r.term===term);return <section key={term}><h3>{g.className} — Term {term}</h3>{rows.length?rows.map(r=>viewOnly?<details className="sp-family-report-card" key={r.id}><summary>{r.kind==='archive'?'Historical term report':r.kind==='midterm'?'Midterm / CA report':'Final end-of-term report'} · View only</summary>{r.kind==='archive'?<div className="sp-table-wrap"><table className="sp-table"><thead><tr><th>Subject</th><th>CA 1</th><th>CA 2</th><th>CA 3</th><th>Exam</th><th>Total supplied</th></tr></thead><tbody>{(archive.data.find(a=>a.id===r.id) as ArchiveResult)?.subjects.filter(s=>s.has_entered_components).map(s=><tr key={s.source_column}><td>{s.subject||'Subject name not supplied'}</td>{[s.ca1,s.ca2,s.ca3,s.exam,s.sum].map((v,i)=><td key={i}>{v===''?'—':v}</td>)}</tr>)}</tbody></table></div>:<SchoolReportCard report={(result.data as ReportSnapshot[]).find(s=>s.id===r.id)!.payload} published compact/>}<p className="sp-small">Downloads disabled for this account.</p></details>:<Link className="sp-family-report-card" key={r.id} href={r.kind==='archive'?'/school/reports/archive/'+r.id:'/school/reports/'+r.id}><strong>{r.kind==='archive'?'Historical term report':r.kind==='midterm'?'Midterm / CA report':'Final end-of-term report'}</strong><p>{r.kind==='archive'?'Original school record':r.kind==='midterm'?'Subject scores /40':'CA /40 + Exam /60 = Total /100'}</p><span>View report · Print / save PDF →</span></Link>):<p className="sp-small">No published report for this term yet.</p>}</section>;})}</div></details>)}
 {!groups.length&&<p className="sp-empty">No published reports are available yet.</p>}</section>;
}
