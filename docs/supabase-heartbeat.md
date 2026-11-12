# Supabase database heartbeat

GymUp's Free Supabase project can pause after a week of low activity. The
heartbeat queries one non-sensitive database row every six hours, independently
of app usage. No workout data is read or written. This reduces inactivity risk;
it is not a Supabase availability guarantee and cannot resume a paused project.

## Activate

1. Resume the project in Supabase if necessary.
2. In Supabase **SQL Editor**, run `supabase/heartbeat.sql`. It is a separate,
   repeatable setup script; do not rerun the entire application schema.
3. In GitHub repository **Settings → Secrets and variables → Actions**, add:
   - `SUPABASE_URL`: project URL, e.g. `https://PROJECT.supabase.co`.
   - `SUPABASE_PUBLISHABLE_KEY`: the project's publishable key, or legacy anon key.
     Never use a secret key or `service_role` key.
4. Merge/push the workflow and script to the default branch (`main`). Scheduled
   workflows only run from the default branch. Ensure Actions is enabled.
5. Open **Actions → Supabase database heartbeat → Run workflow**, select `main`,
   and confirm the run is green with `Supabase database heartbeat passed.`
6. Confirm a subsequent run has event `schedule`, not just `workflow_dispatch`.
   Enable Actions failure email notifications in your personal GitHub settings.

The workflow does not install app dependencies and has read-only repository
permissions. Requests have a 20-second timeout and fail on HTTP errors, malformed
responses, or missing rows. API response bodies and credentials are not logged.
New publishable keys are sent in `apikey`, not as Bearer tokens.

## Long periods without development

GitHub disables scheduled workflows in public repositories after 60 days without
repository activity. Workflow runs alone must not be relied on to reset that
limit. Check Actions before that limit (for example, monthly). If disabled,
choose **Enable workflow**, run it manually, and confirm the next scheduled run.
No automatic commits or repository writes are used to bypass this limit.

For unattended operation beyond that limit, configure an independent external
scheduler to make the same HTTPS GET query with the same `apikey` header, with
failure notifications. Supabase paid plans are the official option that avoids
inactivity pausing. No paid service is provisioned by this change.

## Troubleshooting

- Missing secrets: check the two repository Actions secrets above (Vercel env
  variables and `VITE_` variables are not automatically available to Actions).
- HTTP 401/403: check the key, grants and RLS policy from `heartbeat.sql`.
- HTTP 404 or missing row: run `heartbeat.sql` in the matching Supabase project.
- Network/5xx errors: check project status and Supabase service health; resume
  manually if paused. A failed job does not automatically restore the project.
- No runs: check the workflow is on `main`, Actions is enabled, and the schedule
  was not disabled for inactivity. GitHub cron is best effort, not exact timing.

## References

- https://supabase.com/docs/guides/platform/free-project-pausing
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
- https://supabase.com/docs/guides/api/api-keys
