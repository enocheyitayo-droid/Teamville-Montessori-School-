# Teamville Montessori School — website and school portal

Source for **[teamvillemontessorischool.com](https://teamvillemontessorischool.com)**: the public school website and the private Teamville school portal at `/school`, used by the head of school, administrators, teachers, parents and pupils in Bodija, Ibadan.

Built with Next.js 16 (App Router), React 19 and Supabase (Postgres, Auth and Storage). Hosted on Vercel in the Paris region (`cdg1`).

## What's inside

### Public website

| Page | Path |
| --- | --- |
| Home | `/` |
| About, Learning, Activities | `/about`, `/learning`, `/activities` |
| Admissions | `/admissions` |
| Gallery (photos and videos) | `/gallery` |
| Head of school | `/head-of-school` |
| Contact and enquiry form | `/contact` |
| Portal introduction | `/school-portal` |
| Cookie preferences | `/cookies` |

Supporting files: `robots.txt`, `sitemap.xml`, School structured data (JSON-LD) and Open Graph previews. Google Analytics loads **only after the visitor accepts analytics cookies**.

### School portal (`/school`, sign-in required)

- **Accounts:** invitation and activation links, username or email sign-in, forced password setup, admin-managed password resets, suspension.
- **Pupils:** register, profiles, photos (re-encoded to strip location metadata), admission requests and approval.
- **Teaching:** attendance, lesson notes (PDF), assessments, term marks (manual or CSV), teacher feedback, report cards, class positions.
- **Finance:** fee bills, itemised payments, receipts, statements, debtor/status exports, school purse and expenses.
- **Payroll:** salaries and payslips (**head of school only**).
- **Families:** parent and pupil views of linked children's results, fees and notices.

## How access is protected

- Every portal request passes through `src/proxy.ts`. Signed-out visitors are redirected to `/school/login`, and private pages are sent with `no-store` and `noindex`.
- The portal reads data with the **signed-in user's own Supabase session**, so Postgres row-level security (RLS) decides what each person can see. Pages and actions also check the role (`requireSchoolAccount`, `requireSchoolAdmin`, `requireSchoolHOS` in `src/lib/teamville-school/auth.ts`).
- The Supabase **secret key is server-only**. It is used only for account provisioning, username sign-in lookup and the website enquiry endpoint. It must never be given a `NEXT_PUBLIC_` name.
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Strict` and scoped to `/school`.
- The enquiry form checks its origin and body size, includes a honeypot field, and is rate-limited by a salted hash of the visitor's IP address.
- Security headers are set in `next.config.mjs`. Vercel adds HSTS.

> **Important:** the database schema, RLS policies and `teamville_*` SQL functions live in Supabase and are **not in this repository**. Most of the security model depends on them. Export them into version control. See *Database* below.

## Run locally

Requires Node.js 24 and npm.

```bash
npm ci
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

Checks before deploying:

```bash
npm run typecheck
npm run build
npm audit --omit=dev
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL, `https://teamvillemontessorischool.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | public, optional | Google Analytics (consent-gated) |
| `GOOGLE_SITE_VERIFICATION` | optional | Search Console verification |
| `TEAMVILLE_SUPABASE_URL` | server | Supabase project URL |
| `TEAMVILLE_SUPABASE_PUBLISHABLE_KEY` | server | Portal sign-in and user-scoped queries |
| `TEAMVILLE_SUPABASE_SECRET_KEY` | server, **secret** | Account provisioning, username lookup, enquiries |
| `TEAMVILLE_ENQUIRY_RATE_SECRET` | server, **secret** | Salt for enquiry rate limiting (32+ characters) |

Set production values in **Vercel → Project → Settings → Environment Variables**. Never commit `.env*` files; `.gitignore` and `.vercelignore` already exclude them.

## Deploy

This project is deployed to Vercel. Production serves `teamvillemontessorischool.com`.

- **From GitHub (recommended):** connect this repository in Vercel. Pull requests then get preview URLs, and merging to the production branch deploys.
- **From your computer:** `vercel` creates a preview and `vercel --prod` deploys to production. Push the same commit to GitHub as well, so the repository always matches what is live.

DNS is managed at Namecheap. Keep the existing mail records (Roundcube) when changing website DNS.

## Database

Supabase holds the tables, RLS policies, storage bucket (`teamville-pupil-photos`) and SQL functions the portal calls (for example `teamville_issue_selected_bills` and `teamville_admin_set_access`). To keep a reviewable, restorable copy, export the schema into this repository:

```bash
npx supabase db dump --schema-only -f supabase/schema.sql
```

Make sure daily backups or point-in-time recovery are enabled on the Supabase project.

## Project structure

```text
src/app/                 Public pages, robots, sitemap, /api/enquiries, /api/health
src/app/school/          Portal pages, exports (CSV/PDF) and route handlers
src/components/          Website and portal UI
src/lib/teamville-school Auth, server actions, finance/result logic, CSV parsing
src/lib/website-*        Enquiry handling and SEO helpers
src/proxy.ts             Portal session refresh and sign-in redirect
public/                  Logo and approved school photos
```

## Privacy

The portal stores children's personal data and school records. Access is restricted to invited accounts. Real pupil exports, database dumps containing data, and credentials must never be committed to this repository. Use only photos of children for which the school holds parental consent.
