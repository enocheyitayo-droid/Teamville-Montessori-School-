import type {SchoolPupil} from './model';
export type TermKind='midterm'|'exam';
export type TermRules={session:string;term:number;ca_max:number;exam_max:number;midterm_max:number;bands:{grade:string;min:number}[]};
export type TermCycle={id:string;class_name:string;session:string;term:number;kind:TermKind;subjects:string[];state:string;review_note:string|null;current_run:string|null;midterm_max?:number};
export type TermMark={cycle_id:string;pupil_id:string;subject:string;ca:number|null;exam:number|null;midterm:number|null};
export type SubjectResult={subject:string;ca:number|null;exam:number|null;midterm:number|null;total:number;grade:string};
export type PupilReport={pupil_name:string;admission_number:string|null;class_name:string;session:string;term:number;kind:TermKind;subjects:SubjectResult[];total:number;maximum:number;average:number;grade:string;ca_max:number;exam_max:number;midterm_max:number;raw_total?:number;raw_maximum?:number;bands:TermRules['bands'];position?:number;ranked_pupils?:number;cohort_pupils?:number;provisional?:boolean;version?:number};
export type ReportSnapshot={id:string;run_id:string;pupil_id:string;payload:PupilReport};
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function resultGrade(score:number,bands:TermRules['bands']){return [...bands].sort((a,b)=>Number(b.min)-Number(a.min)).find(b=>score>=Number(b.min))?.grade || '—';}
export function makePupilReport(p:SchoolPupil,cycle:TermCycle,marks:TermMark[],rules:TermRules):PupilReport|null{
 const subjects:SubjectResult[]=[];
 for(const subject of cycle.subjects){const m=marks.find(m=>m.pupil_id===p.id&&m.subject===subject);if(!m||(cycle.kind==='exam'?(m.ca==null||m.exam==null):m.midterm==null))return null;
  const total=round(cycle.kind==='exam'?Number(m.ca)+Number(m.exam):Number(m.midterm)/Number(cycle.midterm_max??rules.midterm_max)*100);
  subjects.push({subject,ca:m.ca,exam:m.exam,midterm:m.midterm,total,grade:resultGrade(total,rules.bands)});
 }
 const total=round(subjects.reduce((n,s)=>n+s.total,0)),average=round(total/subjects.length);
 return {pupil_name:p.name,admission_number:p.admission_number,class_name:cycle.class_name,session:cycle.session,term:cycle.term,kind:cycle.kind,subjects,total,maximum:subjects.length*100,average,grade:resultGrade(average,rules.bands),ca_max:Number(rules.ca_max),exam_max:Number(rules.exam_max),midterm_max:Number(cycle.midterm_max??rules.midterm_max),raw_total:cycle.kind==='midterm'?round(subjects.reduce((n,s)=>n+Number(s.midterm),0)):undefined,raw_maximum:cycle.kind==='midterm'?subjects.length*Number(cycle.midterm_max??rules.midterm_max):undefined,bands:rules.bands};
}
export function rankPupilReports(rows:{pupil_id:string;report:PupilReport}[],cohort:number){
 const ordered=[...rows].sort((a,b)=>b.report.total-a.report.total||a.pupil_id.localeCompare(b.pupil_id));let position=0,last:number|null=null;
 return ordered.map((row,index)=>{if(last!==row.report.total){position=index+1;last=row.report.total;}return {...row,report:{...row.report,position,ranked_pupils:ordered.length,cohort_pupils:cohort,provisional:ordered.length<cohort}};});
}
