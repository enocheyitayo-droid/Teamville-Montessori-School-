'use server';
import {randomUUID} from 'node:crypto';
import {redirect,notFound} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireSchoolAdmin} from './auth';
import {validMemberId} from './access-input';
import {preparePupilPhoto,pupilPhotoLimit} from './pupil-photo-image';
export async function uploadPupilPhoto(form:FormData){
 const {client}=await requireSchoolAdmin(),id=String(form.get('pupil_id')||'');if(!validMemberId(id))notFound();
 const url=`/school/pupils/${id}`,file=form.get('photo');
 const pupil=await client.from('teamville_pupils').select('id').eq('id',id).maybeSingle();if(pupil.error||!pupil.data)notFound();
 if(!(file instanceof File)||!file.size||file.size>pupilPhotoLimit)redirect(url+'?photo=invalid');
 let bytes:Buffer;try{bytes=await preparePupilPhoto(file.name,file.type,new Uint8Array(await file.arrayBuffer()));}catch{redirect(url+'?photo=invalid');}
 const old=await client.from('teamville_pupil_photos').select('path').eq('pupil_id',id).maybeSingle();if(old.error)redirect(url+'?photo=error');
 const path=`${id}/${randomUUID()}.jpg`,bucket=client.storage.from('teamville-pupil-photos');
 const upload=await bucket.upload(path,bytes,{contentType:'image/jpeg',upsert:false});if(upload.error)redirect(url+'?photo=error');
 const saved=await client.rpc('teamville_set_pupil_photo',{p_pupil:id,p_path:path});
 if(saved.error){await bucket.remove([path]);redirect(url+'?photo=error');}
 if(old.data?.path)await bucket.remove([old.data.path]);
 revalidatePath('/school','layout');redirect(url+'?photo=saved');
}
