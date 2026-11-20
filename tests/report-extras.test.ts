import {describe,expect,it} from 'vitest';
import {attendanceSummary,gradeRemark,subjectClassStats} from '../src/lib/teamville-school/report-extras';
import type {PupilReport} from '../src/lib/teamville-school/term-results';

const bands=[{grade:'E',min:0},{grade:'A',min:80},{grade:'C',min:60},{grade:'B',min:70},{grade:'D',min:50}];
const report=(totals:Record<string,number>,kind:'exam'|'midterm'='exam'):PupilReport=>({pupil_name:'X',admission_number:null,class_name:'Grade 5',session:'2026/2027',term:1,kind,
 subjects:Object.entries(totals).map(([subject,t])=>({subject,ca:null,exam:null,midterm:kind==='midterm'?t:null,total:kind==='exam'?t:t/40*100,grade:'A'})),
 total:0,maximum:0,average:0,grade:'A',ca_max:40,exam_max:60,midterm_max:40,bands});

describe('subjectClassStats',()=>{
 it('ranks each subject with shared ties and averages to 2 decimals',()=>{
  const stats=subjectClassStats([{pupil_id:'a',report:report({MATHS:80})},{pupil_id:'b',report:report({MATHS:70})},{pupil_id:'c',report:report({MATHS:70})},{pupil_id:'d',report:report({MATHS:60})}]);
  const maths=stats.get('MATHS')!;
  expect(maths.average).toBe(70);
  expect(['a','b','c','d'].map(id=>maths.positions.get(id))).toEqual([1,2,2,4]);
 });
 it('uses raw midterm scores for midterm reports',()=>{
  const stats=subjectClassStats([{pupil_id:'a',report:report({MATHS:30},'midterm')},{pupil_id:'b',report:report({MATHS:25},'midterm')}]);
  expect(stats.get('MATHS')!.average).toBe(27.5);
  expect(stats.get('MATHS')!.positions.get('b')).toBe(2);
 });
});

describe('gradeRemark',()=>{
 it('maps bands from highest to lowest',()=>{
  expect(gradeRemark('A',bands)).toBe('Excellent');
  expect(gradeRemark('B',bands)).toBe('Very Good');
  expect(gradeRemark('C',bands)).toBe('Good');
  expect(gradeRemark('D',bands)).toBe('Fair');
  expect(gradeRemark('E',bands)).toBe('Poor');
  expect(gradeRemark('Z',bands)).toBe('—');
 });
});

describe('attendanceSummary',()=>{
 it('returns null when nothing is recorded',()=>{expect(attendanceSummary([])).toBeNull();});
 it('counts late as present and excused as absent',()=>{
  expect(attendanceSummary([{status:'present'},{status:'late'},{status:'absent'},{status:'excused'}])).toEqual({opened:4,present:2,absent:2});
 });
});
