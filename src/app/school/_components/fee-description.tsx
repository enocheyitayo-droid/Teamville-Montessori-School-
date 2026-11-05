'use client';
import {useState} from 'react';
export function FeeDescription(){
 const [kind,setKind]=useState(''),[name,setName]=useState('');
 const custom=kind==='Extra-curricular activity'||kind==='Other';
 const description=custom?(kind==='Extra-curricular activity'&&name.trim()?`Extra-curricular: ${name.trim()}`:name.trim()):kind;
 return <><label>Fee or opening-balance description<select name="fee_type" value={kind} onChange={e=>{setKind(e.target.value);setName('');}} required><option value="">Choose a fee type</option><option>Tuition</option><option>Transport</option><option>Extra-curricular activity</option><option value="Opening balance carried forward">Opening balance</option><option>Other</option></select></label>{custom&&<label>{kind==='Extra-curricular activity'?'Activity name':'Fee name'}<input name="fee_name" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={kind==='Extra-curricular activity'?180:200} placeholder={kind==='Extra-curricular activity'?'Enter the activity’s name':'Enter the approved fee description'} required/></label>}<input name="description" value={description} type="hidden"/></>;
}
