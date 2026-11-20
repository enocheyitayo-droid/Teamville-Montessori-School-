import {notFound} from 'next/navigation';
import Link from 'next/link';
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import type {PupilReport} from '@/lib/teamville-school/term-results';
import {attendanceSummary} from '@/lib/teamville-school/report-extras';
import {SchoolReportSheet} from '../../_components/report-sheet';
import {SchoolPrintButton} from '@/components/school-print-button';

// Published report for families and staff. Class averages and subject positions are left out here:
// a family account can only read its own child's snapshot, so they can't be calculated fairly.
export default async function PublishedReport({params}:{params:Promise<{id:string}>}){
 const {client}=await requireSchoolAccount(),{id}=await params;
 const r=await client.from('teamville_report_snapshots').select('payload,run_id,pupil_id').eq('id',id).maybeSingle();
 if(r.error||!r.data)notFound();
 const report=r.data.payload as PupilReport,pupilId=r.data.pupil_id as string;
 const [att,photo]=await Promise.all([
  client.from('teamville_attendance').select('status').eq('pupil_id',pupilId).eq('session',report.session).eq('term',report.term),
  client.from('teamville_pupil_photos').select('pupil_id').eq('pupil_id',pupilId).maybeSingle(),
 ]);
 return <main id="main-content" className="sp-main sp-print-document">
  <div className="sp-panel-heading sp-no-print"><Link href="/school/results" className="sp-back">← Results</Link><SchoolPrintButton label="Download PDF / Print"/></div>
  <div className="sp-report-pages"><div className="sp-report-page"><SchoolReportSheet report={report} published pupilId={pupilId} photo={!photo.error&&!!photo.data} attendance={att.error?null:attendanceSummary(att.data||[])}/></div></div>
 </main>;
}
