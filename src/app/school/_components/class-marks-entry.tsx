'use client';

import {useState} from 'react';
import {SchoolSubmit} from '@/components/school-submit';
import type {TermMark} from '@/lib/teamville-school/term-results';

type Pupil = {id: string; name: string};
type Props = {
  cycle: string;
  kind: 'midterm' | 'exam';
  subjects: string[];
  pupils: Pupil[];
  marks: Pick<TermMark, 'pupil_id' | 'subject' | 'ca' | 'exam' | 'midterm'>[];
  maximum: number;
  caMaximum: number;
  initialSubject?: string;
  save: (form: FormData) => void | Promise<void>;
  saved?: boolean;
};

export function ClassMarksEntry({
  cycle, kind, subjects, pupils, marks, maximum, caMaximum, initialSubject, save, saved,
}: Props) {
  const [subject, setSubject] = useState(
    initialSubject && subjects.includes(initialSubject) ? initialSubject : subjects[0],
  );
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const exam = kind === 'exam';
  const marksByPupil = new Map(marks.filter(mark => mark.subject === subject).map(mark => [mark.pupil_id, mark]));
  const original = (id: string) => String(marksByPupil.get(id)?.[kind] ?? '');
  const pending = pupils.filter(({id}) => edits[id] !== undefined && edits[id] !== '' && edits[id] !== original(id));
  const visible = pupils.filter(({name}) => name.toLowerCase().includes(query.trim().toLowerCase()));
  const entered = pupils.filter(({id}) => original(id) !== '').length;

  return (
    <section id="enter-marks" className="sp-panel sp-no-print sp-class-marks">
      <h2>{exam ? 'Enter exam scores' : 'Enter midterm scores'}</h2>
      <p>Choose a subject and enter scores out of {maximum}. {exam && 'The CA column shows scores carried forward from midterm.'}</p>
      {saved && <p role="status">Draft scores saved.</p>}
      <label className="sp-marks-field">
        Subject
        <select value={subject} onChange={event => {
          if (pending.length && !window.confirm('Switch subjects and discard the unsaved scores?')) return;
          setSubject(event.target.value);
          setEdits({});
        }}>
          {subjects.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>
      <label className="sp-marks-field">
        Find a pupil
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name" />
      </label>
      <p className="sp-small">{entered} of {pupils.length} scores saved for {subject}. Enter 0 for a zero score.</p>
      <form action={save}>
        <input type="hidden" name="cycle" value={cycle}/>
        <input type="hidden" name="subject" value={subject}/>
        <input type="hidden" name="component" value={kind}/>
        <div className="sp-marks-list">
          {pupils.map(({id, name}) => {
            const mark = marksByPupil.get(id);
            const isVisible = visible.some(pupil => pupil.id === id);
            return (
              <label key={id} className="sp-marks-row" hidden={!isVisible}>
                <span>
                  <strong>{name}</strong>
                  {exam && <small>CA {mark?.ca ?? '—'} / {caMaximum}</small>}
                </span>
                <span className="sp-marks-input">
                  <input aria-label={`${name} ${exam ? 'exam' : 'midterm'} score`}
                    name={pending.some(pupil => pupil.id === id) ? `score_${id}` : undefined}
                    type="number" inputMode="decimal" min={0} max={maximum} step="0.01"
                    value={edits[id] ?? original(id)}
                    onChange={event => setEdits(previous => ({...previous, [id]: event.target.value}))}
                  />
                  <small>/ {maximum}</small>
                </span>
              </label>
            );
          })}
          {visible.length === 0 && <p>No pupils match your search.</p>}
        </div>
        <div className="sp-marks-save">
          <span aria-live="polite">{pending.length} {pending.length === 1 ? 'score' : 'scores'} to save</span>
          <SchoolSubmit disabled={pending.length === 0} pendingLabel="Saving…">Save draft scores</SchoolSubmit>
        </div>
      </form>
      <p className="sp-small">Blank fields leave saved scores as they are. Use the individual pupil editor to clear a saved score.</p>
    </section>
  );
}
