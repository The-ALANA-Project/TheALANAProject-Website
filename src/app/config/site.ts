export const siteConfig = {
  // ── Product Identity ──────────────────────────────────────────────────────
  productName: 'The ALANA Project',
  productLabel: 'Project',
  tagline: 'A decentralised community project building the future of collaborative contribution.',
  description:
    'The ALANA Project is a decentralised, community-driven initiative that rewards meaningful contribution. Through NFT-gated roles, token incentives, and an open governance model, ALANA empowers its members to build together and share in the value they create.',

  // ── Contact & Legal ───────────────────────────────────────────────────────
  contactEmail: 'contact@the-alana-project.xyz',
  legalEntityName: 'The ALANA Project',
  copyrightYear: '2026',

  // ── Navigation ────────────────────────────────────────────────────────────
  navItems: [
    { id: 'home',          label: 'Home',          path: '/' },
    { id: 'about',         label: 'About',         path: '/about' },
    { id: 'blog',          label: 'Blog',          path: '/blog' },
    { id: 'knowledge-hub', label: 'Knowledge HUB', path: '/knowledge-hub' },
    { id: 'community',     label: 'Community',     path: '/community' },
    { id: 'products',      label: 'Products',      path: '/products' },
    { id: 'whitepaper',    label: 'Whitepaper',    path: '/whitepaper' },
  ],

  // ── Footer Legal Links ────────────────────────────────────────────────────
  footerLinks: [
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy',   path: '/privacy' },
    { label: 'Press Kit',        path: '/press-kit' },
  ],

  // ── Social Links ──────────────────────────────────────────────────────────
  socialLinks: {
    tiktok:    'https://www.tiktok.com/@the_alana_project',
    linkedin:  'https://www.linkedin.com/company/the-alana-project/',
    youtube:   'https://www.youtube.com/channel/UCD15TuEOTarAN9JATOQOd1A',
    twitter:   'https://twitter.com/alana_xyz',
    instagram: 'https://www.instagram.com/the_alana_project/',
    github:    'https://github.com/the-alana-project',
    telegram:  'https://t.me/+1To9sD5l3T8zMjIy',
  },

  // ── Hero Section ──────────────────────────────────────────────────────────
  hero: {
    heading: 'Welcome to The ALANA Project',
    subheading:
      'A decentralised community building the future of collaborative contribution. Join us, earn $ALANA, and help shape what comes next.',
    primaryCta:   { label: 'Explore',    path: '/about' },
    secondaryCta: { label: 'Learn More', path: '/whitepaper' },
  },
};
