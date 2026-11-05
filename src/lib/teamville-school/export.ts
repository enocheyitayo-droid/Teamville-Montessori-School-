import {exportLabels,type SchoolPupil,type ArchiveResult} from "./model";
export function csvCell(value:unknown){
  let text=value==null?"":String(value);
  if(/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))text=`'${text}`;
  return `"${text.replace(/"/g,'""')}"`;
}
export function makeSchoolCsv(pupils:SchoolPupil[],records:ArchiveResult[],kind:"pupils"|"results"){
  const base=["Portal record ID","Pupil name","Historical session","Recorded class","Current session","Current class","Enrollment status","Admission number"];
  const pupilValues=(p:SchoolPupil)=>[p.id,p.name,p.historical_session,p.historical_class,p.current_session,p.current_class,p.enrolment_status,p.admission_number];
  const rows:unknown[][]=[];
  let headers=base;
  if(kind==="pupils")rows.push(...pupils.map(pupilValues));
  else{
    const maxSlots=Math.max(0,...records.map(r=>r.subjects.length));
    const summaryKeys=Array.from(new Set(records.flatMap(r=>Object.keys(r.source_overall || {})))).sort();
    headers=[...base,"Result session","Term (unconfirmed if blank)","Export set","Verified for release","Source file","Source row"];
    for(let i=1;i<=maxSlots;i++)headers.push(...["Name","Marks entered","CA 1","CA 2","CA 3","Exam","Total supplied","Cumulative supplied","Position supplied"].map(field=>`Subject ${i}: ${field}`));
    headers.push(...summaryKeys.map(key=>`Report summary: ${key}`));
    const lookup=new Map(pupils.map(p=>[p.id,p]));
    for(const record of records){
      const pupil=lookup.get(record.pupil_id);if(!pupil)throw new Error("Result has no pupil profile.");
      const row:unknown[]=[...pupilValues(pupil),record.session_label,record.term,exportLabels[record.export_set],record.verified?"yes":"no",record.source_file,record.source_row];
      for(let i=0;i<maxSlots;i++){const s=record.subjects[i];row.push(...(s?[s.subject,s.has_entered_components?"yes":"no",s.ca1,s.ca2,s.ca3,s.exam,s.sum,s.cumulative,s.position]:Array(9).fill("")));}
      row.push(...summaryKeys.map(key=>record.source_overall?.[key] || ""));rows.push(row);
    }
  }
  return "\ufeff"+[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
