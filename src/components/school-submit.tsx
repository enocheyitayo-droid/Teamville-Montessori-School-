"use client";
import {useFormStatus} from "react-dom";
export function SchoolSubmit({children,pendingLabel="Please wait…",disabled=false}:{children:React.ReactNode;pendingLabel?:string;disabled?:boolean}){
  const {pending}=useFormStatus();return <button className="sp-button" type="submit" disabled={pending||disabled}>{pending?pendingLabel:children}</button>;
}
