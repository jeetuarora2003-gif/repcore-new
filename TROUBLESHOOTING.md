# Keeping this app running for years, unattended

This app runs on two free-tier services you control: **Vercel** (hosting) and
**Supabase** (database). Both are reliable, but a *free* project on either
one can go idle and pause itself if nobody uses it for a while. This
document is a one-time setup step plus a checklist for "the site stopped
working."

## One-time setup: stop the site from silently going down

Free Supabase projects **pause automatically after 7 days with no API
activity**. If your gym's staff use the app every day this rarely happens,
but a holiday closure or a quiet week is enough to trigger it - and nobody
finds out until a customer complains.

Fix it once, in 5 minutes:

1. Create a free account at [UptimeRobot](https://uptimerobot.com) (or
   [cron-job.org](https://cron-job.org) / [healthchecks.io](https://healthchecks.io) -
   any of these work).
2. Add a new monitor of type "HTTP(s)" pointed at:
   ```
   https://<your-app>.vercel.app/api/health
   ```
3. Set the check interval to every few hours (UptimeRobot's free plan
   checks every 5 minutes by default, which is more than enough).
4. Turn on email alerts for that monitor.

This single monitor does two jobs: it keeps hitting the database often
enough that Supabase never auto-pauses, and it emails you the moment the
site actually goes down - instead of you finding out weeks later.

There is also a `.github/workflows/keepalive.yml` in this repo as a backup
ping. Don't rely on it alone: **GitHub disables scheduled workflows after 60
days of no repository activity**, and a production gym app won't have
commits being pushed to it regularly.

## Checklist: "the site stopped working"

Work through these in order.

1. **Check the UptimeRobot alert email** - it usually tells you roughly when
   it went down, which narrows down what changed around that time.
2. **Check if Supabase paused the project.** Log in to
   [supabase.com/dashboard](https://supabase.com/dashboard), open the
   project, and look for a "Project paused" banner. If so, click **Restore**
   - it takes a couple of minutes and no data is lost.
3. **Check Vercel's dashboard** (vercel.com/dashboard -> your project ->
   Deployments). A red/failed deployment or a function erroring out will be
   listed there with logs.
4. **Check environment variables** (Vercel project -> Settings ->
   Environment Variables). The app needs all of these set, exactly as given
   during setup:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
   - `ENCRYPTION_KEY`
   - `IMGBB_API_KEY` / `NEXT_PUBLIC_IMGBB_API_KEY` (for photo uploads only -
     missing this breaks photo upload but not the rest of the app)

   Visiting `https://<your-app>.vercel.app/api/health` directly in a browser
   will tell you if any of the required ones are missing, without exposing
   their values.
5. **If you rotated any Supabase key**, update the matching Vercel
   environment variable and redeploy (Vercel project -> Deployments -> "..."
   on the latest deployment -> Redeploy). The two must always match.
6. **If nothing above explains it**, redeploying the last known-good commit
   (same menu as above) resolves most one-off platform glitches.

## Rebuilding from scratch years from now

This project uses **pnpm**, pinned via the `packageManager` field in
`package.json`. Use `pnpm install`, not `npm install` - installing with a
different package manager can silently resolve different dependency
versions than what this app was built and tested against. Node.js 20.9 or
newer is required (also pinned via the `engines` field).
