# Production Verification Checklist

## 1. Environment

- Confirm `ADMIN_PASSWORD` is set in the deployment environment.
- Confirm `TURSO_DATABASE_URL` is set in the deployment environment.
- Confirm `TURSO_AUTH_TOKEN` is set in the deployment environment.
- Confirm `GEMINI_API_KEY` is set in the deployment environment.
- Confirm `CRON_SECRET` is set in the deployment environment.
- Call `/api/debug-env` with `POST` plus `x-admin-password` header or JSON body password, and verify only boolean setup values are returned.

## 2. Admin Login

- Open `/admin`.
- Verify login fails with an incorrect password.
- Verify login succeeds with the correct password.
- Verify no admin data is exposed before authentication.

## 3. Draft Creation

- Create one `blog` draft manually.
- Create one `review` draft manually.
- Create one `utility` draft manually.
- Verify each item saves with the expected `content_type`.
- Verify slug generation works for Korean titles.

## 4. Bulk Drafts

- Create multiple drafts with Korean titles using bulk create.
- Verify all drafts are created without collision or server errors.
- Verify generated slugs are readable and unique enough for operations.

## 5. AI Generation

- Run AI generation for one draft of each content type.
- Verify generation succeeds and moves the item to `reviewing`.
- Verify generated content contains enough content blocks.
- Verify FAQ items are present and formatted correctly.
- Verify `hero_image` is one of the allowed values.
- Verify generation logs appear in the admin log panel.

## 6. Review Workflow

- Move a generated post from `reviewing` to `approved`.
- Verify approved status is visible in the admin list.
- Verify a `reviewing` item cannot be treated as ready for auto-publish.
- Verify an approved item can still be edited safely.

## 7. Publish Flow

- Publish one approved draft manually.
- Verify it appears on `/blog` or the relevant public route.
- Verify unpublish returns it to `draft`.
- Verify published ordering and dates look correct on the public page.

## 8. Scheduled Publish

- Set one approved item to `scheduled` with a future `scheduled_at` from the admin editor.
- Verify cron does not publish it early.
- Move `scheduled_at` to a past time.
- Verify cron publishes it only after approval and schedule conditions are satisfied.

## 9. Public Rendering

- Open the generated public post page.
- Verify title, excerpt, body blocks, tables, tips, and checklist blocks render correctly.
- Verify there are no broken images.
- Verify related posts and FAQ render without console errors.
- Verify mobile layout on the post page and admin page.

## 10. Failure Handling

- Temporarily remove `GEMINI_API_KEY` in a non-production environment.
- Verify `/api/admin-generate` returns a clear configuration error.
- Temporarily remove `ADMIN_PASSWORD` in a non-production environment.
- Verify admin APIs fail closed and do not accept a fallback password.

## 11. Security

- Confirm `/api/debug-env` requires `POST` plus admin authentication, and does not accept password via query string.
- Confirm `/api/cron` requires `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is configured.
- Confirm no API response exposes raw database URLs, tokens, or API keys.

## 12. Release Gate

- Run `npm run build`.
- Run automated tests if the environment allows it.
- Capture one successful admin generation log screenshot.
- Capture one successful publish screenshot.
- Only deploy after all checks above pass.
