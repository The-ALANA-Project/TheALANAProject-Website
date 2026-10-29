# ALANA Mission Calculator — Project Guidelines

## Brand & Design Conventions

### Buttons
- **Filled accent (purple) buttons** hover state: `hover:bg-foreground hover:text-background` — never `hover:opacity-*`
- **Outline buttons** hover state: `hover:bg-foreground hover:text-background`
- Border radius pattern: `rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px]` for all buttons and interactive containers (4px soft top-left, sharp top-right, 24px signature bottom-right, 4px soft bottom-left)
- Small UI elements (images, dev toggle): `rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px]`
- No rounded corners on non-interactive elements (stat indicators, labels, etc.)

### Icons
- **Never add icons unless the user explicitly asks for them**
- Icon library: `lucide-react`

### Colors (light mode)
- Background: `#F3F3F3`
- Foreground (off-black): `#262424`
- Accent (light purple): `#DCC2FE`
- Muted: `#D9D9D9`

### Colors (dark sections)
- Use the `.dark` class wrapper — CSS variables flip automatically
- Golden biscuit highlight: `#FFDDB2` — used for top-3 leaderboard ranks and $ALANA reward amounts
- Do not use `#F5A623`, `#C0C0C0`, or `#CD7F32` for rank colors — all top 3 use `#FFDDB2`

### Typography
- Font sans: Roboto
- Font mono: Roboto Mono
- No multi-paragraph comments or docstrings

### Navigation & Routing
- Side shelf menu handles all navigation on both mobile and desktop — no desktop nav bar
- Hamburger button visible on all screen sizes
- Wallet connect lives inside the side shelf menu, not the header

### Internal Tool Rules
- No cookie consent banner
- No privacy policy, terms of service, or branding pages
- No public-facing legal links in footer or navigation

## Security TODOs

### Guardian Panel write protection (deferred)
Currently all Supabase writes (community_tools, community_members, community_ticker_items, community_story_flags, community_story_flags) use the public `anon` key embedded in the client bundle. The Guardian NFT check (`detectNFTRole` in `communityAdminService.ts`) runs client-side only — a technically savvy user could bypass the UI and write directly to Supabase via REST.

**Accepted risk for now** — data is non-sensitive and the community is small and trusted.

**Future fix:** Implement Supabase Edge Functions that verify NFT ownership server-side before processing any write. The Edge Function holds the `service_role` key (never exposed to client); the client sends a signed wallet message; the function checks NFT balance on-chain, then executes the write if valid. Enable RLS on all community tables and restrict writes to the Edge Function role only.

Files involved: `src/app/services/communityAdminService.ts`, all `upsert*` and `delete*` functions.

## File Structure
- Main entry: `src/app/App.tsx`
- Components: `src/app/components/`
- Pages: `src/app/pages/`
- Routes: `src/app/routes.tsx`
- Site config (nav, social links, copy): `src/app/config/site.ts`
- Styles: `src/styles/theme.css`
