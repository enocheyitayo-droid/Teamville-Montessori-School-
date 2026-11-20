# Report Sheet (Step 1, no database changes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Downloadable pupil report cards in the school's traditional A4 layout, using only data the portal already stores.

**Architecture:** Pure calculation helpers (`report-extras.ts`) produce subject class averages, subject positions, remarks and attendance totals. A new presentational component, `SchoolReportSheet`, renders the sample's layout. The staff download page and the published-report page load the extra data under the user's own session (RLS) and pass it in. The on-screen preview in Academics & results keeps the existing card.

**Tech Stack:** Next.js 16 App Router (server components), Supabase JS, CSS print media, Vitest for the pure helpers.

**Spec:** `docs/superpowers/specs/2026-11-20-report-card-design.md` (Step 1 = layout with existing data. CA1/CA2/CA3, trait ratings 1–5, head comment, signatures and next-term date wait for Step 2.)

## Global Constraints

- No Supabase schema changes, and no service-role key in these pages.
- School header: "Teamville Montessori School", "16 University Crescent, Bodija, Ibadan", "0803 854 8782", "teamville01montessori@gmail.com", motto "…raising a total CHILD", crest `/brand/teamville-logo.png`.
- One pupil per A4 portrait page, for up to 20 subjects.
- Missing values print as "—", never as 0.
- Remarks follow grade bands sorted high to low: Excellent, Very Good, Good, Fair, then Poor for every lower band.

## Review Focus

- Ties in a subject share a position (1, 2, 2, 4). The helper test pins this.
- A pupil with no attendance rows shows "—", not 0 of 0. The helper test pins this.
- If the attendance query fails (unknown column, RLS), the sheet still renders, with attendance as "—". The page catches the error.
- Parent view: only one snapshot is visible, so class average and subject position columns must be hidden rather than computed from one pupil. The sheet prop `stats` is optional, and its columns are omitted when absent.
- Pupil without a passport: no broken image. The page only passes `photo` when a `teamville_pupil_photos` row exists.

---

### Task 1: Calculation helpers

**Files:**
- Create: `src/lib/teamville-school/report-extras.ts`
- Create: `tests/report-extras.test.ts`
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)

**Interfaces:**
- Produces:
  - `type SubjectStats = Map<string,{average:number;positions:Map<string,number>}>`
  - `subjectClassStats(rows:{pupil_id:string;report:PupilReport}[]):SubjectStats`. The score is `subject.total` for exam reports and `subject.midterm` for midterm reports. The average is rounded to 2 decimal places.
  - `gradeRemark(grade:string,bands:TermRules['bands']):string`
  - `type AttendanceSummary={opened:number;present:number;absent:number}|null`
  - `attendanceSummary(rows:{status:string}[]):AttendanceSummary`. Opened = rows, present = present + late, absent = absent + excused, and null when there are no rows.

- [ ] Step 1: Write the tests. Totals 80, 70, 70, 60 give positions 1, 2, 2, 4 and an average of 70. `gradeRemark('A', bands)` is "Excellent", `'C'` is "Good", `'E'` is "Poor", and an unknown grade is "—". `attendanceSummary([])` is null. `['present','late','absent','excused']` gives `{opened:4,present:2,absent:2}`.
- [ ] Step 2: `npx vitest run` fails, with the module not found.
- [ ] Step 3: Implement the helpers.
- [ ] Step 4: `npx vitest run` passes.
- [ ] Step 5: Commit.

### Task 2: `SchoolReportSheet` component and print styles

**Files:**
- Create: `src/app/school/_components/report-sheet.tsx`
- Create: `src/app/school/report-sheet.css` (imported in `src/app/school/layout.tsx`)

**Interfaces:**
- Consumes: Task 1 types.
- Produces: `SchoolReportSheet({report,published,pupilId,photo,attendance,stats}:{report:PupilReport;published:boolean;pupilId:string;photo?:boolean;attendance?:AttendanceSummary;stats?:SubjectStats})`

Layout, top to bottom:
1. Header: crest, name, address, contact and motto, with the passport (`/school/pupils/{pupilId}/photo`) when `photo` is set.
2. Title: "FIRST/SECOND/THIRD TERM ACADEMIC REPORT" for exam reports, or "… MIDTERM REPORT".
3. Draft banner when not published.
4. Two columns. Pupil: name, admission number, class, session. Summary: total, obtainable, %, grade, remark, position x of y.
5. Attendance row: opened, present (%), absent (%).
6. Subject table. Exam columns: CA/40, Exam/60, Total/100, then Class avg and Pos. (only with `stats`), Grade, Remark. Midterm columns: CA/40, %, then Class avg and Pos. (only with `stats`), Grade, Remark.
7. Classroom habits grid with Very good / Good / Needs support columns and ✓ marks.
8. Class teacher's comment.
9. Grade key.
10. Signature lines (class teacher, head of school), then "— End of Report —".

- [ ] Step 1: Build it. `npx tsc --noEmit` passes.
- [ ] Step 2: Commit.

### Task 3: Use the sheet for downloads

**Files:**
- Modify: `src/app/school/results/reports/page.tsx`
- Modify: `src/app/school/reports/[id]/page.tsx`

- Staff downloads: compute `subjectClassStats` from all cards in the class (snapshots when published, drafts otherwise). Read `teamville_attendance` (`pupil_id,status`) for the class pupils with `.eq('session',cycle.session).eq('term',cycle.term)`. On error, use no attendance. Read `teamville_pupil_photos` (`pupil_id`) to decide `photo`.
- Published report page (parents): read the snapshot's `pupil_id`, that pupil's attendance and photo, and pass no `stats`.
- [ ] Step 1: Wire both pages. `npx tsc --noEmit` passes.
- [ ] Step 2: Browser check with local fixture data at 390px and A4 PDF: one page per pupil, 18 subjects fit, no 404 image, attendance "—" when no rows.
- [ ] Step 3: `npx next build` passes. Commit and push.
