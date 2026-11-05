import "server-only";
import {cache} from 'react';
import {createServerClient} from "@supabase/ssr";
import {cookies,headers} from "next/headers";
import {redirect,notFound} from "next/navigation";
import {schoolAuthConfig,schoolCookieOptions,schoolCookieAttributes} from "./config";
import type {SchoolMember} from "./model";

export const schoolClient=cache(async function schoolClient(){
  const config=schoolAuthConfig();if(!config)throw new Error("School sign-in is not configured.");
  const jar=await cookies();
  return createServerClient(config.url,config.key,{cookieOptions:schoolCookieOptions,cookies:{
    getAll:()=>jar.getAll(),
    setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,{...options,...schoolCookieAttributes}));}catch{/* The school proxy refreshes read-only server-rendered sessions. */}}
  }});
});
export const schoolAccount=cache(async function schoolAccount(){
  if(!schoolAuthConfig())return null;
  const client=await schoolClient();
  const {data:{user},error}=await client.auth.getUser();
  if(error || !user)return null;
  const {data:member}=await client.from("teamville_members").select("user_id,name,role,active,password_ready,username").eq("user_id",user.id).eq("active",true).maybeSingle();
  if(member?.username){const session=await client.rpc('teamville_session_valid');if(session.error||!session.data)return null;}
  return member?{client,member:member as SchoolMember}:null;
});
export async function requireSchoolAccount(setup=false){
  const account=await schoolAccount();
  if(!account)redirect("/school/login");
  if(!setup && !account.member.password_ready)redirect("/school/setup");
  if(!setup&&account.member.role==='developer'){
    const path=(await headers()).get('x-teamville-path')||'';
    if(!['/school/teaching','/school/parent','/school/student','/school/teacher-preview','/school/parent-preview','/school/student-preview'].includes(path))redirect('/school/teaching');
  }
  return account;
}
export async function requireSchoolAdmin(){const account=await requireSchoolAccount();if(account.member.role!=="admin")notFound();return account;}
