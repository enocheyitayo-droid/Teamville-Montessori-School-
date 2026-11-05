"use client";
import {Printer} from 'lucide-react';
export function SchoolPrintButton({label='Print report / save PDF'}:{label?:string}){return <button className="sp-button sp-secondary sp-no-print" onClick={()=>window.print()}><Printer size={16}/>{label}</button>;}
