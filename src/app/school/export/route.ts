import {requireSchoolAccount} from "@/lib/teamville-school/auth";
import {makeSchoolCsv} from "@/lib/teamville-school/export";
import {schoolPupilColumns,type SchoolPupil,type ArchiveResult} from "@/lib/teamville-school/model";
export async function GET(request:Request){
  const {client,member}=await requireSchoolAccount();
  if(member.role!=="admin")return Response.json({error:"Administrator access required."},{status:403,headers:{"Cache-Control":"private, no-store"}});
  const kind=new URL(request.url).searchParams.get("kind")==="pupils"?"pupils":"results";
  const pupils=await client.from("teamville_pupils").select(schoolPupilColumns).eq("historical_session","2025/2026").order("name");
  if(pupils.error)return Response.json({error:"The export is temporarily unavailable."},{status:503});
  let records:ArchiveResult[]=[];
  if(kind==="results"){
    const result=await client.from("teamville_result_archive").select("*").eq("session_label","2025/2026").order("pupil_id").order("export_set");
    if(result.error)return Response.json({error:"The export is temporarily unavailable."},{status:503});records=(result.data || []) as ArchiveResult[];
  }
  return new Response(makeSchoolCsv((pupils.data || []) as SchoolPupil[],records,kind),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="Teamville-${kind}-2025-2026.csv"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
