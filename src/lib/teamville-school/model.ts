export const currentSchoolSession="2026/2027";
export const historicalSchoolSession="2025/2026";
export function validSchoolActivation(hash:string,type:string){return /^(?:[a-f0-9]{56}|[a-f0-9]{64})$/i.test(hash) && ["invite","recovery"].includes(type);}
export type Progression = {currentClass:string|null;state:"advanced"|"needs_review"|"completed"};
export function proposedProgression(recordedClass:string):Progression {
  const normal=recordedClass.trim().replace(/\s+/g," ").toUpperCase();
  const early:Record<string,string>={PRESCHOOL:"LDC 1","LDC 1":"LDC 2","LDC 2":"Nursery 1","NURSERY 1":"Nursery 2","NURSERY 2":"Grade 1"};
  if(early[normal])return {currentClass:early[normal],state:"advanced"};
  const match=normal.match(/^GRADE\s+([1-5])$/);
  if(!match) return {currentClass:null,state:"needs_review"};
  const grade=Number(match[1]);
  return grade<5?{currentClass:`Grade ${grade+1}`,state:"advanced"}:{currentClass:null,state:"completed"};
}
export const schoolClassOptions=["Preschool","LDC 1","LDC 2","Nursery 1","Nursery 2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5"];
export type SchoolMember={user_id:string;name:string;role:"admin"|"teacher"|"student"|"parent"|"developer";active:boolean;password_ready:boolean;username?:string|null;is_head_of_school?:boolean};
export type SchoolPupil={id:string;name:string;historical_class:string;historical_session:string|null;current_class:string|null;current_session:string|null;enrolment_status:"active"|"leaver";progression_state:string;identity_reviewed:boolean;admission_number:string|null;guardian_name?:string|null;guardian_phone?:string|null};
export const schoolPupilColumns="id,name,historical_class,historical_session,current_class,current_session,enrolment_status,progression_state,identity_reviewed,admission_number,guardian_name,guardian_phone";
export type ArchiveSubject={subject:string;source_column:number;has_entered_components:boolean;ca1:string;ca2:string;ca3:string;exam:string;sum:string;cumulative:string;position:string};
export type ArchiveResult={id:string;pupil_id:string;export_set:"first"|"second"|"unlabelled";original_class:string;session_label:string|null;term:number|null;verified:boolean;subjects:ArchiveSubject[];source_overall:Record<string,string>;entered_subjects:number;source_file:string;source_row:number;review_count:number};
export const exportLabels={first:"First export",second:"Second export",unlabelled:"Unlabelled export"};
export function readablePupilName(name:string){return name.replace(/\s*,\s*/g," ").replace(/\s+/g," ").trim();}
