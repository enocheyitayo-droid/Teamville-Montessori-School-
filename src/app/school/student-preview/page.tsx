import {SchoolStudent} from '../_components/student-dashboard';
export default async function StudentPreview({searchParams}:{searchParams:Promise<{pupil?:string}>}){return <SchoolStudent preview query={await searchParams}/>;}
