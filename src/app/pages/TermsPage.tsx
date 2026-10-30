import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `These Terms of Service govern your use of The ALANA Project public website, its educational content, community resources, optional wallet-connected features, and Guardian administration tools (collectively, the "Service"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be legally able to enter into these Terms and use the Service under the laws that apply to you. Wallet transactions, NFT mints, and third-party services may impose additional age, location, or eligibility requirements. You are responsible for complying with those requirements and all applicable laws.`,
  },
  {
    title: '3. Website Scope and Educational Content',
    body: `The Service provides project information, editorial content, Knowledge Challenges, community resources, and links to ALANA ecosystem products. Content is provided for general informational and educational purposes and is not legal, financial, investment, tax, cybersecurity, or professional advice. The Contribution Calculator and linked product websites are separate services and are not operated as part of this website.`,
  },
  {
    title: '4. Wallets, Signatures, and Guardian Access',
    body: `Wallet connection is optional for public browsing. Certain Guardian features require a connected wallet, a signed authorization message, and active Nucleus Guardian membership verified on Optimism. You are responsible for securing your wallet and reviewing every signature request. We never request your private key or recovery phrase. Guardian access may be suspended or removed if membership expires, authorization fails, or the tools are misused.`,
  },
  {
    title: '5. Tokens, NFTs, and Badge Mints',
    body: `$ALANA, Nucleus Guardian memberships, Knowledge Challenge badges, and other on-chain assets may be described or linked from the Service. Nothing on the Service is an offer, recommendation, or guarantee of value. Blockchain transactions may be irreversible and may involve network fees, smart-contract risks, or third-party checkout terms. You are solely responsible for reviewing transaction details before signing or submitting them.`,
  },
  {
    title: '6. Community and Guardian Content',
    body: `Public community profiles, curated resources, webinars, Whitepaper content, and other managed material may be submitted or maintained by authorised Guardians. Contributors are responsible for having the rights and permissions needed for content they provide. We may edit, refuse, unpublish, or remove content that is inaccurate, unlawful, unsafe, infringes rights, or is inconsistent with the Service.`,
  },
  {
    title: '7. Intellectual Property',
    body: `The Service, its original design, branding, text, and project materials are owned by or licensed to The ALANA Project unless otherwise stated. Third-party names, artwork, articles, media, and open-source components remain subject to their respective rights and licences. You may link to public pages, but you may not misrepresent affiliation with the project or reuse protected material in violation of applicable rights.`,
  },
  {
    title: '8. External Services',
    body: `The Service depends on or links to third parties, including wallet providers, Optimism, Unlock Protocol, Supabase, Paragraph, media hosts, social platforms, product websites, and badge checkout pages. We do not control those services and are not responsible for their availability, security, content, transactions, or privacy practices. Your use of a third-party service is governed by that provider's terms and policies.`,
  },
  {
    title: '9. Prohibited Conduct',
    body: `You must not use the Service unlawfully; interfere with its operation; probe or bypass access controls; impersonate another person; submit malicious, misleading, infringing, or harmful material; misuse Guardian privileges; attempt unauthorised writes; scrape the Service in a way that disrupts it; or use the Service to harass, exploit, or harm others.`,
  },
  {
    title: '10. Availability and Disclaimers',
    body: `The Service is provided "as is" and "as available" without warranties of any kind, to the extent permitted by law. We do not guarantee that content is complete or current, that learning materials will produce a particular outcome, or that the Service and connected systems will be uninterrupted, secure, or error-free. Static fallback content may be shown when a live source is unavailable.`,
  },
  {
    title: '11. Limitation of Liability',
    body: `To the fullest extent permitted by applicable law, The ALANA Project and its contributors will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss arising from wallet activity, blockchain transactions, third-party services, reliance on content, or inability to use the Service. Nothing in these Terms excludes liability that cannot lawfully be excluded.`,
  },
  {
    title: '12. Changes and Contact',
    body: `We may update these Terms when the Service or applicable requirements change. The updated date will be shown on this page, and material changes may also be announced through project channels. Questions about these Terms may be directed to ${siteConfig.contactEmail}.`,
  },
];

export function TermsPage() {
  return (
    <>
      <Seo title="Terms of Service" path="/terms" />
      <div className="min-h-[calc(100vh-160px)] w-full max-w-6xl mx-auto px-8 md:px-16 py-20">
        <header className="mb-16">
          <p className="mb-2 font-mono text-sm text-muted-foreground">The ALANA Project</p>
          <h1 className="font-sans text-2xl font-medium leading-normal">Terms of Service</h1>
          <p className="mt-4 max-w-2xl font-sans text-lg font-normal leading-normal text-muted-foreground md:text-xl">
            The terms that apply when you browse, learn, connect a wallet, or use Guardian features on this website.
          </p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Last updated
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              October {siteConfig.copyrightYear}
            </span>
          </div>
        </header>

        <div className="max-w-4xl space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h3 className="mb-3 font-sans text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
