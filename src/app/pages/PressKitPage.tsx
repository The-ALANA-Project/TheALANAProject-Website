import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

const assets = [
  {
    category: 'Logos',
    items: [
      { name: 'ALANA Wordmark (SVG)', description: 'Primary wordmark on white and dark backgrounds.', available: false },
      { name: 'ALANA Symbol (SVG)', description: 'Standalone symbol mark for use at small sizes.', available: false },
      { name: 'Logo Pack (ZIP)', description: 'All logo variants in SVG and PNG formats.', available: false },
    ],
  },
  {
    category: 'Brand Colours',
    items: [
      { name: 'Off-White', description: '#F3F3F3 — primary background', available: true, chip: '#F3F3F3' },
      { name: 'Black Hole', description: '#262424 — foreground / text', available: true, chip: '#262424' },
      { name: 'Digital Lavender', description: '#DCC2FE — accent / highlight', available: true, chip: '#DCC2FE' },
      { name: 'Golden Biscuit', description: '#FFDDB2 — reward / top-rank highlight', available: true, chip: '#FFDDB2' },
      { name: 'Cyber Green', description: '#27EF8C — primary CTA / success', available: true, chip: '#27EF8C' },
    ],
  },
  {
    category: 'Media Assets',
    items: [
      { name: 'Press Images (ZIP)', description: 'High-resolution photos approved for editorial use.', available: false },
      { name: 'Team Headshots', description: 'Individual high-res photos of core team members.', available: false },
      { name: 'Product Screenshots', description: 'Current screenshots of the ALANA Calculator.', available: false },
    ],
  },
];

export function PressKitPage() {
  return (
    <>
      <Seo
        title="Press Kit"
        description="Official brand assets, logos, colour palette, and media resources for The ALANA Project."
        path="/press-kit"
      />
      <div className="min-h-[calc(100vh-160px)] px-8 md:px-16 max-w-6xl mx-auto py-20">
        <header className="mb-16">
          <p className="font-mono text-sm text-muted-foreground mb-3 uppercase tracking-widest">Media</p>
          <h1 className="leading-tight">Press Kit</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Official brand assets and media resources for press, partners, and community creators. For editorial enquiries contact{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-foreground underline underline-offset-2">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </header>

        <div className="space-y-12">
          {assets.map((group) => (
            <section key={group.category}>
              <h2 className="text-lg font-sans font-semibold mb-4 pb-3 border-b border-foreground">{group.category}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.chip && (
                        <div
                          className="w-6 h-6 shrink-0 rounded-sm border border-foreground/20 mt-0.5"
                          style={{ backgroundColor: item.chip }}
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="font-sans font-medium text-sm">{item.name}</p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                    {!item.chip && (
                      <button
                        disabled={!item.available}
                        className="mt-auto inline-flex items-center justify-center bg-accent text-accent-foreground font-sans font-medium text-xs px-4 h-8 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {item.available ? 'Download' : 'Coming Soon'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
