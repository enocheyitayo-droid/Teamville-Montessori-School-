import sharp from 'sharp';
export const pupilPhotoLimit=3*1024*1024;
export async function preparePupilPhoto(name:string,type:string,bytes:Uint8Array){
 if(!bytes.length||bytes.length>pupilPhotoLimit||!['image/jpeg','image/png','image/webp'].includes(type)||!/[.](jpe?g|png|webp)$/i.test(name))throw new Error('Choose a JPG, PNG or WebP image up to 3 MB.');
 const image=sharp(bytes,{limitInputPixels:16000000,failOn:'warning'}),meta=await image.metadata();
 if(!['jpeg','png','webp'].includes(meta.format||'')||(meta.pages||1)>1)throw new Error('Choose a still photo.');
 // Re-encoding removes embedded metadata, including GPS, and rejects disguised files.
 return image.rotate().resize(512,512,{fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:85}).toBuffer();
}
