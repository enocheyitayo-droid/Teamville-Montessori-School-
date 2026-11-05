'use client';
import {useFormStatus} from 'react-dom';
export function SchoolFormFeedback(){const {pending}=useFormStatus();return pending?<div className="sp-saving-feedback" role="status"><i/>Saving your changes… Please wait.</div>:null;}
