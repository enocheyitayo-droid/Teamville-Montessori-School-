import {SchoolStudent} from '../_components/student-dashboard';
export default async function ParentDashboard({searchParams}:{searchParams:Promise<{pupil?:string}>}){return <SchoolStudent parentView query={await searchParams}/>;}
