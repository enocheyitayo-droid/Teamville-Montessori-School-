import {schoolAccount} from '@/lib/teamville-school/auth';
import {validMemberId} from '@/lib/teamville-school/access-input';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const account=await schoolAccount(),{id}=await params;
 const missing=()=>new Response('Not found',{status:404,headers:{'Cache-Control':'private, no-store'}});
 if(!account?.member.password_ready||account.member.role==='developer'||!validMemberId(id))return missing();
 const photo=await account.client.from('teamville_pupil_photos').select('path').eq('pupil_id',id).maybeSingle();if(photo.error||!photo.data)return missing();
 const file=await account.client.storage.from('teamville-pupil-photos').download(photo.data.path);if(file.error)return missing();
 return new Response(file.data,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
}
