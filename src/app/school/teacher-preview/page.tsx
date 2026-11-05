import {SchoolTeaching} from '../_components/teaching';
export default async function TeacherPreview({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <SchoolTeaching preview query={await searchParams}/>;}
