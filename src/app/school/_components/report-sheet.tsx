import Image from 'next/image';
import {readablePupilName} from '@/lib/teamville-school/model';
import type {PupilReport} from '@/lib/teamville-school/term-results';
import {gradeRemark,type AttendanceSummary,type SubjectStats} from '@/lib/teamville-school/report-extras';
import {teacherHabits} from './teacher-feedback';

const termNames=['','FIRST','SECOND','THIRD'];
const ratings=['Very good','Good','Needs support'];
const dash='—';
const fixed=(n:number|null|undefined,digits=1)=>n==null||!Number.isFinite(n)?dash:Number(n).toFixed(digits).replace(/\.0+$/,'');
const percent=(part:number,whole:number)=>whole?` (${(part/whole*100).toFixed(1)}%)`:'';

/** Traditional A4 pupil report sheet, printable on one page. */
export function SchoolReportSheet({report:r,published,pupilId,photo=false,attendance=null,stats}:{
 report:PupilReport;published:boolean;pupilId:string;photo?:boolean;attendance?:AttendanceSummary;stats?:SubjectStats;
}){
 const mid=r.kind==='midterm',fb=r.teacher_feedback||{};
 const total=mid?(r.raw_total??r.subjects.reduce((n,s)=>n+Number(s.midterm),0)):r.total;
 const obtainable=mid?(r.raw_maximum??r.subjects.length*r.midterm_max):r.maximum;
 const bands=[...r.bands].sort((a,b)=>Number(b.min)-Number(a.min));
 return <article className="sp-sheet">
  <header className="sp-sheet-head">
   <Image src="/brand/teamville-logo.png" alt="Teamville Montessori School crest" width={86} height={86}/>
   <div>
    <h2>TEAMVILLE MONTESSORI SCHOOL</h2>
    <p>16 University Crescent, Bodija, Ibadan, Oyo State</p>
    <p><em>Motto: …raising a total CHILD</em></p>
    <p>Tel: 0803 854 8782 · Email: teamville01montessori@gmail.com</p>
   </div>
   {/* eslint-disable-next-line @next/next/no-img-element -- private, session-protected photo route */}
   {photo?<img className="sp-sheet-photo" src={`/school/pupils/${pupilId}/photo`} alt={`Passport photograph of ${readablePupilName(r.pupil_name)}`}/>:<div className="sp-sheet-photo sp-sheet-photo-empty">Passport</div>}
  </header>
  <h3 className="sp-sheet-title">{termNames[r.term]||''} TERM {mid?'MIDTERM':'ACADEMIC'} REPORT</h3>
  {!published&&<p className="sp-sheet-draft">Draft · not yet approved by the school</p>}
  <div className="sp-sheet-boxes">
   <section>
    <h4>Pupil</h4>
    <dl>
     <div><dt>Name</dt><dd>{readablePupilName(r.pupil_name)}</dd></div>
     <div><dt>Admission no.</dt><dd>{r.admission_number||dash}</dd></div>
     <div><dt>Class</dt><dd>{r.class_name}</dd></div>
     <div><dt>Session</dt><dd>{r.session}</dd></div>
    </dl>
    <h4>Attendance</h4>
    <dl>
     <div><dt>Days opened</dt><dd>{attendance?attendance.opened:dash}</dd></div>
     <div><dt>Present</dt><dd>{attendance?`${attendance.present}${percent(attendance.present,attendance.opened)}`:dash}</dd></div>
     <div><dt>Absent</dt><dd>{attendance?`${attendance.absent}${percent(attendance.absent,attendance.opened)}`:dash}</dd></div>
    </dl>
   </section>
   <section>
    <h4>Summary</h4>
    <dl>
     <div><dt>Total score</dt><dd>{fixed(total,2)}</dd></div>
     <div><dt>Obtainable</dt><dd>{obtainable}</dd></div>
     <div><dt>Percentage</dt><dd>{fixed(r.average,2)}%</dd></div>
     <div><dt>Grade</dt><dd>{r.grade}</dd></div>
     <div><dt>Remark</dt><dd>{gradeRemark(r.grade,r.bands)}</dd></div>
     <div><dt>Position</dt><dd>{r.position?`${r.position} of ${r.ranked_pupils??dash}`:dash}{r.provisional?' (provisional)':''}</dd></div>
    </dl>
   </section>
  </div>
  <h4 className="sp-sheet-section">Subject performance</h4>
  <table className="sp-sheet-table">
   <thead><tr>
    <th>Subject</th>
    {mid?<><th>CA<small>{r.midterm_max}</small></th><th>%<small>100</small></th></>:<><th>CA<small>{r.ca_max}</small></th><th>Exam<small>{r.exam_max}</small></th><th>Total<small>100</small></th></>}
    {stats&&<><th>Class avg</th><th>Pos.</th></>}
    <th>Grade</th><th>Remark</th>
   </tr></thead>
   <tbody>{r.subjects.map(s=>{const st=stats?.get(s.subject);return <tr key={s.subject}>
    <td>{s.subject}</td>
    {mid?<><td>{fixed(s.midterm)}</td><td>{fixed(s.total)}</td></>:<><td>{fixed(s.ca)}</td><td>{fixed(s.exam)}</td><td>{fixed(s.total)}</td></>}
    {stats&&<><td>{fixed(st?.average)}</td><td>{ordinal(st?.positions.get(pupilId))}</td></>}
    <td>{s.grade}</td><td>{gradeRemark(s.grade,r.bands)}</td>
   </tr>;})}</tbody>
  </table>
  <div className="sp-sheet-lower">
   <section>
    <h4>Classroom habits</h4>
    <table className="sp-sheet-traits">
     <thead><tr><th>Trait</th>{ratings.map(x=><th key={x}>{x}</th>)}</tr></thead>
     <tbody>{teacherHabits.map(h=><tr key={h}><td>{h}</td>{ratings.map(x=><td key={x}>{fb[h]===x?'✓':''}</td>)}</tr>)}</tbody>
    </table>
   </section>
   <section>
    <h4>Grade key</h4>
    <p className="sp-sheet-key">{bands.map((b,i)=>`${b.grade} ${b.min}–${i?Number(bands[i-1].min)-0.01:100} ${gradeRemark(b.grade,r.bands)}`).join(' · ')}</p>
   </section>
  </div>
  <div className="sp-sheet-sign">
   <section>
    <p><strong>Class teacher’s comment:</strong> {fb.comment||''}</p>
    <p className="sp-sheet-line">Class teacher’s signature</p>
   </section>
   <section>
    <p><strong>Head of school’s comment:</strong></p>
    <p className="sp-sheet-line">Head of school’s signature &amp; stamp</p>
   </section>
  </div>
  <p className="sp-sheet-end">— End of Report —</p>
 </article>;
}

function ordinal(n?:number){if(!n)return dash;const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
