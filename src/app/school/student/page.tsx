import {SchoolStudent} from '../_components/student-dashboard';
export default async function StudentDashboard({searchParams}:{searchParams:Promise<{pupil?:string}>}){return <SchoolStudent query={await searchParams}/>;}
