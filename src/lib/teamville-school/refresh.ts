import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
import {schoolAuthConfig,schoolCookieOptions,schoolCookieAttributes,isPublicSchoolPhoto} from "./config";

export async function schoolProxy(request:NextRequest){
  if(isPublicSchoolPhoto(request.nextUrl.pathname))return NextResponse.next({request});
  request.headers.set('x-teamville-path',request.nextUrl.pathname);
  let response=NextResponse.next({request});
  const config=schoolAuthConfig();
  if(config){
    const client=createServerClient(config.url,config.key,{cookieOptions:schoolCookieOptions,cookies:{
      getAll:()=>request.cookies.getAll(),
      setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,{...options,...schoolCookieAttributes}));}
    }});
    const {data:{user}}=await client.auth.getUser();
    if(!user && !["/school/login","/school/activate"].includes(request.nextUrl.pathname)){
      const redirect=NextResponse.redirect(new URL("/school/login",request.url));
      response.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie));
      response=redirect;
    }
  }
  response.headers.set("Cache-Control","private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
  // Keeps private URLs off external sites while preserving Origin on native POST forms.
  response.headers.set("Referrer-Policy","same-origin");
  return response;
}
