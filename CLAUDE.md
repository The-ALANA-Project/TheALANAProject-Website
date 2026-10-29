@AGENTS.md

## Durable security constraint

Guardian Panel visibility is based on client-side NFT ownership detection, but privileged writes are not yet enforced server-side. Do not present the current UI check or Supabase anonymous key as secure authorization. The required Edge Function and RLS remediation is documented in `SECURITY.md`.
