"use server";
import {cookies} from "next/headers";
import {randomBytes} from 'node:crypto';
import {redirect} from "next/navigation";
import {requireSchoolAdmin} from "./auth";
import {schoolService} from "./service";
import {parseAccountAccess,validMemberId} from "./access-input";
import {validSchoolActivation} from "./model";
const fail=(code:string):never=>{redirect(`/school/staff?error=${code}`);};
export async function resetTeacherPassword(form:FormData){
  const {client,member}=await requireSchoolAdmin(),id=String(form.get('user_id')||'');
  if(!validMemberId(id))return fail('check');
  const target=await client.from('teamville_members').select('name,username,role,active').eq('user_id',id).maybeSingle();
  if(!target.data||target.data.role!=='teacher'||!target.data.username||!target.data.active)return fail('check');
  const begin=await client.rpc('teamville_begin_teacher_reset',{p_user:id});if(begin.error)return fail('provider');
  const password=`Tv!${randomBytes(15).toString('base64url')}`,service=schoolService();
  const changed=await service.auth.admin.updateUserById(id,{password});if(changed.error)return fail('provider');
  const captured=await service.rpc('teamville_capture_teacher_password',{p_user:id,p_actor:member.user_id});if(captured.error)return fail('provider');
  (await cookies()).set('teamville_teacher_password',JSON.stringify({owner:member.user_id,name:target.data.name,username:target.data.username,password}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/school/staff',maxAge:600});
  redirect('/school/staff?success=password');
}
async function invitationFlash(owner:string,email:string,hash:string,type:string){
  if(!validSchoolActivation(hash,type))fail("provider");
  (await cookies()).set("teamville_school_invitation",JSON.stringify({owner,email,hash,type}),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/school/staff",maxAge:600});
}
export async function inviteSchoolAccount(form:FormData){
  const {client,member}=await requireSchoolAdmin();
  const input=parseAccountAccess(form),name=String(form.get("name") || "").trim(),email=String(form.get("email") || "").trim().toLowerCase();
  if(!input || !input.verified || name.length<2 || name.length>120 || /[\x00-\x1f]/.test(name) || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail("check");
  const service=schoolService(),directory=await service.auth.admin.listUsers({page:1,perPage:1000});
  if(directory.error)return fail("provider");
  const existing=directory.data.users.find(u=>u.email?.toLowerCase()===email);
  if(existing)return fail("exists");
  const generated=await service.auth.admin.generateLink({type:"invite",email});
  if(generated.error || !generated.data.user || !generated.data.properties)return fail("provider");
  const id=generated.data.user.id;
  const added=await service.from("teamville_members").insert({user_id:id,name,role:input.role,active:true,password_ready:false});
  if(added.error){await service.auth.admin.deleteUser(id);return fail("provider");}
  const access=await client.rpc("teamville_admin_set_access",{p_user_id:id,p_classes:input.classes,p_pupil_ids:input.pupils,p_verified:input.verified});
  if(access.error){await service.auth.admin.deleteUser(id);return fail("check");}
  await invitationFlash(member.user_id,email,generated.data.properties.hashed_token,"invite");
  redirect("/school/staff?success=invited");
}
export async function updateSchoolAccess(form:FormData){
  const {client}=await requireSchoolAdmin(),input=parseAccountAccess(form),id=String(form.get("user_id") || "");
  if(!input || !validMemberId(id))return fail("check");
  const {data:target}=await client.from("teamville_members").select("role").eq("user_id",id).maybeSingle();
  if(!target || target.role!==input.role)return fail("check");
  const result=await client.rpc("teamville_admin_set_access",{p_user_id:id,p_classes:input.classes,p_pupil_ids:input.pupils,p_verified:input.verified});
  if(result.error)return fail("check");redirect("/school/staff?success=saved");
}
export async function setSchoolAccountActive(form:FormData){
  const {client}=await requireSchoolAdmin(),id=String(form.get("user_id") || ""),active=form.get("active")==="yes";
  if(!validMemberId(id))return fail("check");
  const result=await client.rpc("teamville_admin_set_active",{p_user_id:id,p_active:active});
  if(result.error)return fail("check");redirect(`/school/staff?success=${active?"active":"suspended"}`);
}
export async function replaceSchoolInvitation(form:FormData){
  const {client,member}=await requireSchoolAdmin(),id=String(form.get("user_id") || "");
  if(!validMemberId(id))return fail("check");
  const {data:target}=await client.from("teamville_members").select("role,active,password_ready").eq("user_id",id).maybeSingle();
  if(!target || target.role==="admin" || !target.active || target.password_ready)return fail("check");
  const service=schoolService(),user=await service.auth.admin.getUserById(id);
  if(user.error || !user.data.user?.email)return fail("provider");
  const result=await service.auth.admin.generateLink({type:"recovery",email:user.data.user.email});
  if(result.error || !result.data.properties)return fail("provider");
  await invitationFlash(member.user_id,user.data.user.email,result.data.properties.hashed_token,"recovery");redirect("/school/staff?success=invited");
}
