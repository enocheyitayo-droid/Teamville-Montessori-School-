"use client";
import {useEffect,useId,useState,type KeyboardEvent} from 'react';
import {suggestPupils,type PupilSuggestion} from '@/lib/teamville-school/pupil-search';
import {readablePupilName} from '@/lib/teamville-school/model';
export function SchoolPupilSearch({value,onChange,onPick,pupils,label,placeholder='Search pupil names…'}:{value:string;onChange:(value:string)=>void;onPick:(pupil:PupilSuggestion)=>void;pupils?:PupilSuggestion[];label:string;placeholder?:string}){
 const id=useId(),[open,setOpen]=useState(false),[active,setActive]=useState(-1),[remote,setRemote]=useState<{query:string;items:PupilSuggestion[];error?:boolean}>({query:'',items:[]});
 const query=value.trim(),local=pupils?suggestPupils(pupils,query):null,items=local || (remote.query===query?remote.items:[]),loading=!local&&!!query&&remote.query!==query;
 useEffect(()=>{
  if(pupils||!query)return;
  const controller=new AbortController();let cancelled=false;
  const timer=setTimeout(async()=>{try{const response=await fetch(`/school/search?q=${encodeURIComponent(query)}`,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Search failed');const data=await response.json();if(!cancelled)setRemote({query,items:data.pupils});}catch{if(!cancelled)setRemote({query,items:[],error:true});}},180);
  return ()=>{cancelled=true;clearTimeout(timer);controller.abort();};
 },[pupils,query]);
 function choose(p:PupilSuggestion){onChange(readablePupilName(p.name));onPick(p);setOpen(false);setActive(-1);}
 function keys(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='Escape'){setOpen(false);setActive(-1);return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);setActive(n=>items.length?(event.key==='ArrowDown'?(n+1)%items.length:n<=0?items.length-1:n-1):-1);}
  if(event.key==='Enter'&&open&&active>=0&&items[active]){event.preventDefault();choose(items[active]);}
 }
 return <div className="sp-autocomplete" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}><label className="sp-sr" htmlFor={id}>{label}</label><input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open&&!!query} aria-controls={`${id}-suggestions`} aria-activedescendant={open&&active>=0?`${id}-option-${active}`:undefined} value={value} autoComplete="off" maxLength={120} placeholder={placeholder} onChange={e=>{onChange(e.target.value);setActive(-1);setOpen(true);}} onFocus={()=>{setOpen(true);setActive(-1);}} onKeyDown={keys}/>
 {open&&query&&<div className="sp-suggestion-popup"><ul id={`${id}-suggestions`} role="listbox" aria-label="Suggested pupil names">{items.map((p,index)=><li key={p.id} id={`${id}-option-${index}`} role="option" aria-selected={active===index} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(p)}><strong>{readablePupilName(p.name)}</strong><small>{p.current_class || 'Leaver'}{p.admission_number?` · ${p.admission_number}`:''}{p.enrolment_status==='leaver'?' · Archived pupil':''}</small></li>)}</ul>{!items.length&&<p role="status">{loading?'Searching names…':remote.error&&!local?'Search is temporarily unavailable. Try again.':'No matching pupil in your accessible records.'}</p>}</div>}
 </div>;
}
