import {PupilFees} from './pupil-fees';
import {PupilPhoto} from './pupil-photo';
import {ReadOnlySchoolWorkspace} from './read-only-workspace';
import Link from 'next/link';
import {PublishedPupilReports} from './published-pupil-reports';
import {notFound,redirect} from 'next/navigation';
import {GraduationCap,Archive,Wallet,BookOpen} from 'lucide-react';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {schoolPupilColumns,currentSchoolSession,readablePupilName,type SchoolPupil} from '@/lib/teamville-school/model';
import {billBalance,moneyKobo,type FeeBill,type FeePayment} from '@/lib/teamville-school/operations';
import {PupilCurrent} from './pupil-current';
import {SchoolStudentPicker} from '@/components/school-student-picker';
export async function SchoolStudent({query:q,preview=false,parentView=false}:{query:{pupil?:string};preview?:boolean;parentView?:boolean}){
 const {client,member}=await requireSchoolAccount();
 if(member.role==='developer')return <ReadOnlySchoolWorkspace query={{...q,view:parentView?'parent':'student'}}/>;
 if(preview)redirect('/school');
 if(!preview&&member.role!==(parentView?'parent':'student'))notFound();
 const roster=await client.from('teamville_pupils').select(schoolPupilColumns).order('name');if(roster.error)throw new Error('Unable to load preview pupils.');
 const pupils=(roster.data || []) as SchoolPupil[],pupil=pupils.find(p=>p.id===q.pupil)||pupils.find(p=>p.enrolment_status==='active')||pupils[0];
 if(!pupil)return <main id="main-content" className="sp-main"><h1>{parentView?'Your parent dashboard':preview?'Student preview':'Your student dashboard'}</h1><p>No pupil profile has been linked to this account yet. Contact the school office.</p></main>;
 const [archive,bills,scores]=await Promise.all([
  client.from('teamville_result_archive').select('id,session_label,term,original_class').eq('pupil_id',pupil.id).eq('verified',true),
  client.from('teamville_fee_bills').select('*').eq('pupil_id',pupil.id),
  client.from('teamville_term_cycles').select('current_run').not('current_run','is',null)
 ]);if(archive.error||bills.error||scores.error)throw new Error('Unable to load student preview.');
 const feeBills=bills.data as FeeBill[],ids=feeBills.map(b=>b.id),payments=ids.length?await client.from('teamville_fee_payments').select('*').in('bill_id',ids):{data:[],error:null};
 const assessmentIds=scores.data.map(s=>s.current_run),published=assessmentIds.length?await client.from('teamville_report_snapshots').select('id',{count:'exact',head:true}).eq('pupil_id',pupil.id).in('run_id',assessmentIds):{count:0,error:null};
 if(payments.error||published.error)throw new Error('Unable to load published preview records.');
 const outstanding=feeBills.reduce((n,b)=>n+billBalance(b,payments.data as FeePayment[]),0);
 return <main id="main-content" className="sp-main"><div className="sp-top"><div><span className="sp-eyebrow">{parentView?preview?'Parent dashboard preview':'Your parent dashboard':preview?'Student dashboard preview':'Your student dashboard'} · {currentSchoolSession}</span><h1>{parentView?'Your child: ':'Hello, '}{readablePupilName(pupil.name)}</h1><p>{parentView?'Your child’s midterm CA report, final report, attendance and fee records.':'Your school profile, attendance and school-approved results in one place.'}</p></div></div>
 {preview&&<><div className="sp-preview-note"><strong>Read-only {parentView?'parent':'student'} preview · your administrator account stays unchanged</strong><p>A real {parentView?'parent':'student'} sees only verified linked pupils and approved reports. This preview shows the selected pupil only and hides draft marks and unverified historical results. Your administrator access is unchanged.</p><Link href="/school">Return to administration</Link></div>
 <SchoolStudentPicker key={pupil.id} pupils={pupils} current={pupil} buttonLabel={parentView?'Open parent preview':'Open student preview'}/><div className="sp-downloads"><Link href={`/school/${parentView?'student':'parent'}-preview?pupil=${pupil.id}`}>Switch to {parentView?'student':'parent'} preview</Link></div></>}{parentView&&!preview&&<section className="sp-panel sp-my-children"><h2>My children · {pupils.length}</h2><p className="sp-small">These are the children the school has verified and linked to your account. Choose a child to view their profile, results, attendance and fees.</p><div className="sp-children-grid">{pupils.map(child=><Link href={`/school/parent?pupil=${child.id}`} key={child.id} className={child.id===pupil.id?'sp-child-card sp-child-current':'sp-child-card'} aria-current={child.id===pupil.id?'page':undefined}><strong>{readablePupilName(child.name)}</strong><span>{child.current_class||'Archived pupil'} · {child.current_session||child.historical_session}</span><small>{child.id===pupil.id?'Viewing this child':'Open child’s profile →'}</small></Link>)}</div></section>}
 <nav className="sp-module-tabs" aria-label="Student preview sections"><a href="#student-profile">My profile</a><a href="#student-results">Results & attendance</a><a href="#student-fees">Fee summary</a><a href="#student-reports">Report cards</a></nav>
 <div className="sp-metrics"><article><GraduationCap size={22}/><strong>{pupil.current_class || 'Leaver'}</strong><span>{pupil.current_session || `Completed ${pupil.historical_session}`}</span></article><article><BookOpen size={22}/><strong>{published.count || 0}</strong><span>Approved term reports</span></article><article><Archive size={22}/><strong>{archive.data.length}</strong><span>Published historical reports</span></article><article><Wallet size={22}/><strong className="sp-money">{moneyKobo(outstanding)}</strong><span>Outstanding on recorded bills</span></article></div>
 <PupilPhoto id={pupil.id} name={readablePupilName(pupil.name)}/>
 <section id="student-profile" className="sp-panel"><h2>{parentView?'Your child’s profile':'My pupil profile'}</h2><div className="sp-statement"><span>Name<strong>{readablePupilName(pupil.name)}</strong></span><span>Admission number<strong>{pupil.admission_number || 'Not supplied yet'}</strong></span><span>Current class<strong>{pupil.current_class || 'Completed Grade 5'}</strong></span></div><p className="sp-small">Previous session: {pupil.historical_session||'No historical record'} · Recorded class: {pupil.historical_class}. Progression does not change the class shown on past results.</p></section>
 <div id="student-results"><PublishedPupilReports id={pupil.id}/><PupilCurrent id={pupil.id}/></div>
 <div id="student-fees"><PupilFees id={pupil.id}/></div>
 </main>;
}
