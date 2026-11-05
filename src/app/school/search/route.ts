import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {suggestPupils,type PupilSuggestion} from '@/lib/teamville-school/pupil-search';
export async function GET(request:Request){
 const {client}=await requireSchoolAccount(),query=new URL(request.url).searchParams.get('q')?.trim()||'';
 const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
 if(!query||query.length>120)return Response.json({pupils:[]},{headers});
 // The authenticated client's RLS scope is also the search scope: never use a service key here.
 const {data,error}=await client.from('teamville_pupils').select('id,name,current_class,enrolment_status,admission_number').order('name');
 if(error)return Response.json({error:'Search is temporarily unavailable.'},{status:503,headers});
 return Response.json({pupils:suggestPupils(data as PupilSuggestion[],query)},{headers});
}
