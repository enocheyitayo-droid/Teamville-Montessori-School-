import "server-only";
import {createClient} from "@supabase/supabase-js";
export function schoolService(){
  const url=process.env.TEAMVILLE_SUPABASE_URL,key=process.env.TEAMVILLE_SUPABASE_SECRET_KEY;
  if(!url || !key)throw new Error("School account provisioning is unavailable.");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
