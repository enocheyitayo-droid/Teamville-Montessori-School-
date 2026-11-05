import {SchoolTeaching} from '../_components/teaching';
export default async function TeachingPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <SchoolTeaching query={await searchParams}/>;}
