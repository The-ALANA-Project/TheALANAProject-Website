import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

const sections = [
  {
    title: '1. Who We Are',
    body: `The ALANA Project ("we", "our", or "us") operates this public website. This Policy explains how the website handles information when you browse public content, choose analytics, connect a wallet, or use Guardian administration features. For privacy enquiries, contact ${siteConfig.contactEmail}.`,
  },
  {
    title: '2. Information We Collect',
    body: `We may process information you provide directly; approved public community profile information; technical request data such as IP address, browser type, device information, and timestamps processed by our hosting and service providers; consented analytics data; and public blockchain information associated with a wallet you choose to connect. The public website does not provide user accounts or synced learner profiles.`,
  },
  {
    title: '3. Browser-Local Storage',
    body: `Knowledge Challenge progress and your analytics consent choice are stored locally in your browser. Challenge progress is not synced to an ALANA account. You can remove this information by clearing this site's browser data. Essential wallet-provider or security storage may also be created by connected third-party tools when you use them.`,
  },
  {
    title: '4. Cookies and Google Analytics',
    body: `Google Analytics is configured with Consent Mode. Analytics storage is denied before the Google tag loads and remains denied unless you choose "Accept Analytics." If accepted, Google Analytics may use cookies and collect information about page views, interactions, approximate location, device, and browser characteristics. Advertising storage, ad user data, and ad personalisation remain disabled. Your choice is stored locally under the site's consent setting. We do not use analytics cookies for advertising and do not sell personal information.`,
  },
  {
    title: '5. Wallet and Blockchain Data',
    body: `If you connect a wallet, wallet providers and the website process your public wallet address and network information. We read public Optimism data and use Unlock Protocol membership checks to determine Guardian eligibility. Guardian authorization also requires a signed, short-lived message. We do not request, store, or have access to private keys or recovery phrases. Public blockchain activity is visible to others and cannot be altered or deleted by us.`,
  },
  {
    title: '6. Managed Public Content and Guardian Records',
    body: `Supabase stores managed website content such as community entries, curated resources, Whitepaper chapters, webinars, and content settings. Some approved content is publicly readable by design. Guardian security records may include wallet addresses, authorization nonces, session and rate-limit data, mutation audit events, timestamps, and request metadata needed to prevent abuse and administer the Service.`,
  },
  {
    title: '7. Blog and Media Services',
    body: `ALANAmagazine content is retrieved from Paragraph through a server-side proxy and displayed on this website. Images and video may be delivered by Pinata/IPFS, Cloudinary, or their underlying infrastructure. When your browser requests third-party media or follows an external link, the relevant provider may receive technical request information under its own privacy policy.`,
  },
  {
    title: '8. How We Use Information',
    body: `We use information to deliver and secure the website, display approved community content, remember browser-local preferences and learning progress, verify Guardian membership, authorize and audit administrative changes, diagnose problems, respond to enquiries, and—only with consent—understand website usage and improve the experience.`,
  },
  {
    title: '9. Service Providers and External Links',
    body: `Providers may include Supabase, Google Analytics, Reown AppKit, wallet providers, Optimism infrastructure, Unlock Protocol, Paragraph, Pinata/IPFS, Cloudinary, and website hosting infrastructure. The website also links to social platforms, badge checkouts, and separate ALANA product sites. These providers process information under their own terms and privacy policies, and may process it in countries different from yours.`,
  },
  {
    title: '10. Retention and Security',
    body: `We retain managed public content while it remains relevant, Guardian security and audit records for operational and security needs, and correspondence as reasonably necessary to respond. Browser-local data remains until you or your browser removes it. We use technical and organisational safeguards, including server-side authorization and Row Level Security, but no internet service can guarantee absolute security.`,
  },
  {
    title: '11. Your Choices and Rights',
    body: `You can decline analytics in the cookie banner, disconnect your wallet, clear locally stored challenge progress and consent settings, and choose not to follow external links. Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or object to certain processing. Contact ${siteConfig.contactEmail} to make a request or ask for correction or removal of personal information in a community profile. We cannot alter public blockchain records.`,
  },
  {
    title: '12. Children',
    body: `The Service is not directed to children, and we do not knowingly collect personal information from children through public-site accounts because the website does not provide such accounts. If you believe a child has provided personal information to us, contact us so we can review the request.`,
  },
  {
    title: '13. Changes to This Policy',
    body: `We may update this Privacy Policy when the website, providers, or legal requirements change. The updated date will be shown on this page, and significant changes may also be announced through project channels.`,
  },
];

export function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" path="/privacy" />
      <div className="min-h-[calc(100vh-160px)] w-full max-w-6xl mx-auto px-8 md:px-16 py-20">
        <header className="mb-16">
          <p className="mb-2 font-mono text-sm text-muted-foreground">The ALANA Project</p>
          <h1 className="font-sans text-2xl font-medium leading-normal">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl font-sans text-lg font-normal leading-normal text-muted-foreground md:text-xl">
            How this website handles analytics consent, browser-local data, wallet information, and managed public content.
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
