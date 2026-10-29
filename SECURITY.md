# Security

## Guardian administration

The website reads public content with a Supabase anonymous key in the browser. A public anonymous key is normal for Supabase clients when Row Level Security (RLS) and server authorization are configured correctly.

The source tree includes a Guardian Edge Function that verifies a signed wallet
message and calls Unlock Protocol's `getHasValidKey` against the Nucleus
Guardian lock on Optimism. Administrative requests use short-lived,
origin-bound sessions and repeat the active-membership check server-side.
Managed mutations are allowlisted, validated, rate-limited, and audited.

The browser's NFT detection remains a presentation aid only. It is never an
authorization boundary.

The production environment must not be treated as remediated until the Edge
Function and frontend are deployed, the migration in
`supabase/migrations/20261029_guardian_security.sql` is applied, and the checks
in `supabase/GUARDIAN_SECURITY_ROLLOUT.md` pass. Before that migration, the
historical permissive policies may still permit anonymous direct writes.

## Secrets

- Never commit private keys, service-role keys, wallet signatures, or provider secrets.
- The Supabase anonymous key is public configuration, not a secret and not an authorization mechanism.
- Store private credentials in the platform's secret manager.

## Reporting

Report security concerns privately to `contact@the-alana-project.xyz`. Do not include private keys, wallet recovery phrases, or sensitive personal data in a report.
