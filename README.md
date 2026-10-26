# RoyalPlay — Demo Lounge

**Status:** source-code prototype. It is not deployed or verified as working against a live Supabase project.

This project is a visual game-lounge demo with account registration/login and **virtual points only**. It does not accept deposits, payments, bets, cash-out, or real-money prizes. It is not a production gambling platform.

## Included
- Next.js + TypeScript responsive interface
- Supabase email/password authentication
- PostgreSQL profiles with virtual points
- Row Level Security (RLS)
- Server-side PostgreSQL function for bounded demo-point changes
- Demo activity ledger table (user can read their own activity)
- No payment provider integration

## Requirements
- Node.js 20.9+ (recommended)
- A Supabase project
- npm

## Run locally
1. Extract the ZIP and open a terminal in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`.
4. In Supabase Dashboard, open SQL Editor and run `supabase/schema.sql`.
5. Fill `.env.local` with your project URL and anon/public key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
   Never place a Supabase service-role key in frontend variables.
6. In Supabase Authentication settings, configure the site URL and local redirect URL as required. For quick testing, email confirmation can remain enabled; then confirm the email before login.
7. Run:
   ```bash
   npm run dev
   ```
8. Open `http://localhost:3000`.

## Deployment (not performed)
You can evaluate Vercel for the Next.js frontend and Supabase for auth/database. Before deploying, check the current terms, commercial-use eligibility, geographic availability, quotas, and whether your intended content is permitted. Add the same environment variables in the hosting dashboard. Add the production URL to Supabase Auth's allowed site/redirect URLs. Then deploy from a Git repository.

No live deployment has been performed from this project, and no URL is currently active.

## Security and production caveats
- This is a starting prototype, not a security audit.
- Add CAPTCHA/bot protection, rate limits, monitoring, backup/restore tests, and production error handling before public use.
- Configure email templates, redirect URLs, password recovery, and account deletion policies.
- Admin UI/role management is not implemented in this initial version. Do not add an admin role using client-controlled metadata.
- Activity table is persisted, but this starter UI does not yet display the activity history.
- Real-money payment, deposit, withdrawal, real wagering, real-world odds, lottery sales, and cash prizes are deliberately not implemented.
- Use only for lawful demo/testing. Any future real-money service needs independent legal review and written approval from all relevant providers before implementation.
