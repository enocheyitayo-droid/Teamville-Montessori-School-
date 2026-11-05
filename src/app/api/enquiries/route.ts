import { handleWebsiteEnquiry } from "@/lib/website-enquiry-server";

export const runtime="nodejs";
export async function POST(request:Request){return handleWebsiteEnquiry(request);}
