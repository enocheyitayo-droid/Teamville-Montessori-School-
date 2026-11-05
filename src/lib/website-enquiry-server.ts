import { createHmac } from "node:crypto";
import { parseEnquiry } from "./website-enquiry";

const maxBytes=12_000;
const failure="We couldn’t send your enquiry. Please try again, or contact the school by email or phone.";
const received="Your enquiry has been received. Thank you for getting in touch with Teamville.";
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});

export async function handleWebsiteEnquiry(request:Request, options:{ env?:Partial<NodeJS.ProcessEnv>; fetcher?:typeof fetch }={}) {
  const env=options.env || process.env;
  const fetcher=options.fetcher || fetch;
  if(request.headers.get("origin")!==new URL(request.url).origin) return reply({ok:false,message:"Please send your enquiry from the school website."},403);
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reply({ok:false,message:"Please use the enquiry form."},415);
  if(Number(request.headers.get("content-length") || 0)>maxBytes) return reply({ok:false,message:"Your enquiry is too long."},413);
  let input:unknown;
  try {
    const reader=request.body?.getReader();
    if(!reader) return reply({ok:false,message:"Please complete the enquiry form."},400);
    let size=0;
    const chunks:Uint8Array[]=[];
    while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>maxBytes){await reader.cancel();return reply({ok:false,message:"Your enquiry is too long."},413);}chunks.push(chunk.value);}
    input=JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return reply({ok:false,message:"Please complete the enquiry form."},400); }
  if(input && typeof input==="object" && "website" in input && (input as {website:unknown}).website) return reply({ok:true,message:received});
  const parsed=parseEnquiry(input);
  if(parsed.errors) return reply({ok:false,message:"Please check the highlighted fields.",errors:parsed.errors},400);
  const url=env.TEAMVILLE_SUPABASE_URL, key=env.TEAMVILLE_SUPABASE_SECRET_KEY, salt=env.TEAMVILLE_ENQUIRY_RATE_SECRET;
  if(!url || !/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url) || !key || !salt || salt.length<32) return reply({ok:false,message:failure},503);
  const ip=(request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const ipHash=createHmac("sha256",salt).update(ip).digest("hex");
  const value=parsed.value;
  try {
    const result=await fetcher(`${url}/rest/v1/rpc/submit_website_enquiry`,{
      method:"POST",cache:"no-store",signal:AbortSignal.timeout(8_000),
      headers:{apikey:key,"Content-Type":"application/json"},
      body:JSON.stringify({p_request_id:value.requestId,p_name:value.name,p_email:value.email,p_phone:value.phone || null,p_topic:value.topic,p_class_interest:value.classInterest,p_message:value.message,p_ip_hash:ipHash}),
    });
    if(!result.ok) return reply({ok:false,message:failure},503);
    const outcome=await result.json();
    if(outcome?.status==="rate_limited") return reply({ok:false,message:"You’ve sent several enquiries recently. Please try again later or call the school."},429);
    if(outcome?.status!=="received") return reply({ok:false,message:failure},503);
    return reply({ok:true,message:received},201);
  } catch {return reply({ok:false,message:failure},503);}
}
