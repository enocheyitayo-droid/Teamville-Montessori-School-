/** Add school-approved clips here after placing the files in public/school/videos.
 * Keep pupil names out of captions. A caption file is required for spoken audio.
 */
export type SchoolVideo = {
  src: string;
  poster: string;
  title: string;
  description: string;
  captions?: string;
  hasSpeech: boolean;
};

export const schoolVideos: SchoolVideo[] = [];
