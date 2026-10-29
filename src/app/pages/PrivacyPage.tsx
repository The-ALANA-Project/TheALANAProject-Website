import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

const sections = [
  {
    title: '1. Who We Are',
    body: `The ALANA Project ("we", "our", or "us") operates this website and associated tools. For privacy-related enquiries, contact us at ${siteConfig.contactEmail}.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect information you provide directly (such as quest submissions and contribution data), information collected automatically (such as browser type, IP address, and pages visited via analytics tools), and on-chain information derived from your connected wallet address (public blockchain data).`,
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect to: operate and improve the Service; verify NFT-gated access; process and display quest contributions; communicate with you about the project; and analyse usage patterns to improve user experience. We do not sell your personal information to third parties.`,
  },
  {
    title: '4. Wallet Data',
    body: `When you connect a wallet, we read your public wallet address to verify NFT ownership on the Optimism network. We do not request, store, or have access to your private keys, seed phrases, or signing credentials at any time.`,
  },
  {
    title: '5. Supabase & Data Storage',
    body: `Quest submission data, including text contributions and associated metadata, is stored securely in our Supabase database. Access is restricted to authorised team members and Guardian-role users within the platform.`,
  },
  {
    title: '6. Cookies & Analytics',
    body: `We may use cookies and similar technologies for session management and anonymous usage analytics. We do not use tracking cookies for advertising purposes. You can disable cookies in your browser settings, though some features may not function correctly as a result.`,
  },
  {
    title: '7. Third-Party Services',
    body: `The Service integrates with third-party services including Reown AppKit (wallet connection), Optimism (on-chain data), Supabase (data storage), and Pinata/IPFS (media hosting). Each of these services operates under their own privacy policies.`,
  },
  {
    title: '8. Data Retention',
    body: `We retain your data for as long as necessary to provide the Service. Quest submission records may be retained indefinitely as part of the public contribution history. You may request deletion of personal data not required for on-chain operations by contacting us.`,
  },
  {
    title: '9. Your Rights',
    body: `Depending on your jurisdiction, you may have the right to access, correct, or delete personal data we hold about you. To exercise these rights, contact us at ${siteConfig.contactEmail}. Note that on-chain data is immutable and cannot be deleted.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Significant changes will be announced via our community channels. Continued use of the Service constitutes acceptance of the revised Policy.`,
  },
];

export function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" path="/privacy" />
      <div className="min-h-[calc(100vh-160px)] px-8 md:px-16 max-w-4xl mx-auto py-20">
        <header className="mb-12">
          <p className="font-mono text-sm text-muted-foreground mb-3 uppercase tracking-widest">Legal</p>
          <h1 className="leading-tight">Privacy Policy</h1>
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
