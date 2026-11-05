"use server";

import {redirect} from "next/navigation";
import {schoolClient,requireSchoolAccount} from "./auth";
import {validSchoolActivation} from "./model";
import {schoolService} from './service';
import {normaliseSchoolUsername} from './usernames';
const loginError=()=>redirect("/school/login?error=signin");

export async function schoolSignIn(form:FormData){
  const identifier=String(form.get("email") || "").trim(),password=String(form.get("password") || "");
  if(identifier.length>254 || password.length<8 || password.length>128)loginError();
  let email=identifier.toLowerCase();
  if(!identifier.includes('@')){
    const username=normaliseSchoolUsername(identifier);if(!username)loginError();
    const service=schoolService(),match=await service.from('teamville_members').select('user_id,active,password_ready').eq('username',username).in('role',['teacher','admin']).maybeSingle();
    const credentials=match.data?.active?await service.from('teamville_username_credentials').select('auth_email,temporary_expires_at').eq('user_id',match.data.user_id).maybeSingle():null;
    if(credentials?.data&&!match.data?.password_ready&&(!credentials.data.temporary_expires_at||Date.parse(credentials.data.temporary_expires_at)<Date.now()))loginError();
    email=credentials?.data?.auth_email || 'unknown@teamville-login.invalid';
  }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))loginError();
  const client=await schoolClient();
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error || !data.user)return loginError();
  const {data:member}=await client.from("teamville_members").select("active,password_ready").eq("user_id",data.user.id).eq("active",true).maybeSingle();
  if(!member){await client.auth.signOut();return loginError();}
  redirect(member.password_ready?"/school":"/school/setup");
}
export async function schoolSignOut(){const client=await schoolClient();await client.auth.signOut();redirect("/school/login");}

export async function activateSchoolAccount(form:FormData){
  const hash=String(form.get("token_hash") || ""),type=String(form.get("type") || "");
  if(!validSchoolActivation(hash,type))redirect("/school/login?error=activation");
  const client=await schoolClient();
  const {error}=await client.auth.verifyOtp({token_hash:hash,type:type as "invite"|"recovery"});
  if(error)redirect("/school/login?error=activation");
  await requireSchoolAccount(true);
  redirect("/school/setup");
}
export async function setSchoolPassword(form:FormData){
  const {client}=await requireSchoolAccount(true);
  const password=String(form.get("password") || ""),confirmation=String(form.get("confirmation") || "");
  if(password.length<12 || password.length>128 || password!==confirmation)redirect("/school/setup?error=password");
  const {error}=await client.auth.updateUser({password});
  if(error)redirect("/school/setup?error=password");
  const result=await client.rpc("teamville_finish_setup");
  if(result.error)redirect("/school/setup?error=save");
  redirect("/school");
}
