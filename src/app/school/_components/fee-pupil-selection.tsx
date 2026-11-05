'use client';
import {useState} from 'react';
export function FeePupilSelection({pupils}:{pupils:{id:string;name:string;current_class:string|null}[]}){
 const [search,setSearch]=useState(''),[chosen,setChosen]=useState<string[]>([]);
 return <fieldset><legend>Choose participating pupils</legend><label>Find pupil or class<input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label><p>{chosen.length} pupils selected. Only checked pupils will be billed.</p><div style={{maxHeight:280,overflowY:'auto'}}>{pupils.map(p=><label className="sp-check" key={p.id} style={{display:`${`${p.name} ${p.current_class}`.toLowerCase().includes(search.toLowerCase())?'flex':'none'}`}}><input type="checkbox" name="pupil" value={p.id} checked={chosen.includes(p.id)} onChange={e=>setChosen(old=>e.target.checked?[...old,p.id]:old.filter(id=>id!==p.id))}/>{p.name} · {p.current_class}</label>)}</div></fieldset>;
}
