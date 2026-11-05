# Teamville school website

This contains the public website and the private pupil-dashboard pilot at /school. Private records are fetched from Supabase after authentication and RLS checks. Raw pupil exports, local SQLite databases, account credentials and unrelated school applications are excluded.

## Run

Install dependencies with npm install, then run npm run dev. npm run build checks the production build.

## Deploy on Vercel

Push this folder's contents to a separate Teamville website repository. In Vercel choose Add New Project and import that repository. Use the Next.js framework preset, repository root as Root Directory, and the default build/output settings. The enquiry endpoint requires the server-only TEAMVILLE_SUPABASE_URL, TEAMVILLE_SUPABASE_SECRET_KEY and TEAMVILLE_ENQUIRY_RATE_SECRET variables and the separately applied website enquiry migration. The /school pilot also needs TEAMVILLE_SUPABASE_PUBLISHABLE_KEY and the reviewed school-record migration. The complete teacher/result-entry workflow is not included yet.

Set NEXT_PUBLIC_SITE_URL=https://teamvillemontessorischool.com. Analytics and Search Console values are optional and can be configured later. Google Analytics requires consent and the official hostname; disable Enhanced Measurement before enabling the provided measurement ID.

Keep the initial deployment on its Vercel preview address for review. Add the custom domain in Vercel after it works, then use the DNS values Vercel provides. Preserve the Namecheap mail records used by Roundcube; changing website hosting must not remove email routing or authentication records.

The School Portal page currently opens the supplied external Schoolcube links. The replacement Teamville portal will be a separate deployment later. /api/health checks this website's application runtime only.


