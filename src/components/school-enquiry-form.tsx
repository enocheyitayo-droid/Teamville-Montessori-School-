"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, Phone } from "lucide-react";
import { enquiryClasses, enquiryTopics, type EnquiryErrors, type EnquiryField } from "@/lib/website-enquiry";
import s from "./school-enquiry-form.module.css";

export function SchoolEnquiryForm({admissions=false}:{admissions?:boolean}) {
  const id=useId();
  const requestId=useRef<string | null>(null);
  const [pending,setPending]=useState(false),[sent,setSent]=useState(false),[message,setMessage]=useState("");
  const [errors,setErrors]=useState<EnquiryErrors>({});
  const feedback=useRef<HTMLDivElement>(null);
  const attrs=(field:EnquiryField)=>({id:`${id}-${field}`,name:field,"aria-invalid":Boolean(errors[field]),"aria-describedby":errors[field]?`${id}-${field}-error`:undefined});
  const error=(field:EnquiryField)=>errors[field] && <small id={`${id}-${field}-error`} className={s.fieldError}>{errors[field]}</small>;
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending)return;
    const form=event.currentTarget, data=new FormData(form);
    requestId.current ||= crypto.randomUUID();
    setPending(true);setMessage("");setErrors({});
    try {
      const response=await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(15_000),body:JSON.stringify({...Object.fromEntries(data),consent:data.get("consent")==="on",requestId:requestId.current})});
      const result=await response.json();
      if(response.ok && result.ok){setSent(true);setMessage(result.message);form.reset();requestId.current=null;}
      else {setMessage(result.message || "We couldn’t send your enquiry. Please try again or contact the school directly.");setErrors(result.errors || {});}
    } catch {setMessage("We couldn’t confirm your enquiry was sent. Please try again, or contact the school directly.");}
    finally {setPending(false);requestAnimationFrame(()=>feedback.current?.focus());}
  }
  return <section id="enquiry" className={s.section} aria-labelledby={`${id}-title`}><div className={s.container}>
    <div className={s.intro}><span className={s.eyebrow}>A conversation starts here</span><h2 id={`${id}-title`}>Let’s get to know <br/>your family.</h2><p>Thinking about Teamville, planning a visit or simply have a question? Leave us a message and a way to reach you.</p><div className={s.direct}><a href="tel:+2348038548782"><Phone size={18}/>0803 854 8782</a><a href="mailto:teamville01montessori@gmail.com"><Mail size={18}/>Email the school</a></div><p className={s.note}>Please keep medical information, passwords and confidential pupil records out of this form.</p></div>
    <div className={s.card}>{sent?<div className={s.success} ref={feedback} tabIndex={-1} role="status"><span className={s.tick}><Check size={28}/></span><h3>Thank you for reaching out.</h3><p>{message}</p><p>The school can reply using the contact details you provided.</p><button type="button" onClick={()=>{setSent(false);setMessage("");}}>Send another enquiry<ArrowRight size={16}/></button></div>:<form onSubmit={submit} aria-busy={pending}>
      <h3>Send an enquiry</h3><p className={s.formHint}>Fields marked * are required.</p>
      {message && <div className={s.alert} role="alert" tabIndex={-1} ref={feedback}>{message}</div>}
      <div className={s.grid}><label htmlFor={`${id}-name`}>Your name *<input {...attrs("name")} required minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name"/>{error("name")}</label><label htmlFor={`${id}-email`}>Email address *<input {...attrs("email")} required type="email" maxLength={254} autoComplete="email" placeholder="you@example.com"/>{error("email")}</label><label htmlFor={`${id}-phone`}>Phone number (optional)<input {...attrs("phone")} type="tel" maxLength={30} autoComplete="tel" placeholder="Your phone number"/>{error("phone")}</label><label htmlFor={`${id}-topic`}>I’d like to ask about *<select {...attrs("topic")} defaultValue={admissions?"Admissions":"General enquiry"}>{enquiryTopics.map(topic=><option key={topic}>{topic}</option>)}</select>{error("topic")}</label></div>
      <label htmlFor={`${id}-classInterest`}>Class of interest<select {...attrs("classInterest")} defaultValue="Not sure yet">{enquiryClasses.map(grade=><option key={grade}>{grade}</option>)}</select>{error("classInterest")}</label>
      <label htmlFor={`${id}-message`}>Your message *<textarea {...attrs("message")} required minLength={10} maxLength={3000} rows={5} placeholder="Tell us how we can help…"/>{error("message")}</label>
      <div className={s.trap} aria-hidden="true"><label htmlFor={`${id}-website`}>Leave this empty<input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <label className={s.consent} htmlFor={`${id}-consent`}><input {...attrs("consent")} type="checkbox" required/><span>I agree that Teamville may use these details to respond to my enquiry. *</span></label>{error("consent")}
      <p className={s.privacy}>Your details are used to handle this enquiry and are not displayed publicly.</p>
      <button className={s.submit} disabled={pending} type="submit">{pending?"Sending enquiry…":"Send enquiry"}<ArrowRight size={17}/></button>
    </form>}</div>
  </div></section>;
}

