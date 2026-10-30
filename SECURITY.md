# Security

## Guardian administration

The website reads sanitized public content through the
`alana-website-guardian` Edge Function. Managed tables have RLS enabled and
direct access is revoked from the `anon` and `authenticated` roles.

The Guardian Edge Function verifies a signed wallet
message and calls Unlock Protocol's `getHasValidKey` against the Nucleus
Guardian lock on Optimism. Administrative requests use 30-minute,
origin-bound sessions and repeat the active-membership check server-side.
Managed mutations are allowlisted, validated, rate-limited, and audited.

The browser's NFT detection remains a presentation aid only. It is never an
authorization boundary.

The Edge Function, frontend, and migration in
`supabase/migrations/20261029_guardian_security.sql` have been deployed.
Post-deployment checks confirmed that all managed public reads succeed through
the Edge Function and direct anonymous table reads return `401`.

## Follow-up hardening

- Inventory the older `make-server-*` Edge Functions before deleting anything.
  At least one downloaded legacy function contains unauthenticated Contribution
  Calculator and comments mutations and belongs to a separate project.
- Rotate the Paragraph API credential that was previously present in browser
  source and repository history.
- Replace the blog article body's regex HTML cleanup with a maintained
  allowlist sanitizer before treating third-party HTML as fully trusted.
- Add retention or scheduled cleanup for expired Guardian nonces, sessions,
  and rate-limit events, and review the Guardian audit log regularly.
- Remove the temporary Figma site from `ALLOWED_ORIGINS` after the custom
  production domain is live.

## Secrets

- Never commit private keys, service-role keys, wallet signatures, or provider secrets.
- The Supabase anonymous key is public configuration, not a secret and not an authorization mechanism.
- Store private credentials in the platform's secret manager.

## Reporting

Report security concerns privately to `contact@the-alana-project.xyz`. Do not include private keys, wallet recovery phrases, or sensitive personal data in a report.
