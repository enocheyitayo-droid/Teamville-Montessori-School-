"use client";
import {useFormStatus} from "react-dom";
export function SchoolSubmit({children,pendingLabel="Please wait…"}:{children:React.ReactNode;pendingLabel?:string}){
  const {pending}=useFormStatus();return <button className="sp-button" type="submit" disabled={pending}>{pending?pendingLabel:children}</button>;
}
