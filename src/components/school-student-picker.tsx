"use client";
import {useState} from 'react';
import {SchoolPupilSearch} from './school-pupil-search';
import {readablePupilName} from '@/lib/teamville-school/model';
import type {PupilSuggestion} from '@/lib/teamville-school/pupil-search';
export function SchoolStudentPicker({pupils,current,buttonLabel='Open student preview',hiddenFields={}}:{pupils:PupilSuggestion[];current:PupilSuggestion;buttonLabel?:string;hiddenFields?:Record<string,string>}){
 const [query,setQuery]=useState(readablePupilName(current.name)),[selected,setSelected]=useState<PupilSuggestion|null>(current);
 return <form method="get" className="sp-class-selector sp-student-picker">{Object.entries(hiddenFields).map(([name,value])=><input key={name} type="hidden" name={name} value={value}/>)}<div><span className="sp-picker-label">Find a pupil by name</span><SchoolPupilSearch label="Find a pupil by name" value={query} onChange={value=>{setQuery(value);setSelected(null);}} onPick={setSelected} pupils={pupils} placeholder="Type a pupil’s name for suggestions…"/>{selected&&<input type="hidden" name="pupil" value={selected.id}/>}<small className="sp-picker-hint">{selected?`${selected.current_class || 'Leaver'} · Selected pupil`:'Choose a suggested name, then open the preview.'}</small></div><button className="sp-button sp-secondary" disabled={!selected}>{buttonLabel}</button></form>;
}
