import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using The ALANA Project website and associated tools (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.`,
  },
  {
    title: '2. Eligibility',
    body: `The Service is intended for users who are at least 18 years of age. By using the Service, you represent and warrant that you meet this requirement and that your use of the Service complies with all applicable laws and regulations in your jurisdiction.`,
  },
  {
    title: '3. NFT-Gated Access',
    body: `Certain administrative features require ownership of a Nucleus Guardian NFT on the Optimism network. The interface checks wallet-held assets to determine role visibility. The ALANA Project makes no guarantees regarding the availability, transferability, or value of these NFTs.`,
  },
  {
    title: '4. $ALANA Token',
    body: `$ALANA tokens are community reward tokens distributed within The ALANA Project ecosystem. They do not constitute securities, investment products, or any form of financial instrument. Token values may fluctuate and The ALANA Project makes no representations as to their future value.`,
  },
  {
    title: '5. External Services and Badge Mints',
    body: `The website links to third-party services, including external product websites and NFT badge checkout pages. Transactions or interactions on those services are governed by their own terms and privacy policies. You are responsible for reviewing transaction details and wallet prompts before confirming them.`,
  },
  {
    title: '6. Prohibited Conduct',
    body: `You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to circumvent NFT-gating or access controls; (c) submit false, misleading, or harmful content through administrative tools; (d) interfere with the integrity of the website or connected services; or (e) harass, abuse, or harm other community members.`,
  },
  {
    title: '7. Disclaimers',
    body: `The Service is provided "as is" without warranties of any kind, express or implied. The ALANA Project does not warrant that the Service will be uninterrupted, error-free, or free of harmful components. Your use of the Service is at your own risk.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the fullest extent permitted by applicable law, The ALANA Project shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service, even if advised of the possibility of such damages.`,
  },
  {
    title: '9. Changes to Terms',
    body: `We reserve the right to modify these Terms at any time. Material changes will be announced via our community channels. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.`,
  },
  {
    title: '10. Contact',
    body: `Questions about these Terms may be directed to ${siteConfig.contactEmail}.`,
  },
];

export function TermsPage() {
  return (
    <>
      <Seo title="Terms of Service" path="/terms" />
      <div className="min-h-[calc(100vh-160px)] px-8 md:px-16 max-w-4xl mx-auto py-20">
        <header className="mb-12">
          <p className="font-mono text-sm text-muted-foreground mb-3 uppercase tracking-widest">Legal</p>
          <h1 className="leading-tight">Terms of Service</h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Last updated: September {siteConfig.copyrightYear}
          </p>
        </header>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-sans font-semibold mb-3">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
