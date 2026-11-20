# Teamville end-of-term report card and mobile result entry: design

Status: draft for approval · 20 November 2026

## Why

The school wants a traditional Nigerian end-of-term report card (reference: the sample "First Term Academic Report" layout supplied by the school) carrying Teamville's own name, crest, address and motto. It has two audiences:

- **Parents** must be able to open a child's report and save or print it as a PDF as easily as they do fee receipts today.
- **Teachers** mostly have no laptops. They must be able to enter every score, rating and comment for a class of about 25 pupils and about 10 subjects **from a phone**, without losing work, and then press one button to have the system calculate everything else.

Success: a teacher completes a class's term results on a phone without help; the head of school publishes them; a parent opens the report and gets a clean one-page A4 PDF.

## Goals

1. New assessment format: **CA1 /10 + CA2 /10 + CA3 /10 = CA /30, Exam /70, Total /100** per subject.
2. Automatic calculation of everything that is not judgement: CA total, subject total, grade, remark, subject position, class average per subject, cumulative and cumulative average across terms, overall total, percentage, overall grade and class position.
3. Phone-first entry for scores, affective and psychomotor ratings, and comments.
4. A printable A4 report card (one pupil per page) with a whole-class print option, saved as PDF through the browser exactly like receipts.
5. Passport photos on the card, with a phone-friendly class photo page for uploading them.

## Non-goals

- Server-generated PDF files. This is a possible later upgrade if saving from iPhones proves awkward (see Approaches).
- Converting marks already entered under the old CA /40 + Exam /60 format. Those cycles and their published snapshots stay exactly as they are and keep rendering with the current card.
- Redesigning the separate **midterm** report. It continues to work as today. *(Builder's call; see the list at the end.)*
- Gender on the card: it is not stored today, so the card shows admission number instead.

## Anti-goals (a failure even if it "works")

- A teacher loses typed scores because the network dropped or the phone locked.
- Parents see a draft, or any pupil's report other than their own linked child.
- Published reports change silently. Published snapshots stay immutable, and corrections create a new version, as today.
- The card spills onto a second A4 page for a normal pupil (10–13 subjects).

## Approaches considered

| | How | Trade-off |
|---|---|---|
| **A. Print-ready page, browser saves the PDF** (chosen) | The report is an HTML page styled to one A4 sheet (`@page { size: A4 }`). "Print / save PDF" calls `window.print()`. The whole-class view renders every card with a page break between them. | Same mechanism as receipts, so it's familiar to staff and parents. Fastest to build, and screen and print come from one layout. Saving a PDF on iPhone takes a few extra taps. |
| B. Server-generated PDF | A route returns a real `.pdf` built with a PDF library. | One file that's identical on every phone and easy to share on WhatsApp. About twice the work, a second layout to maintain, and a new dependency. |
| C. Headless browser rendering on the server | Chromium renders the HTML to PDF. | Exact PDFs from one layout, but heavy on Vercel and slow. Rejected. |

**Chosen: A.** The school confirmed parents should get the same experience as receipts, which already use A. Moving to B later won't waste the layout work.

## What the school decided

- Marks: CA1, CA2 and CA3 out of 10 each, Exam out of 70.
- The system calculates positions, averages and cumulatives. Staff only enter scores, ratings and comments.
- Entry happens on phones.
- Passport photos per pupil appear on the card.
- Download works like receipts.

## Design

### 1. Report card layout (A4 portrait, one page)

```
┌──────────── TEAMVILLE MONTESSORI SCHOOL ─────────── [passport] ┐
│ [crest] 16 University Crescent, Bodija, Ibadan · 0803 854 8782  │
│         …raising a total CHILD                                  │
│                 FIRST TERM ACADEMIC REPORT                      │
├────────── PUPIL ──────────────┬─────────── SUMMARY ─────────────┤
│ Name · Admission no · Class   │ Total · Obtainable · %          │
│ Session · Term                │ Grade · Remark · Position x of y│
│ ATTENDANCE Opened · Present · Absent (with %)                   │
├─────────────────────────────────────────────────────────────────┤
│ Subject │CA1│CA2│CA3│CA│Exam│Total│Last cum.│Cum avg│Class avg│Gr│Pos│Remark │
│  (max)  │10 │10 │10 │30│ 70 │ 100 │         │       │         │  │   │       │
├──────────── AFFECTIVE (5–1) ───┬──────── PSYCHOMOTOR (5–1) ─────┤
│ Attentiveness ✓ …              │ Handling of tools ✓ …           │
├─────────────────────────────────────────────────────────────────┤
│ Grade key · Remark key                                          │
│ Class teacher: name, comment, signature │ Head of school: name, │
│                                         │ comment, signature    │
│ Term ends: date                         │ Next term begins: date│
└─────────────────────────────────────────────────────────────────┘
```

- Built as a new component (for example `report-card-v2.tsx`) for snapshots with `layout: 2`. The existing `SchoolReportCard` keeps rendering older snapshots unchanged.
- Print CSS uses the existing `@page` approach from `demo-workspace.css` and `receipts.css`. Font sizes and row heights are tuned so that up to 14 subjects fit on one page.
- On screen at phone width, the subject table scrolls sideways inside its box, and the rest of the card stacks.
- Missing data shows "—", never an empty-looking zero. Term 1 has no "last cumulative", so those cells show "—".

### 2. Calculations (pure functions, extending `term-results.ts`)

Let a pupil's subject total be `T = CA1 + CA2 + CA3 + Exam`.

| Field | Rule |
|---|---|
| CA | CA1 + CA2 + CA3 |
| Grade, remark | From the school's grade bands, by `T`. Each band also carries a remark label (default Excellent / Very Good / Good / Fair / Poor), editable alongside the bands. |
| Subject position | Rank of `T` among class pupils with a complete report in this cycle. Ties are shared (1, 2, 2, 4). |
| Class average (subject) | Mean of `T` over ranked pupils, to 2 decimal places. |
| Last cumulative | Sum of this subject's published totals from the earlier terms of the same session. |
| Cumulative average | (Last cumulative + `T`) ÷ number of terms included. |
| Overall total, obtainable, % | Σ`T`, subjects × 100, and Σ`T` ÷ obtainable. |
| Class position | The existing `rankPupilReports` on overall total, with shared ties and a provisional flag when the class is incomplete. |

Calculation runs when the teacher presses **Calculate results** (the existing submit step) and again when the head of school publishes. The published snapshot stores the calculated values, so the card never recalculates after publishing.

### 3. Teacher entry on a phone

All screens sit under `/school/results`. Each is usable at 360px wide, with tap targets of at least 44px.

1. **Class checklist.** Pick a class and term to see each subject's progress ("Maths 25/25 ✓, English 18/25") plus rows for Ratings, Comments and Passports, then a **Calculate results** button. The button is disabled until every subject is complete, and it says what's missing.
2. **Scores by subject** (an extension of `class-marks-entry.tsx`). Each pupil gets four numeric boxes, CA1, CA2, CA3 and Exam, with `inputMode="numeric"` and `enterKeyHint="next"`. The total and grade show live. Values over the maximum are blocked as they're typed.
3. **Autosave per pupil.** When a pupil's row loses focus, it saves through a server action. Each row shows ✓ saved, ⟳ saving or ⚠ retry. Unsaved rows are also kept in the browser's `localStorage` until confirmed, so a dropped connection or locked phone loses nothing, and the page warns before you leave it with unsaved rows.
4. **Ratings by trait.** Pick a trait, such as Punctuality, to see each pupil with five tap buttons from 5 down to 1, plus a "Set everyone to 4" shortcut. Then move to the next trait.
   - Affective: Attentiveness, Honesty, Neatness, Politeness, Punctuality, Self-control.
   - Psychomotor: Handling of tools, Drawing and painting, Handwriting, Speech fluency, Sports and games.
   - These replace the current four three-level "classroom habits" for new-format cycles only.
5. **Comments.** One pupil per card. A suggested class-teacher comment is generated from the pupil's average and their strongest and weakest subjects (from a short bank of phrases per grade band). "Use suggestion" fills it in, and the teacher can edit it. Maximum 300 characters.
6. **Head of school review** (admin or HOS). The existing review and publish step, plus a head-of-school comment for each pupil, with the same suggestion mechanism and a "use suggestions for all" option.

### 4. Term settings (admin, once per term)

Term start date, term end date and next-term start date, per session and term. These drive "Term ends", "Next term begins" and the attendance window. "Days opened" means distinct dates in the term window with a saved register for the class.

### 5. Signatures and passports

- **Signatures:** an admin uploads a signature image for each teacher and the head of school. It's re-encoded with `sharp` to a transparent or white PNG at most 600×200 and stored in a private bucket. The card uses the class teacher's and the head's current signatures at publish time, and the snapshot stores the storage path so old reports keep the signature they were published with.
- **Passports:** reuse the existing `teamville_pupil_photos` store and `preparePupilPhoto`. Add a class passport page that lists pupils as photo / missing. Tapping one opens `<input type="file" accept="image/*" capture="user">`, so a phone can take the picture directly. Cropping stays centred, to 3:4.

### 6. Parent and pupil download

- Parent and pupil views link each published report to `/school/reports/[id]`, which already exists. Its print button becomes **Download PDF / Print**, the same behaviour as receipts.
- Admins and class teachers get **Print whole class**: every published card for a cycle, one per page.

### 7. Data changes (Supabase)

Written as one reviewed SQL migration, committed under `supabase/migrations/`. The current schema has to be read first, because the existing tables, RLS policies and `teamville_*` functions are not in this repository.

- Term marks: add `ca1`, `ca2`, `ca3` columns (numeric, 0–10, nullable). Exam is 0–70 for cycles with `format = 'ca3'`.
- Term cycles: add `format` (`'legacy' | 'ca3'`, default `'legacy'` for existing rows, `'ca3'` for new ones). `openTermResults` currently hard-codes `p_term: 1`. Make the term selectable (1, 2 or 3), because cumulative columns need later terms.
- Grade bands: add a `remark` label.
- New tables: `term_settings` (dates), `report_ratings` (cycle, pupil, trait, 1–5), `report_comments` (cycle, pupil, kind = teacher | head, text), `staff_signatures` (user, path).
- RLS: teachers read and write only their assigned classes' marks, ratings and teacher comments, and only while the cycle is open. Head comments are admin or HOS only. Families read nothing except published snapshots of linked pupils, as today. Every write goes through `SECURITY DEFINER` functions that check the role and the cycle state, matching the existing pattern.
- Snapshot payload: add `layout: 2` and the new fields. Older snapshots are untouched.

### 8. Testing

- Unit tests for the calculation functions: ties, an incomplete class, Term 1 with no cumulative, and Term 3 cumulative.
- A test of the migration's RLS on a scratch database: teacher scope, a teacher writing to another class, a family reading a draft.
- Browser check at 390×844: enter scores for two pupils, kill the network, reload, and confirm the unsaved rows are restored. Then print preview, confirming one A4 page for 13 subjects.

### 9. Rollout

1. Export the database setup (a read-only query run in the Supabase SQL editor), then write and review the migration.
2. Apply the migration.
3. Deploy the code.
4. Open a test cycle for one class.
5. Have one teacher fill it in on a phone.
6. Have the head of school publish it, and a parent account download it.
7. Turn it on for all classes.

## Calls made by the designer (check these)

1. The old CA /40 + Exam /60 marks this term are **not converted**. New-format cycles start with the next one opened.
2. The **midterm report stays as it is**. The new card is the end-of-term report only.
3. Remark labels default to Excellent / Very Good / Good / Fair / Poor, tied to the school's existing grade bands, and can be edited.
4. The trait lists follow the sample (6 affective, 5 psychomotor).
5. Comments are suggested from results, and a teacher can always edit them. Nothing is published without a person accepting it.
6. Gender is not shown, because it isn't recorded.
7. "Days opened" counts days with a saved class register in the term window.
