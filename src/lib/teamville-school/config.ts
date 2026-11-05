export function schoolAuthConfig(){
  const url=process.env.TEAMVILLE_SUPABASE_URL,key=process.env.TEAMVILLE_SUPABASE_PUBLISHABLE_KEY;
  return url && key?{url,key}:null;
}
export const schoolCookieAttributes={path:"/school",httpOnly:true,sameSite:"strict" as const,secure:process.env.NODE_ENV==="production"};
export const schoolCookieOptions={name:"teamville-school-auth",...schoolCookieAttributes};
// These public assets predate the /school portal and must never require sign-in.
const publicPhotoPaths=new Set(["admissions-2026.png","class-of-2026.png","early-years-graduation.png","graduation-celebration.png","graduation-performance.png","head-of-school.png","learning-together.png"].map(name=>`/school/${name}`));
export function isPublicSchoolPhoto(pathname:string){return publicPhotoPaths.has(pathname);}
