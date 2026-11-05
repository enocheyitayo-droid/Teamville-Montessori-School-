"use server";
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireSchoolAccount,requireSchoolAdmin} from './auth';
import {currentSchoolSession} from './model';
import {validMemberId} from './access-input';
import {parseResultCsv} from './result-csv';
const text=(f:FormData,k:string)=>String(f.get(k)||'').trim();
function done(cycle:string,ok:boolean,pupil=''):never{revalidatePath('/school','layout');redirect(`/school/results?cycle=${encodeURIComponent(cycle)}${pupil?`&pupil=${encodeURIComponent(pupil)}`:''}&${ok?'saved=1':'error=check'}`);}
async function staff(){const a=await requireSchoolAccount();if(!['admin','teacher'].includes(a.member.role))redirect('/school');return a;}
export async function openTermResults(f:FormData){
 const {client}=await staff(),className=text(f,'class'),kind=text(f,'kind'),subjects=text(f,'subjects').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(!['midterm','exam'].includes(kind)||subjects.length<1||subjects.length>35)done('',false);
 const r=await client.rpc('teamville_open_term_cycle',{p_class:className,p_session:currentSchoolSession,p_term:1,p_kind:kind,p_subjects:subjects,p_midterm_max:40});if(r.error)done('',false);done(r.data,true);
}
export async function savePupilTermMarks(f:FormData){
 const {client}=await staff(),cycle=text(f,'cycle'),pupil=text(f,'pupil'),subjects=f.getAll('subject').map(String);
 if(!validMemberId(cycle)||!validMemberId(pupil)||subjects.length<1||subjects.length>35)done(cycle,false,pupil);
 const rows=subjects.map((subject,i)=>({id:pupil,subject,ca:text(f,`ca_${i}`),exam:text(f,`exam_${i}`),midterm:text(f,`midterm_${i}`)}));
 const r=await client.rpc('teamville_save_term_marks',{p_cycle:cycle,p_rows:rows,p_submit:false});done(cycle,!r.error,pupil);
}
export async function uploadClassTermMarks(f:FormData){
 const {client}=await staff(),cycle=text(f,'cycle'),file=f.get('file'),component=text(f,'component');if(!['ca','exam','both','midterm'].includes(component)||!validMemberId(cycle)||!(file instanceof File)||file.size>750000||!file.name.toLowerCase().endsWith('.csv'))done(cycle,false);
 let rows:{id:string;subject:string;ca:string;exam:string;midterm:string}[]=[];
 try{const parsed=parseResultCsv(await file.text()),header=parsed.shift()||[],cols=['pupil_id','subject','ca','exam','midterm'].map(h=>header.indexOf(h));if(cols.some(c=>c<0))throw new Error('Use the supplied CSV template');
  rows=parsed.map(r=>({id:r[cols[0]]||'',subject:r[cols[1]]||'',ca:r[cols[2]]||'',exam:r[cols[3]]||'',midterm:r[cols[4]]||''})).filter(r=>component==='ca'?r.ca!=='':component==='exam'?r.exam!=='':component==='midterm'?r.midterm!=='':r.ca!==''||r.exam!=='');
  if(!rows.length||rows.length>5000||rows.some(r=>!validMemberId(r.id)))throw new Error('Invalid rows');
 }catch{done(cycle,false);}
 const r=await client.rpc('teamville_upload_term_marks',{p_cycle:cycle,p_rows:rows,p_component:component});done(cycle,!r.error);
}
export async function submitTermResults(f:FormData){const {client}=await staff(),id=text(f,'cycle');if(!validMemberId(id))done('',false);const r=await client.rpc('teamville_submit_term_cycle',{p_cycle:id});done(id,!r.error);}
export async function reopenTermResults(f:FormData){const {client}=await staff(),id=text(f,'cycle');if(!validMemberId(id))done('',false);const r=await client.rpc('teamville_reopen_term_cycle',{p_cycle:id,p_note:text(f,'note')});done(id,!r.error);}
export async function correctCycleSubjects(f:FormData){const {client}=await requireSchoolAdmin(),id=text(f,'cycle'),subjects=text(f,'subjects').split(/\r?\n/).map(s=>s.trim()).filter(Boolean),max=text(f,'midterm_max')?Number(f.get('midterm_max')):null;if(!validMemberId(id)||(max!==null&&(!Number.isFinite(max)||max<=0||max>1000)))done('',false);const r=await client.rpc('teamville_replace_cycle_subjects',{p_cycle:id,p_subjects:subjects,p_note:text(f,'note'),p_midterm_max:max});done(id,!r.error);}
export async function reviewTermResults(f:FormData){const {client}=await requireSchoolAdmin(),id=text(f,'cycle');if(!validMemberId(id))done('',false);if(text(f,'decision')==='publish'&&f.get('checked')!=='yes')done(id,false);const r=await client.rpc('teamville_review_term_cycle',{p_cycle:id,p_publish:text(f,'decision')==='publish',p_note:text(f,'note')});done(id,!r.error);}
export async function reviewHistoricalReport(f:FormData){const {client}=await requireSchoolAdmin(),id=text(f,'report'),term=Number(f.get('term'));if(!validMemberId(id))redirect('/school');const r=await client.rpc('teamville_review_historical_report',{p_report:id,p_term:term,p_publish:text(f,'decision')==='publish',p_checked:f.get('checked')==='yes'});revalidatePath('/school','layout');redirect(`/school/reports/archive/${id}?${r.error?'error=check':'saved=1'}`);}
