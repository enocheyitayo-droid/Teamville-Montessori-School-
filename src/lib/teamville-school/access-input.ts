import {schoolClassOptions} from "./model";
export type AccountRole="teacher"|"student"|"parent";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function parseAccountAccess(form:FormData){
  const role=String(form.get("role") || "") as AccountRole;
  const classes=Array.from(new Set(form.getAll("classes").map(String))),pupils=Array.from(new Set(form.getAll("pupil_ids").map(String)));
  const verified=form.get("verified")==="yes";
  if(!["teacher","student","parent"].includes(role))return null;
  if(role==="teacher"){
    if(classes.length<1 || classes.length>10 || classes.some(c=>!schoolClassOptions.includes(c)))return null;
    return {role,classes,pupils:[],verified};
  }
  if(!verified || pupils.length<1 || pupils.length>20 || (role==="student" && pupils.length!==1) || pupils.some(p=>!uuid.test(p)))return null;
  return {role,classes:[],pupils,verified};
}
export function validMemberId(value:string){return uuid.test(value);}
