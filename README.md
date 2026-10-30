# The ALANA Project Website

The public website for [The ALANA Project](https://the-alana-project.xyz): a community-governed ecosystem focused on creator sovereignty, practical technology education, and open collaboration.

This repository contains the public editorial, educational, community, product, and governance-facing website. It does **not** contain the Contribution Calculator, custody user funds, execute token trades, or operate an on-site NFT marketplace.

## Website areas

| Route | Purpose |
| --- | --- |
| `/` | Project introduction and primary calls to action |
| `/about` | ALANA's origin, timeline, mission, values, and community story |
| `/blog` | ALANAmagazine articles delivered through the secure public content proxy |
| `/blog/:slug` | Sanitized full-article views and static link-preview cards |
| `/knowledge-hub` | Knowledge Challenges, badge links, webinars, and learning resources |
| `/community` | Community members, stories, events, resources, and creator tools |
| `/products` | ALANAmagazine, ALANAboutique, FABAstudio, and ALANAworld |
| `/whitepaper` | The project's current Whitepaper and managed chapter content |
| `/press-kit` | Brand palette and media-asset availability |
| `/terms`, `/privacy` | Terms of Service and Privacy Policy |
| `/admin` | Wallet-connected, NFT-gated Guardian content panel |

The Contribution Calculator is a separate external product linked from Community Resources. Its pages, datasets, and submission stack must not be reintroduced here.

## Current features

- Responsive public marketing and project-information pages
- Three Knowledge Challenges: Web3 Essentials, Cybersecurity Essentials, and AI Tech Essentials
- Browser-local challenge progress and external Unlock Protocol badge-mint links
- Live blog index and article views sourced from Paragraph through a server-side proxy
- Community directories and curated resources with static fallbacks for public availability
- Product showcase for the four ALANA ecosystem products
- Wallet connection through Reown AppKit and Wagmi
- Nucleus Guardian role detection on Optimism
- Guardian-managed public content through a signed, server-authorized Supabase Edge Function
- Google Analytics 4 with denied-by-default Consent Mode and a persistent accept/decline banner
- Per-page SEO, Open Graph, Twitter metadata, canonical URLs, and ALANA favicon

## Tech stack

- React 18 and TypeScript
- Vite with the Figma Make runtime wrapper
- Tailwind CSS v4
- React Router
- Motion for interface animation
- Three.js for the Knowledge Hub hero
- Wagmi, Viem, and Reown AppKit for wallet connectivity
- Supabase Edge Functions and managed Postgres content
- Unlock Protocol membership checks on Optimism mainnet
- React Helmet Async for route-level metadata

## Architecture and data flow

### Public content

The frontend requests managed content from the `alana-website-guardian` Supabase Edge Function. Public endpoints return allowlisted content for the website without exposing direct anonymous table access. Essential public sections retain static fallbacks where graceful degradation is useful.

The blog service uses the same Edge Function as a private Paragraph API proxy. The proxy fetches article data, extracts full article markup, and performs server-side cleanup before returning it to the browser. See `SECURITY.md` for the remaining sanitizer-hardening follow-up.

### Guardian administration

`/admin` is intended for active Nucleus Guardians. Administrative writes require:

1. A connected wallet
2. A signed, short-lived authorization message
3. A server-side Unlock Protocol `getHasValidKey` check on Optimism
4. An allowlisted and validated mutation through the Guardian Edge Function

Browser-side NFT detection controls presentation only and is never treated as authorization. Managed tables use Row Level Security, and direct anonymous writes are blocked.

### Browser-local data

The site uses local browser storage for:

- Knowledge Challenge progress
- The analytics consent choice
- Limited page-specific fallback state where documented in the implementation

There are no public-site user accounts or synced learner profiles.

### Analytics

Google Analytics uses measurement ID `G-MGL3F4DDC0`. Consent defaults to denied before the Google tag loads. Analytics storage is enabled only after a visitor chooses **Accept Analytics**; advertising storage remains disabled. The visitor's choice is stored under `alana-cookie-consent`.

### External services

The website may connect to:

- Supabase for managed public content and Guardian operations
- Paragraph for ALANAmagazine source content through the server proxy
- Reown AppKit, Wagmi, and wallet providers for optional wallet connection
- Optimism and Unlock Protocol for public on-chain membership checks
- Google Analytics for consented usage analytics
- Pinata/IPFS and Cloudinary for media delivery
- External product sites, social platforms, and badge checkout pages opened by user action

## Development

### Requirements

- Node.js 22
- pnpm

### Install

```bash
pnpm install
```

### Local development

Outside Figma Make:

```bash
pnpm dev
```

Figma Make supervises its own Vite server through `.figma/make/dev`. Do not start a second development server in that environment.

### Checks

```bash
pnpm typecheck
pnpm build
pnpm format
```

The production build uses `vite.figma.config.ts`. Site-level metadata, the favicon, Google Analytics, and pre-load consent defaults are configured in `.figma/make/site.json`.

## Project structure

```text
src/
  app/
    components/     Shared interface, layout, consent, and UI components
    config/         Site, navigation, wallet, and public project configuration
    contexts/       Wallet connection and role detection
    pages/          Routed website pages
    services/       Public content, blog, and Supabase clients
    utils/          Frontend helpers
  assets/           Repository-managed product and interface media
  styles/           Fonts, Tailwind entrypoint, theme, and global styles
supabase/
  functions/        Guardian authorization and public content Edge Function
  migrations/       Security and managed-content migrations
utils/supabase/     Public Supabase project configuration
```

## Configuration and security

- Read [SECURITY.md](./SECURITY.md) before changing Supabase access, Guardian authorization, wallet gating, or administrative writes.
- Review [`supabase/GUARDIAN_SECURITY_ROLLOUT.md`](./supabase/GUARDIAN_SECURITY_ROLLOUT.md) before changing or redeploying the Guardian security model.
- The Supabase anonymous key is public frontend configuration, not an authorization credential.
- Private provider credentials belong in the platform secret manager and must never be committed.
- Do not disable Row Level Security as a setup step.
- Do not restore legacy `make-server-*` functions without a security review.

## Brand

- Digital Lavender: `#DCC2FE`
- Off-Black: `#262424`
- Off-White: `#F3F3F3`
- Body typeface: Roboto
- Display and technical typeface: Roboto Mono
- Signature controls use a compact top-left radius and an extended bottom-right radius

## Legal

The website's Terms of Service and Privacy Policy live in `src/app/pages/TermsPage.tsx` and `src/app/pages/PrivacyPage.tsx`. Product or data-flow changes should be reflected there. Legal copy should be reviewed by qualified counsel for the jurisdictions in which the project operates.

## License

MIT — see [LICENSE](./LICENSE).
