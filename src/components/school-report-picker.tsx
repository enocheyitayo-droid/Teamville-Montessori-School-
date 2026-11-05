'use client';
import {useState,useTransition,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {SchoolPupilSearch} from './school-pupil-search';
import {readablePupilName} from '@/lib/teamville-school/model';
import type {PupilSuggestion} from '@/lib/teamville-school/pupil-search';
export function SchoolReportPicker({pupils,current,kind,preview=false}:{pupils:PupilSuggestion[];current?:PupilSuggestion;kind:string;preview?:boolean}){
 const router=useRouter(),[query,setQuery]=useState(current?readablePupilName(current.name):''),[selected,setSelected]=useState<PupilSuggestion|null>(current||null),[pending,startTransition]=useTransition();
 function load(e:FormEvent){e.preventDefault();if(!selected)return;const q=new URLSearchParams({pupil:selected.id,class:selected.current_class||'',kind});if(preview)q.set('preview','teacher');startTransition(()=>router.push('/school/results?'+q));}
 return <form className="sp-report-picker sp-no-print" onSubmit={load}><div><span className="sp-picker-label">Search pupil reports</span><SchoolPupilSearch pupils={pupils} value={query} label="Search pupil reports" placeholder="Type a pupil’s name or admission number…" onChange={v=>{setQuery(v);setSelected(null);}} onPick={setSelected}/><small className="sp-picker-hint">{selected?`${selected.current_class||'Archived'} · ${selected.admission_number||'Name matched to pupil record'}`:'Select a suggested pupil, then load their results.'}</small></div><button className="sp-button sp-secondary" disabled={!selected||pending}>{pending?'Loading report…':'Load results'}</button><span className="sp-report-weight">{kind==='exam'?'CA /40 + exam /60 = total /100':'Midterm CA /40 · separate download'}</span></form>;
}
