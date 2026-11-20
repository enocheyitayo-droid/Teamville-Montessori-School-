import {SchoolSubmit} from '@/components/school-submit';
import {saveTeacherFeedback} from '@/lib/teamville-school/result-actions';

export const teacherHabits = ['Punctuality', 'Class participation', 'Conduct', 'Homework'] as const;
const ratings = ['Very good', 'Good', 'Needs support'];

export function TeacherFeedbackFields({feedback = {}}:{feedback?: Record<string,string>}) {
 return <>
  <div className="sp-feedback-ratings">
   <h3>Classroom habits</h3>
   {teacherHabits.map(habit => (
    <fieldset key={habit}>
     <legend>{habit}</legend>
     <div className="sp-feedback-options">
      {ratings.map(rating => (
       <label key={rating}>
        <input type="radio" name={habit} value={rating} defaultChecked={feedback[habit] === rating}/>
        <span>{rating}</span>
       </label>
      ))}
     </div>
     <label className="sp-feedback-clear">
      <input type="radio" name={habit} value="" defaultChecked={!feedback[habit]}/><span>Not rated</span>
     </label>
    </fieldset>
   ))}
  </div>
  <div className="sp-feedback-note">
   <label className="sp-marks-field">
    Note to the family
    <textarea name="comment" rows={3} maxLength={500} defaultValue={feedback.comment ?? ''}
      placeholder="What is going well? What can the pupil work on next?"/>
   </label>
  </div>
 </>;
}

export function TeacherFeedbackEditor({cycle,pupil,name,kind,feedback,saved}:{
 cycle:string;pupil:string;name:string;kind:'midterm'|'exam';feedback:Record<string,string>;saved:boolean;
}) {
 return <section id="teacher-feedback" className="sp-feedback sp-no-print">
  <header className="sp-feedback-header">
   <h2>Teacher comments</h2>
   <p>{name} · {kind === 'midterm' ? 'Midterm report' : 'Final report'}</p>
  </header>
  <form key={cycle + pupil + JSON.stringify(feedback)} action={saveTeacherFeedback}>
   <input name="cycle" type="hidden" value={cycle}/>
   <input name="pupil" type="hidden" value={pupil}/>
   <TeacherFeedbackFields feedback={feedback}/>
   <div className="sp-feedback-save">
    <span role="status">{saved ? 'Draft comment saved' : ''}</span>
    <SchoolSubmit pendingLabel="Saving…">Save draft comment</SchoolSubmit>
   </div>
  </form>
 </section>;
}

export function TeacherFeedbackReport({feedback}:{feedback?:Record<string,string>}) {
 if (!feedback || ![...teacherHabits,'comment'].some(field => feedback[field])) return null;
 return <section className="sp-feedback-report">
  <h3>Teacher comments</h3>
  <dl>{teacherHabits.filter(habit => feedback[habit]).map(habit => (
   <div key={habit}><dt>{habit}</dt><dd>{feedback[habit]}</dd></div>
  ))}</dl>
  {feedback.comment && <p>{feedback.comment}</p>}
 </section>;
}
