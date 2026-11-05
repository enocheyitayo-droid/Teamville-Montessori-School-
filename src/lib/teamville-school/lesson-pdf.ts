export const lessonPdfLimit=3*1024*1024;
export function validLessonPdf(name:string,type:string,bytes:Uint8Array){return name.toLowerCase().endsWith('.pdf')&&['application/pdf','application/octet-stream',''].includes(type)&&bytes.length>8&&bytes.length<=lessonPdfLimit&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-';}
