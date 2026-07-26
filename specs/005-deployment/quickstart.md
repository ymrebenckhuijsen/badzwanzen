# Quickstart: Deployment naar Vercel

This is both the setup walkthrough and the verification procedure for this feature (see
`plan.md` Complexity Tracking — this substitutes for Vitest/RTL tests, since there is no
application behavior to unit-test).

## Prerequisites

- A GitHub account with access to the `badzwanzen` repository.
- `vercel.json` present at the repo root (see Phase 1 output of this feature).

## Setup (User Story 2 — one-time)

1. Go to https://vercel.com/signup and sign up using **"Continue with GitHub"** (not
   email/password) so the account is directly linked to GitHub.
2. Authorize the Vercel GitHub App. When prompted for repository access, grant it access to
   the `badzwanzen` repository (either "All repositories" or, preferably, "Only select
   repositories" → `badzwanzen`, to keep the grant minimal).
3. In the Vercel dashboard, click **"Add New" → "Project"** and select the `badzwanzen`
   repository from the list.
4. Vercel detects the Vite framework and proposes build settings. Confirm they match
   `vercel.json` (Build Command `npm run build`, Output Directory `dist`) — since
   `vercel.json` is committed, these should already be picked up automatically; no manual
   override should be necessary.
5. Confirm the **Production Branch** is set to `main` (this is Vercel's default for the
   repository's default branch).
6. Click **Deploy** to run the first production deployment.

**Expected outcome**: the Vercel dashboard shows a `badzwanzen` project with one successful
deployment, and a live URL (`https://<project-name>.vercel.app`) that displays the app.

## Verification (User Story 1 — automatic production deploys)

1. Create a small, throwaway change on a branch (e.g. edit a comment) and open a pull
   request.
   - **Expected**: Vercel posts a check/comment on the PR with a unique preview URL
     (User Story 3) within a few minutes. Opening that URL shows the branch's version of the
     app.
2. Merge the pull request into `main`.
   - **Expected**: within ~5 minutes (SC-001), the production URL from Setup step 6 reflects
     the merged change.
3. Check the commit/PR in GitHub.
   - **Expected**: a Vercel status check is visible directly in GitHub (FR-007, SC-002) —
     no need to open the Vercel dashboard to know whether the deploy succeeded.

## Verification (FR-005 — a failing build must not replace the live site)

1. On a throwaway branch, introduce a deliberate TypeScript error (e.g. assign a `string` to
   a `number`-typed variable) so `npm run build` fails.
2. Push the branch and open a PR, or push directly to a test branch.
   - **Expected**: the Vercel deployment for that commit shows status `Error`, and the GitHub
     check reflects the failure.
3. Confirm the production URL (from a prior successful `main` deploy) is unaffected and still
   serves the last good version.
   - **Expected**: production is unchanged — the broken build was never published (FR-005,
     SC-003).
4. Revert/discard the deliberate error; do not merge it.

## Notes

- No `npm test` / `npm run lint` changes are needed for this feature — the existing CI
  workflow (`.github/workflows/ci.yml`) keeps running independently of Vercel's own build.
- If build settings shown in the Vercel dashboard ever diverge from `vercel.json`, treat
  `vercel.json` as the source of truth and update the dashboard project settings to match (or
  re-import), per FR-009.
