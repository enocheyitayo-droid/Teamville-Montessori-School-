"use client";
import {SchoolLink as Link} from "@/components/school-link";
import Image from "next/image";
import {usePathname,useRouter,useSearchParams} from "next/navigation";
import {useState,type FormEvent} from "react";
import {Archive,ArrowUpRight,GraduationCap,LayoutDashboard,LockKeyhole,LogOut,Menu,Search,UserRoundCog,UsersRound,X,BookOpen,Wallet,ContactRound,ClipboardList,CalendarCheck,Megaphone,ShieldCheck,PanelLeftClose,PanelLeftOpen} from "lucide-react";
import {schoolSignOut} from "@/lib/teamville-school/actions";
import {currentSchoolSession,historicalSchoolSession,type SchoolMember} from "@/lib/teamville-school/model";
import {SchoolSearchProvider,useSchoolSearch} from "./school-search";
import {SchoolPupilSearch} from './school-pupil-search';

function Workspace({member,children}:{member:SchoolMember;children:React.ReactNode}){
  const path=usePathname() || "/school",params=useSearchParams(),router=useRouter(),search=useSchoolSearch();
  const [open,setOpen]=useState(false),[collapsed,setCollapsed]=useState(false),archive=params?.get("cohort")==="archive";
  const parentPreview=path==="/school/parent-preview",studentPreview=path==="/school/student-preview",family=member.role==="parent" || member.role==="student",preview=path==="/school/teacher-preview"||studentPreview||parentPreview||path==='/school/results'&&params?.get('preview')==='teacher';
  const label=member.is_head_of_school?"Head of School":preview?parentPreview?"Parent preview":studentPreview?"Student preview":"Teacher preview":{admin:"Administrator",teacher:"Teacher",student:"Student",parent:"Parent / guardian",developer:"Teacher · Parent · Student"}[member.role];
  const tab=params?.get('tab')||'overview';
  const items=[{label:"Overview",href:member.role==="teacher"?"/school/teaching":member.role==="student"?"/school/student":"/school",icon:LayoutDashboard,active:path==="/school"&&!archive||member.role==="teacher"&&path==="/school/teaching"&&tab==='overview'||path==="/school/student"||path==="/school/parent"},
    {label:family?member.role==="parent"?"My children":"My pupil profile":"Pupils & admissions",href:member.role==="student"?"/school/student#student-profile":family?"/school/parent#student-profile":"/school/pupils",icon:UsersRound,active:path.startsWith("/school/pupils")}];
  if(!family&&!preview)items.push({label:'Attendance',href:'/school/teaching?tab=attendance',icon:CalendarCheck,active:path==='/school/teaching'&&tab==='attendance'},{label:'Lesson notes',href:'/school/teaching?tab=lessons',icon:ClipboardList,active:path==='/school/teaching'&&tab==='lessons'});
  if(!preview)items.push({label:'Academics & results',href:'/school/results',icon:BookOpen,active:path.startsWith('/school/results')||path.startsWith('/school/reports')});
  if(!family&&!preview)items.push({label:'Class positions',href:'/school/positions',icon:GraduationCap,active:path==='/school/positions'});
  if(member.role!=="teacher"&&!preview)items.push({label:family?"Family fee accounts":"Fees & payments",href:"/school/finance",icon:Wallet,active:path==="/school/finance"&&params?.get("view")!=="outstanding"});
  if(member.role==='admin'&&!preview)items.push({label:'Debtors & outstanding',href:'/school/finance?view=outstanding',icon:UsersRound,active:path==='/school/finance'&&params?.get('view')==='outstanding'},{label:'School purse & payables',href:'/school/purse',icon:Wallet,active:path==='/school/purse'});
  if(member.is_head_of_school&&!preview)items.push({label:'Salary records & slips',href:'/school/salaries',icon:BookOpen,active:path.startsWith('/school/salaries')});
  if(!preview)items.push({label:'School notices',href:'/school/notices',icon:Megaphone,active:path==='/school/notices'});
  if(member.is_head_of_school&&!preview)items.push({label:'Grading reference',href:'/school/grading',icon:ClipboardList,active:path==='/school/grading'});
  if(member.is_head_of_school&&!preview)items.push({label:"Head of School overview",href:"/school/leadership",icon:GraduationCap,active:path==="/school/leadership"});
  if(member.role==="admin"&&!preview)items.push({label:"Staff directory",href:"/school/directory",icon:ContactRound,active:path==="/school/directory"},{label:`${historicalSchoolSession} archive`,href:"/school?cohort=archive",icon:Archive,active:path==="/school"&&archive},{label:"Accounts & access",href:"/school/staff",icon:UserRoundCog,active:path==="/school/staff"});
  if(member.role==='admin'&&!preview)items.push({label:'Activity & audit trail',href:'/school/activity',icon:ShieldCheck,active:path==='/school/activity'});
  if(preview){items.splice(0,items.length,{label:parentPreview?"Parent workspace":studentPreview?"Student workspace":"Teacher workspace",href:parentPreview?"/school/parent-preview":studentPreview?"/school/student-preview":"/school/teacher-preview",icon:BookOpen,active:true},{label:"Return to administration",href:"/school",icon:LayoutDashboard,active:false});}
  if(member.role==='developer')items.splice(0,items.length,{label:'Teacher portal',href:'/school/teaching',icon:BookOpen,active:path.includes('teaching')||path.includes('teacher')},{label:'Parent portal',href:'/school/parent',icon:UsersRound,active:path.includes('parent')},{label:'Student portal',href:'/school/student',icon:GraduationCap,active:path.includes('student')});
  if(!preview)items.push({label:'Change password',href:'/school/setup',icon:LockKeyhole,active:path==='/school/setup'});
  function findPupil(event:FormEvent){event.preventDefault();router.push('/school/pupils');}
  return <div className={`sp-workspace ${collapsed?'sp-workspace-collapsed':''}`}>
    {open&&<button className="sp-rail-backdrop" aria-label="Close portal navigation" onClick={()=>setOpen(false)}/>}
    <aside className={`sp-rail ${open?"sp-rail-open":""}`} aria-label="School workspace sidebar">
      <Link className="sp-rail-brand" href="/school" onClick={()=>setOpen(false)}><Image src="/brand/teamville-logo.png" alt="" width={43} height={43}/><span><strong>Teamville</strong><small>Montessori School</small></span></Link>
      <button className="sp-rail-close" aria-label="Close portal navigation" onClick={()=>setOpen(false)}><X size={20}/></button>
      <p className="sp-rail-section">School workspace</p>
      <nav className="sp-rail-nav" aria-label="School workspace">{items.map(item=><Link href={item.href} key={item.label} aria-label={item.label} title={item.label} className={item.active?"sp-rail-current":""} aria-current={item.active?"page":undefined} onClick={()=>setOpen(false)}><item.icon size={18}/><span>{item.label}</span></Link>)}<Link href="/" aria-label="School website" title="School website" onClick={()=>setOpen(false)}><ArrowUpRight size={18}/><span>School website</span></Link></nav>
      <div className="sp-rail-privacy"><LockKeyhole size={16}/><span>Private school records<small>Access assigned by your school</small></span></div>
      <div className="sp-rail-person"><span className="sp-person-initials">{member.name.split(/\s+/).slice(0,2).map(n=>n[0]).join("")}</span><span><strong>{member.name}</strong><small>{label}</small></span></div>
      <form action={schoolSignOut} className="sp-rail-signout"><button aria-label="Sign out"><LogOut size={17}/><span>Sign out</span></button></form>
      <button className="sp-rail-collapse" aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} onClick={()=>setCollapsed(v=>!v)}>{collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}<span>{collapsed?'Expand sidebar':'Collapse sidebar'}</span></button>
    </aside>
    <div className="sp-workspace-body"><header className="sp-workspace-header"><div className="sp-workspace-welcome"><button className="sp-rail-toggle" aria-label="Open portal navigation" aria-expanded={open} onClick={()=>setOpen(true)}><Menu size={20}/></button><span>Teamville school portal<small>{label} workspace</small></span></div>
      {member.role!=='developer'&&!family&&!studentPreview&&!parentPreview&&<form className="sp-global-search" role="search" onSubmit={findPupil}><div className="sp-global-search-field"><Search size={16}/><SchoolPupilSearch value={search?.query || ''} onChange={value=>search?.setQuery(value)} onPick={pupil=>router.push(path==='/school/results'?`/school/results?class=${encodeURIComponent(pupil.current_class||'')}&pupil=${pupil.id}&kind=${params?.get('kind')==='midterm'?'midterm':'exam'}${preview?'&preview=teacher':''}`:`/school/pupils/${pupil.id}`)} label="Search pupils" placeholder="Search pupils…"/></div><button>Search</button></form>}
      <span className="sp-session-chip"><GraduationCap size={15}/>{archive?historicalSchoolSession:currentSchoolSession}</span>
    </header>{children}<footer className="sp-workspace-footer">Teamville Montessori School<span>School and home, connected.</span></footer></div>
  </div>;
}
export function SchoolWorkspace({member,children}:{member:SchoolMember;children:React.ReactNode}){return <SchoolSearchProvider><Workspace member={member}>{children}</Workspace></SchoolSearchProvider>;}
