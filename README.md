# The ALANA Project Website

The public website and community knowledge ecosystem for [The ALANA Project](https://the-alana-project.xyz), a community-governed initiative focused on creator sovereignty, practical technology education, and open collaboration.

## Website areas

| Route | Purpose |
| --- | --- |
| `/` | Project introduction and primary calls to action |
| `/about` | Origin, mission, values, timeline, and team |
| `/blog` | Curated articles sourced from the ALANA publication feed |
| `/knowledge-hub` | Knowledge Challenges, webinars, and creator tools |
| `/community` | Community directory, stories, and resources |
| `/products` | ALANAmagazine, ALANAboutique, FABAstudio, and ALANAworld |
| `/whitepaper` | Expandable, Guardian-editable Whitepaper chapters |
| `/press-kit` | Brand palette and media-asset availability |
| `/terms`, `/privacy` | Legal information |
| `/admin` | NFT-gated Guardian content panel |

The Contribution Calculator is a separate product linked from Community Resources. Its application code is not bundled into this website.

## Tech stack

- React 18 and TypeScript
- Vite with the Figma Make runtime wrapper
- Tailwind CSS v4
- React Router
- Motion for interface animation
- Three.js for the Knowledge Hub hero
- Wagmi and Reown AppKit for wallet connectivity
- Optimism mainnet NFT ownership checks for role detection
- Supabase Edge Function endpoints for managed content

## Data and content

The website uses a deliberately small set of data paths:

- **Supabase Edge Functions:** Sanitized public content reads plus signed, server-authorized Guardian administration.
- **Static fallbacks:** Essential public content remains available when a managed table is empty or unavailable.
- **Browser storage:** Knowledge Challenge progress and local Whitepaper fallbacks. Challenge progress is scoped by challenge and remains until site data is cleared.
- **On-chain reads:** Wallet role detection on Optimism. These reads control interface visibility only; see [Security](#security).

The repository does not contain a local database, duplicate contribution-calculator dataset, or retained design-export screenshots.

## Development

Requirements:

- Node.js 22
- pnpm

Install dependencies:

```bash
pnpm install
```

Run the standard Vite app:

```bash
pnpm dev
```

Figma Make supervises its own development server through `.figma/make/dev`; do not start a second server inside that environment.

Useful checks:

```bash
pnpm typecheck
pnpm build
pnpm format
```

## Project structure

```text
src/
  app/
    components/     Shared interface and layout components
    config/         Site and wallet configuration
    contexts/       Wallet authentication and role detection
    pages/          Routed website pages
    services/       Supabase and feed clients
  styles/           Fonts, Tailwind entrypoint, theme, and global styles
utils/supabase/     Public Supabase project configuration
```

## Content administration

Nucleus Guardians can access `/admin` after connecting a wallet, signing a
short-lived authorization message, and passing the server-side active-key check
on Optimism. The panel manages public-facing content; it is not a general
database administration interface.

Schema or policy changes should be made in Supabase itself and documented alongside the affected service. Do not add SQL that disables Row Level Security as a production setup step.

## Security

The Supabase anonymous key is intentionally public in the frontend, but it is
never treated as authorization. Guardian administration is authorized by the
Edge Function using a wallet signature and a fresh Unlock Protocol
`getHasValidKey` check on Optimism.

See [SECURITY.md](./SECURITY.md) and
[`supabase/GUARDIAN_SECURITY_ROLLOUT.md`](./supabase/GUARDIAN_SECURITY_ROLLOUT.md)
for the deployment requirements.

## Brand

- Digital Lavender: `#DCC2FE`
- Off-Black: `#262424`
- Off-White: `#F3F3F3`
- Body typeface: Roboto

## License

MIT — see [LICENSE](./LICENSE).
