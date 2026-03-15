# Project Review Handover

Date: 2026-03-13
Reviewer: Codex
Scope: whole-project review of the current Vite + Vercel/Turso codebase

## Status Snapshot

- Review findings were turned into code changes on 2026-03-13.
- `npm run build`: passed
- `npm test`: passed
- `npm run lint`: passed
- Production build emitted a main client chunk around 725 kB

## Progress Update

The original four blockers from the review were addressed in code:

- `/api/cron` now fails closed when `CRON_SECRET` is missing and requires a bearer token on every request.
- Scheduled publish now uses `scheduled_at` end to end across the admin UI, the Vercel/Turso API, and cron publishing.
- `/api/posts` now normalizes malformed JSON fields instead of breaking the whole feed, and the blog UI shows a visible fallback notice when local backup content is used.
- `/api/debug-env` now requires `POST`, no longer accepts password via query string, and only returns boolean environment flags.

New automated coverage was added in `src/test/adminWorkflow.test.ts` for these paths.

## SEO Generation Upgrade

The content generator is no longer a simple title-to-draft flow. The current pipeline now includes:

- user title input plus SEO fields such as primary keyword, search intent, competitor URLs, reference URLs, and must-cover sections
- title refinement and SERP-aware SEO brief generation using Gemini search grounding
- automatic meta title and meta description generation
- automatic schema JSON generation stored in `generation_meta`
- internal link recommendation storage in `generation_meta`
- a quality gate that blocks bulk auto-approval/scheduling when blocker checks fail

Primary implementation files:

- `api/seoPipeline.ts`
- `api/admin-generate.ts`
- `api/admin-blog.ts`
- `src/pages/Admin.tsx`
- `src/pages/Blog.tsx`
- `src/data/blogPostUtils.ts`

Validation status:

- `npm run lint`: passed
- `npm test`: passed
- `npm run build`: passed
- local real generation test with a live Gemini key: passed

## Current Recommendation

Continue with manual verification before release.

## Blocking Findings

### 1. `/api/cron` fails open if `CRON_SECRET` is missing

What happens:
- The endpoint only rejects requests when `CRON_SECRET` exists.
- If the deployment forgets to set `CRON_SECRET`, anyone can hit `/api/cron`.

Why it matters:
- External callers could trigger auto-publish behavior.
- This is a release blocker because the deployment checklist already expects `CRON_SECRET`.

Primary files:
- `api/cron.ts`
- `docs/production-verification-checklist.md`
- `.github/workflows/cron.yml`

Suggested fix:
- Make the endpoint fail closed when `CRON_SECRET` is absent.
- Return `500` or similar configuration error when the secret is missing.
- Keep bearer-token auth mandatory in all environments except an explicitly gated local-dev path if needed.

Done when:
- `/api/cron` returns unauthorized without a valid bearer token.
- `/api/cron` does not run when `CRON_SECRET` is unset.

### 2. Scheduled publish is broken on the active Vercel/Turso path

What happens:
- Schema and cron logic require `scheduled_at`.
- The admin UI exposes `scheduled` status, but there is no input or save path for `scheduled_at`.
- The active `api/admin-blog.ts` create/update handlers do not write `scheduled_at`.

Why it matters:
- A post can be marked `scheduled` but never satisfy the cron query.
- The public scheduled publish flow described in the checklist cannot pass end to end.

Primary files:
- `schema.sql`
- `src/pages/Admin.tsx`
- `api/admin-blog.ts`
- `api/cron.ts`

Suggested fix:
- Decide the canonical scheduling flow first.
- If Vercel/Turso is the active backend:
  - Add `scheduled_at` editing in `src/pages/Admin.tsx`.
  - Include `scheduled_at` in `create` and `update` payloads.
  - Validate that scheduled posts require both `workflow_status = approved` and a non-null schedule time.
- If Supabase is the intended backend instead, remove or retire the duplicate Turso scheduling path.

Done when:
- A future `scheduled_at` can be set from admin.
- Cron skips it before the scheduled time.
- Cron publishes it after the scheduled time and only when approved.

### 3. `/api/posts` can take down the whole blog listing on one malformed row, and the UI hides the failure

What happens:
- `api/posts.ts` does direct `JSON.parse` on DB fields without per-row guards.
- One malformed JSON field can make the whole endpoint return `500`.
- `src/pages/Blog.tsx` then silently falls back to `LOCAL_POSTS`.

Why it matters:
- Broken production data can be masked by stale local content.
- Operators may think the site is healthy while DB-backed content is failing.

Primary files:
- `api/posts.ts`
- `src/pages/Blog.tsx`

Suggested fix:
- Parse JSON fields with a safe helper.
- Isolate malformed rows instead of failing the whole response.
- Surface API failure in the UI or at least log/report it visibly instead of silently swapping to fallback content in production.
- Decide whether `LOCAL_POSTS` should remain a production fallback at all.

Done when:
- Malformed JSON in one row does not break all posts.
- Production failures are observable rather than silently hidden.

### 4. `/api/debug-env` exposes more operational detail than necessary

What happens:
- The endpoint accepts the admin password via query string or header.
- It returns environment presence flags and Gemini API key length.

Why it matters:
- Query-string passwords are easy to leak through logs, browser history, and monitoring.
- Returning key metadata is unnecessary for production debugging.

Primary files:
- `api/debug-env.ts`
- `docs/production-verification-checklist.md`

Suggested fix:
- Remove query-string password support.
- Keep auth header or POST body only.
- Remove `geminiApiKeyLength` and any other non-essential metadata.
- Consider removing the endpoint entirely after deployment verification is complete.

Done when:
- The endpoint no longer accepts password in the URL.
- The response returns only the minimum safe diagnostic state, or the endpoint is removed.

## Suggested Work Order

1. Fix `/api/cron` auth to fail closed.
2. Repair scheduled publish end to end on the Vercel/Turso path.
3. Harden `/api/posts` parsing and stop silently masking production failures.
4. Lock down or remove `/api/debug-env`.
5. Clean lint debt and add real tests for the publish flow.

## Files To Inspect First

- `api/cron.ts`
- `api/admin-blog.ts`
- `api/posts.ts`
- `api/debug-env.ts`
- `src/pages/Admin.tsx`
- `src/pages/Blog.tsx`
- `schema.sql`
- `docs/production-verification-checklist.md`

## Validation Commands

Run these after fixes:

```sh
npm run lint
npm test
npm run build
```

Manual verification focus:

- Admin login
- Create/edit draft
- Set approved + scheduled post with `scheduled_at`
- Trigger cron with and without valid auth
- Confirm published posts still render from DB-backed content

## Review Notes

- `.env` is tracked in git, but at review time it contained only `VITE_` public client values, not server secrets.
- The current automated test suite is not meaningful coverage for admin, cron, or publish behavior.
- No repository files were modified during the review before this handover document was added.
