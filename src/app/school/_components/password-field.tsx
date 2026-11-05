'use client';
import {useState} from 'react';
export function PasswordField({label,name,minLength=8,autoComplete='current-password'}:{label:string;name:string;minLength?:number;autoComplete?:string}){
 const [visible,setVisible]=useState(false);
 return <div><label>{label}<input name={name} type={visible?'text':'password'} minLength={minLength} maxLength={128} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false} required/></label><button className="sp-button sp-secondary" type="button" aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?'Hide':'Show'} {label.toLowerCase()}</button></div>;
}
