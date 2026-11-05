import {readablePupilName} from './model';
export type PupilSuggestion={id:string;name:string;current_class:string|null;enrolment_status:string;admission_number:string|null};
export function normalisePupilSearch(text:string){return text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
export function suggestPupils(pupils:PupilSuggestion[],query:string,limit=8){
 const needle=normalisePupilSearch(query).slice(0,120),tokens=needle.split(' ').filter(Boolean);if(!needle)return [];
 return pupils.map(p=>{const name=normalisePupilSearch(readablePupilName(p.name)),admission=normalisePupilSearch(p.admission_number||'');return {p,name,rank:name===needle||admission===needle?0:name.startsWith(needle)?1:name.split(' ').some(n=>n.startsWith(needle))?2:3,match:tokens.every(t=>name.includes(t)||admission.includes(t))};}).filter(p=>p.match).sort((a,b)=>a.rank-b.rank||a.name.localeCompare(b.name)||Number(a.p.enrolment_status==='leaver')-Number(b.p.enrolment_status==='leaver')||a.p.id.localeCompare(b.p.id)).slice(0,limit).map(r=>r.p);
}
