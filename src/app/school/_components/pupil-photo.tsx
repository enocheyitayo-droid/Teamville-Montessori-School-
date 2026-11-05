/* Private photos use an authenticated same-origin endpoint, never a public or signed URL. */
import {requireSchoolAccount} from '@/lib/teamville-school/auth';
import {uploadPupilPhoto} from '@/lib/teamville-school/photo-actions';
import {SchoolSubmit} from '@/components/school-submit';
export async function PupilPhoto({id,name,editable=false}:{id:string;name:string;editable?:boolean}){
 const {client,member}=await requireSchoolAccount();
 const photo=await client.from('teamville_pupil_photos').select('updated_at').eq('pupil_id',id).maybeSingle();
 if(photo.error)throw new Error('Unable to load pupil photo.');
 return <section className="sp-panel"><h2>Profile photo</h2>{photo.data?
 // eslint-disable-next-line @next/next/no-img-element -- private cookie-authenticated endpoint
 <img src={`/school/pupils/${id}/photo?v=${encodeURIComponent(photo.data.updated_at)}`} alt={`${name} profile photo`} width={160} height={160} style={{objectFit:'cover',borderRadius:16}}/>:<p className="sp-small">No profile photo uploaded yet.</p>}
 {editable&&member.role==='admin'&&<form action={uploadPupilPhoto}><input type="hidden" name="pupil_id" value={id}/><label htmlFor="pupil-photo">{photo.data?'Replace photo':'Upload pupil photo'}</label><p className="sp-small">Choose a JPG, PNG or WebP photo up to 3 MB. Check that it is the correct child before uploading. Photos stay inside the private portal.</p><input id="pupil-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required/><SchoolSubmit pendingLabel="Uploading photo…">Save profile photo</SchoolSubmit></form>}</section>;
}
