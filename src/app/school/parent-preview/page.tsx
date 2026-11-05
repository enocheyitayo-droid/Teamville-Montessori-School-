import {SchoolStudent} from '../_components/student-dashboard';
export default async function ParentPreview({searchParams}:{searchParams:Promise<{pupil?:string}>}){return <SchoolStudent preview parentView query={await searchParams}/>;}
