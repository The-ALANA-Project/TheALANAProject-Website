# Guardian security rollout

Do not run the migration until the matching Edge Function and frontend have
been deployed. Locking the tables first will intentionally stop the old direct
browser requests.

## Required Edge Function secrets

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge
Functions. Never put the service-role key in frontend code.

Set `ALLOWED_ORIGINS` to a comma-separated list containing every exact origin
that is allowed to request a Guardian wallet signature. Production defaults
for `https://the-alana-project.xyz` and
`https://www.the-alana-project.xyz` are already included by the function.

For a temporary Make preview, add its exact origin rather than allowing every
Figma or Make subdomain.

An `OPTIMISM_RPC_URL` secret is optional. When omitted, the function uses the
public Optimism mainnet RPC.

## Safe order

1. Deploy the Edge Function as `alana-website-guardian` and deploy the frontend.
2. Confirm the public health endpoint responds.
3. Add the exact preview origin to `ALLOWED_ORIGINS` if preview testing is needed.
4. Run `supabase/migrations/20261029_guardian_security.sql` in the Supabase SQL Editor.
5. Open the public Blog, Community, Knowledge Hub, and Whitepaper pages.
6. Connect an active Nucleus Guardian wallet.
7. Open `/admin`, sign the authorization message, and test one reversible edit.
8. Confirm a non-Guardian or expired membership cannot authorize.
9. Confirm anonymous REST writes now return `401` or `403`.

## Emergency rollback

Use the database backup rather than recreating the permissive `FOR ALL USING
(true)` policies. Those policies are the original vulnerability.
