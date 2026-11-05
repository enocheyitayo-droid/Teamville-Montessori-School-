import type {NextRequest} from "next/server";
import {schoolProxy} from "@/lib/teamville-school/refresh";
export async function proxy(request:NextRequest){return schoolProxy(request);}
export const config={matcher:["/school/:path*"]};
