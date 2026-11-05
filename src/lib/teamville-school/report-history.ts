export type HistoryReport={id:string;session:string;className:string;term:number;kind:'archive'|'midterm'|'exam'};
export function groupReportHistory(reports:HistoryReport[],current?:{session:string;className:string}){
 const groups=new Map<string,{key:string;session:string;className:string;reports:HistoryReport[]}>();
 for(const r of [...reports,...(current?[{...current,id:'',term:0,kind:'exam' as const}]:[])]){
 const key=JSON.stringify([r.session,r.className]);
 if(!groups.has(key))groups.set(key,{key,session:r.session,className:r.className,reports:[]});
 if(r.id&&r.term>=1&&r.term<=3)groups.get(key)!.reports.push(r);
 }
 return [...groups.values()].sort((a,b)=>b.session.localeCompare(a.session)||a.className.localeCompare(b.className)).map(g=>({...g,reports:g.reports.sort((a,b)=>a.term-b.term||(['midterm','exam','archive'].indexOf(a.kind)-['midterm','exam','archive'].indexOf(b.kind)))}));
}
