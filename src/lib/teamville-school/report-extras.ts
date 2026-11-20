import type {PupilReport,TermRules} from './term-results';

export type SubjectStats = Map<string,{average:number;positions:Map<string,number>}>;
export type AttendanceSummary = {opened:number;present:number;absent:number}|null;

const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;

/** Class average and position for every subject, from the class's complete reports. Ties share a position (1, 2, 2, 4). */
export function subjectClassStats(rows:{pupil_id:string;report:PupilReport}[]):SubjectStats{
 const scores=new Map<string,{pupil_id:string;score:number}[]>();
 for(const {pupil_id,report} of rows)for(const s of report.subjects){
  const score=report.kind==='midterm'?Number(s.midterm):Number(s.total);
  if(!Number.isFinite(score))continue;
  scores.set(s.subject,[...(scores.get(s.subject)||[]),{pupil_id,score}]);
 }
 const stats:SubjectStats=new Map();
 for(const [subject,list] of scores){
  const ordered=[...list].sort((a,b)=>b.score-a.score),positions=new Map<string,number>();
  let position=0,last:number|null=null;
  ordered.forEach((row,index)=>{if(row.score!==last){position=index+1;last=row.score;}positions.set(row.pupil_id,position);});
  stats.set(subject,{average:round(list.reduce((n,r)=>n+r.score,0)/list.length),positions});
 }
 return stats;
}

const remarks=['Excellent','Very Good','Good','Fair'];
/** Remark for a grade: the school's bands from highest to lowest read Excellent, Very Good, Good, Fair, then Poor. */
export function gradeRemark(grade:string,bands:TermRules['bands']):string{
 const index=[...bands].sort((a,b)=>Number(b.min)-Number(a.min)).findIndex(b=>b.grade===grade);
 return index<0?'—':remarks[index]??'Poor';
}

/** Register totals for one pupil: late counts as present, excused as absent. */
export function attendanceSummary(rows:{status:string}[]):AttendanceSummary{
 if(!rows.length)return null;
 const present=rows.filter(r=>r.status==='present'||r.status==='late').length;
 return {opened:rows.length,present,absent:rows.length-present};
}
