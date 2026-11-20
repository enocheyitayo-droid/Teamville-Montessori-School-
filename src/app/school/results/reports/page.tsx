import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SchoolLink as Link} from '@/components/school-link';
import {SchoolPrintButton} from '@/components/school-print-button';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {validMemberId} from '@/lib/teamville-school/access-input';
import {readablePupilName,schoolPupilColumns,type SchoolPupil} from '@/lib/teamville-school/model';
import {makePupilReport,rankPupilReports,type PupilReport,type ReportSnapshot,type TermCycle,type TermMark,type TermRules} from '@/lib/teamville-school/term-results';
import {SchoolReportCard} from '../../_components/report-card';

export const metadata: Metadata = {title: 'Pupil reports'};

// Staff download of report cards: one pupil (?pupil=) or the whole class, one card per printed page.
// Reads use the signed-in user's session, so RLS limits teachers to their assigned classes.
export default async function PupilReportDownloads({searchParams}:{searchParams:Promise<{cycle?:string;pupil?:string}>}){
 const {client,member}=await requireSchoolAccount();
 if(!['admin','teacher'].includes(member.role))notFound();
 const q=await searchParams,cycleId=q.cycle||'',only=q.pupil||'';
 if(!validMemberId(cycleId)||(only&&!validMemberId(only)))notFound();
 const c=await client.from('teamville_term_cycles').select('*').eq('id',cycleId).maybeSingle();
 if(c.error||!c.data)notFound();
 const cycle=c.data as TermCycle,published=cycle.state==='published'&&cycle.current_run;
 const [p,m,r,f,snaps]=await Promise.all([
  client.from('teamville_pupils').select(schoolPupilColumns).eq('current_class',cycle.class_name).eq('current_session',cycle.session).eq('enrolment_status','active').order('name'),
  client.from('teamville_term_marks').select('*').eq('cycle_id',cycle.id),
  client.from('teamville_term_rules').select('*').eq('session',cycle.session).eq('term',cycle.term).single(),
  client.from('teamville_report_feedback').select('pupil_id,feedback').eq('cycle_id',cycle.id),
  published?client.from('teamville_report_snapshots').select('*').eq('run_id',cycle.current_run):Promise.resolve({data:[],error:null}),
 ]);
 if(p.error||m.error||r.error||f.error||snaps.error)throw new Error('Unable to load pupil reports.');
 const pupils=p.data as SchoolPupil[],rules=r.data as TermRules;
 rules.midterm_max=Number(cycle.midterm_max||rules.midterm_max);
 const ranked=new Map(rankPupilReports(pupils.flatMap(pupil=>{const report=makePupilReport(pupil,cycle,m.data as TermMark[],rules);return report?[{pupil_id:pupil.id,report}]:[];}),pupils.length).map(row=>[row.pupil_id,row.report]));
 const feedback=new Map((f.data as {pupil_id:string;feedback:Record<string,string>}[]).map(row=>[row.pupil_id,row.feedback]));
 const snapshots=new Map((snaps.data as ReportSnapshot[]).map(s=>[s.pupil_id,s]));
 const chosen=only?pupils.filter(pupil=>pupil.id===only):pupils;
 if(only&&!chosen.length)notFound();
 const cards:{pupil:SchoolPupil;report:PupilReport;published:boolean}[]=[],incomplete:SchoolPupil[]=[];
 for(const pupil of chosen){
  const snap=snapshots.get(pupil.id),draft=ranked.get(pupil.id);
  if(snap)cards.push({pupil,report:snap.payload,published:true});
  else if(draft)cards.push({pupil,report:{...draft,teacher_feedback:feedback.get(pupil.id)},published:false});
  else incomplete.push(pupil);
 }
 const label=cycle.kind==='exam'?'Final reports':'Midterm reports';
 const back=`/school/results?class=${encodeURIComponent(cycle.class_name)}&kind=${cycle.kind}${only?`&pupil=${only}`:''}`;
 return <main id="main-content" className="sp-main sp-print-document">
  <div className="sp-panel-heading sp-no-print">
   <div>
    <Link href={back} className="sp-back">← Academics & results</Link>
    <h1>{only&&chosen[0]?readablePupilName(chosen[0].name):`${cycle.class_name} · ${label}`}</h1>
    <p className="sp-small">{cards.length} {cards.length===1?'report':'reports'} · Term {cycle.term} · {cycle.session}{published?' · Published':' · Draft, not yet published to families'}</p>
   </div>
   {cards.length>0&&<SchoolPrintButton label={cards.length===1?'Download PDF / Print':`Download all ${cards.length} as PDF / Print`}/>}
  </div>
  {incomplete.length>0&&<p className="sp-review-note sp-no-print">{only?'This pupil’s report is incomplete. Enter every subject’s marks to download it.':`Not included (incomplete marks): ${incomplete.map(x=>readablePupilName(x.name)).join(', ')}.`}</p>}
  <div className="sp-report-pages">{cards.map(card=><div key={card.pupil.id} className="sp-report-page"><SchoolReportCard report={card.report} published={card.published}/></div>)}</div>
 </main>;
}
