import {notFound} from 'next/navigation';
import Link from 'next/link';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import type {PupilReport} from '@/lib/teamville-school/term-results';
import {SchoolReportCard} from '../../_components/report-card';
import {SchoolPrintButton} from '@/components/school-print-button';
export default async function PublishedReport({params}:{params:Promise<{id:string}>}){const {client}=await requireSchoolAccount(),{id}=await params;const r=await client.from('teamville_report_snapshots').select('payload,run_id').eq('id',id).maybeSingle();if(r.error||!r.data)notFound();return <main id="main-content" className="sp-main sp-print-document"><div className="sp-panel-heading sp-no-print"><Link href="/school/results" className="sp-back">← Results</Link><SchoolPrintButton/></div><SchoolReportCard report={r.data.payload as PupilReport} published/></main>;}
