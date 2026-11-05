"use client";
import Link from "next/link";
import {useState} from "react";
import {ArrowUpRight,Search} from "lucide-react";
import {readablePupilName,type SchoolPupil} from "@/lib/teamville-school/model";
import {useSchoolSearch} from "./school-search";
import {SchoolPupilSearch} from './school-pupil-search';

export function SchoolPupilRegister({pupils,initialClass="",historical=false}:{pupils:SchoolPupil[];initialClass?:string;historical?:boolean}){
  const globalSearch=useSchoolSearch(),[localQuery,setLocalQuery]=useState(""),[className,setClassName]=useState(initialClass);
  const query=globalSearch?.query ?? localQuery,setQuery=globalSearch?.setQuery ?? setLocalQuery;
  const classes=Array.from(new Set(pupils.map(p=>historical?p.historical_class:p.current_class).filter(Boolean) as string[])).sort();
  const needle=query.trim().toLocaleLowerCase().replace(/[,\s]+/g," ");
  const visible=pupils.filter(p=>{
    const nameMatches=!needle || readablePupilName(p.name).toLocaleLowerCase().includes(needle) || Boolean(p.admission_number?.toLocaleLowerCase().includes(needle));
    const classMatches=!className || (className==="leavers"?p.enrolment_status==="leaver":className==="review"?!p.current_class && p.enrolment_status!=="leaver":(historical?p.historical_class:p.current_class)===className);
    return nameMatches && classMatches;
  });
  return <section className="sp-panel" id="pupils" aria-labelledby="register-heading"><div className="sp-panel-heading"><div><span className="sp-eyebrow">Your pupil register</span><h2 id="register-heading">Every child, a clear record.</h2></div><span className="sp-count">{visible.length} of {pupils.length}</span></div><div className="sp-filters"><div className="sp-search"><Search size={18}/><SchoolPupilSearch label="Search pupils by name or admission number" value={query} onChange={setQuery} onPick={p=>{setQuery(readablePupilName(p.name));setClassName('');}} pupils={pupils} placeholder="Search a pupil’s name…"/></div><label><span className="sp-sr">{historical?"Recorded class":"Current class"}</span><select value={className} onChange={e=>setClassName(e.target.value)}><option value="">{historical?"All recorded classes":"All current classes"}</option>{classes.map(c=><option key={c}>{c}</option>)}<option value="leavers">Leavers</option><option value="review">Class needs confirmation</option></select></label></div><div className="sp-table-wrap"><table className="sp-table"><thead><tr><th>Pupil</th><th>Recorded class</th><th>Current class</th><th>Review</th><th/></tr></thead><tbody>{visible.map(p=><tr key={p.id}><td><Link href={`/school/pupils/${p.id}`} className="sp-pupil-link"><span className="sp-initials">{readablePupilName(p.name).split(" ").slice(0,2).map(n=>n[0]).join("")}</span><span>{readablePupilName(p.name)}<small>{p.admission_number || "Admission number not supplied"}</small></span></Link></td><td>{p.historical_class}</td><td>{p.current_class || (p.enrolment_status==="leaver"?"Completed Grade 5":"To confirm")}<small>{p.current_session || `Left after ${p.historical_session}`}</small></td><td><span className={`sp-badge ${p.identity_reviewed?"sp-good":"sp-review"}`}>{p.identity_reviewed?"Checked":"Identity to check"}</span></td><td><Link className="sp-open" href={`/school/pupils/${p.id}`} aria-label={`Open ${readablePupilName(p.name)}’s record`}><ArrowUpRight size={18}/></Link></td></tr>)}</tbody></table>{!visible.length&&<p className="sp-empty">No pupils match this search.</p>}</div></section>;
}


