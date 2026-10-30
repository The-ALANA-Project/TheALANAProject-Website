import { Check, CopySimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

interface PressAsset {
  name: string;
  description: string;
  available: boolean;
  colour?: string;
  colourGroup?: 'Core / Primary' | 'Secondary / Brand';
  assetUrl?: string;
  assetLabel?: string;
  secondaryAssetUrl?: string;
  secondaryAssetLabel?: string;
  previewOnDark?: boolean;
  previewText?: string;
  typefaceClass?: string;
}

const logoAssetBase =
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiapuwp5qvwn2bm42vkqzhfij2oegdguy3kzprdxu5g3oazlyuurma';

const assets: { category: string; items: PressAsset[] }[] = [
  {
    category: 'Press Release',
    items: [
      {
        name: 'The ALANA Project puts creative power back where it belongs',
        description:
          'The ALANA Project is building a community-governed ecosystem for creator sovereignty—equipping creators with the knowledge, tools and shared infrastructure to own their work, participate in the decisions that shape their future and create value on their own terms. Through open education, verifiable participation and community-led products, ALANA is turning audiences into contributors and putting creative power back where it belongs: with creators and their communities.',
        available: false,
      },
    ],
  },
  {
    category: 'Logos',
    items: [
      {
        name: 'Wordmark — Black',
        description: 'Black SVG wordmark for light backgrounds.',
        available: true,
        assetUrl: `${logoAssetBase}/ALANA-blackfull.svg`,
        assetLabel: 'Download SVG',
        secondaryAssetUrl: `${logoAssetBase}/ALANA%20Word%20Mark%20-%20Black%20on%20White.png`,
        secondaryAssetLabel: 'Download PNG',
      },
      {
        name: 'Wordmark — White',
        description: 'White SVG wordmark for dark backgrounds.',
        available: true,
        assetUrl: `${logoAssetBase}/ALANA-whitefull.svg`,
        assetLabel: 'Download SVG',
        secondaryAssetUrl: `${logoAssetBase}/ALANA%20Word%20Mark%20-%20White%20on%20Black.png`,
        secondaryAssetLabel: 'Download PNG',
        previewOnDark: true,
      },
      {
        name: 'Symbol — Black',
        description: 'Black standalone SVG symbol for light backgrounds.',
        available: true,
        assetUrl: `${logoAssetBase}/ALANA-black.svg`,
        assetLabel: 'Download SVG',
        secondaryAssetUrl: `${logoAssetBase}/ALANA%20Image%20Mark%20-%20Black%20on%20White.png`,
        secondaryAssetLabel: 'Download PNG',
      },
      {
        name: 'Symbol — White',
        description: 'White standalone SVG symbol for dark backgrounds.',
        available: true,
        assetUrl: `${logoAssetBase}/ALANA-white.svg`,
        assetLabel: 'Download SVG',
        secondaryAssetUrl: `${logoAssetBase}/ALANA%20Image%20Mark%20-%20White%20on%20Black.png`,
        secondaryAssetLabel: 'Download PNG',
        previewOnDark: true,
      },
    ],
  },
  {
    category: 'Brand Colours',
    items: [
      {
        name: 'Black Hole',
        description: 'Dark surface and primary text.',
        available: true,
        colour: '#262424',
        colourGroup: 'Core / Primary',
      },
      {
        name: 'Off-White',
        description: 'Default page background.',
        available: true,
        colour: '#F3F3F3',
        colourGroup: 'Core / Primary',
      },
      {
        name: 'White Glow',
        description: 'Pure white — cards, inputs and highlights on dark surfaces.',
        available: true,
        colour: '#FFFFFF',
        colourGroup: 'Core / Primary',
      },
      {
        name: 'Grounding Grey',
        description: 'Neutral fills and dividers.',
        available: true,
        colour: '#D9D9D9',
        colourGroup: 'Secondary / Brand',
      },
      {
        name: 'Golden Biscuit',
        description: 'Status accent — for example, Admin.',
        available: true,
        colour: '#FFDDB2',
        colourGroup: 'Secondary / Brand',
      },
      {
        name: 'Digital Lavender −',
        description: 'Deep accent — hover and active states.',
        available: true,
        colour: '#CEAAFE',
        colourGroup: 'Secondary / Brand',
      },
      {
        name: 'Digital Lavender +',
        description: 'Primary accent.',
        available: true,
        colour: '#DCC2FE',
        colourGroup: 'Secondary / Brand',
      },
      {
        name: 'Cyber Green',
        description: 'Status accent — success.',
        available: true,
        colour: '#27EF8C',
        colourGroup: 'Secondary / Brand',
      },
      {
        name: 'Cyber Pink',
        description: 'Status accent — error and destructive actions.',
        available: true,
        colour: '#E01F5E',
        colourGroup: 'Secondary / Brand',
      },
    ],
  },
  {
    category: 'Typefaces',
    items: [
      {
        name: 'Roboto',
        description: 'Primary sans-serif typeface for body copy, headings and interface text.',
        available: true,
        assetUrl: 'https://fonts.google.com/specimen/Roboto',
        assetLabel: 'View & download on Google Fonts',
        previewText: 'Creator sovereignty',
        typefaceClass: 'font-sans',
      },
      {
        name: 'Roboto Mono',
        description: 'Monospaced typeface for labels, metadata, technical details and supporting accents.',
        available: true,
        assetUrl: 'https://fonts.google.com/specimen/Roboto+Mono',
        assetLabel: 'View & download on Google Fonts',
        previewText: 'Community governed',
        typefaceClass: 'font-mono',
      },
    ],
  },
  {
    category: 'ALANA Avatar Assets',
    items: [
      { name: 'ALANA Avatar Pack (ZIP)', description: 'The complete collection of official ALANA avatars.', available: false },
      { name: 'Individual Avatars (PNG)', description: 'High-resolution avatars with transparent backgrounds.', available: false },
      { name: 'Social Profile Images (ZIP)', description: 'Avatar artwork sized for social profile use.', available: false },
    ],
  },
];

export function PressKitPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    window.setTimeout(() => {
      setCopiedText((current) => (current === text ? null : current));
    }, 1500);
  };

  return (
    <>
      <Seo
        title="Press Kit"
        description="Official brand assets, logos, colour palette, and media resources for The ALANA Project."
        path="/press-kit"
      />
      <div className="min-h-[calc(100vh-160px)] px-8 md:px-16 max-w-6xl mx-auto py-20">
        <header className="mb-16">
          <p className="font-mono text-sm text-muted-foreground mb-3 uppercase tracking-widest">The ALANA Project</p>
          <h1 className="font-sans text-2xl font-medium leading-normal">Press Kit</h1>
          <p className="mt-4 max-w-2xl font-sans text-lg font-normal leading-normal text-muted-foreground md:text-xl">
            Official brand assets and media resources for press, partners, and community creators. For editorial enquiries contact{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-foreground underline underline-offset-2">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </header>

        <div className="space-y-12">
          {assets.map((group) => (
            <section key={group.category}>
              <h3 className="text-base font-sans font-semibold mb-4 pb-3 border-b border-foreground">{group.category}</h3>
              {group.category === 'Press Release' ? (
                <div className="flex max-w-3xl items-start gap-4">
                  <div>
                    <p className="font-sans text-xl font-medium leading-normal">{group.items[0].name}</p>
                    <p className="mt-3 font-sans text-base leading-relaxed text-muted-foreground">
                      {group.items[0].description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyText(`${group.items[0].name}\n\n${group.items[0].description}`)}
                    className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
                    aria-label="Copy press release text"
                    title={
                      copiedText === `${group.items[0].name}\n\n${group.items[0].description}`
                        ? 'Copied'
                        : 'Copy press release text'
                    }
                  >
                    {copiedText === `${group.items[0].name}\n\n${group.items[0].description}` ? (
                      <Check size={14} aria-hidden="true" />
                    ) : (
                      <CopySimple size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>
              ) : group.category === 'Brand Colours' ? (
                <div className="space-y-8">
                  <p className="max-w-2xl font-sans text-base leading-relaxed text-muted-foreground">
                    The documented brand palette, grouped by role and used exactly as specified in the ALANA brand
                    guidelines.
                  </p>
                  {(['Core / Primary', 'Secondary / Brand'] as const).map((colourGroup) => (
                    <div key={colourGroup}>
                      <h4 className="mb-3 font-mono text-sm font-medium">{colourGroup}</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items
                          .filter((item) => item.colourGroup === colourGroup)
                          .map((item) => (
                            <div key={item.name} className="overflow-hidden rounded-[4px] border border-foreground">
                              <div
                                className="h-16 border-b border-foreground/20"
                                style={{ backgroundColor: item.colour }}
                                aria-hidden="true"
                              />
                              <div className="p-4">
                                <p className="font-sans text-sm font-medium">{item.name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="font-mono text-xs text-muted-foreground">{item.colour}</p>
                                  <button
                                    type="button"
                                    onClick={() => void copyText(item.colour!)}
                                    className="inline-flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
                                    aria-label={`Copy ${item.name} hex code ${item.colour}`}
                                    title={copiedText === item.colour ? 'Copied' : 'Copy hex code'}
                                  >
                                    {copiedText === item.colour ? (
                                      <Check size={14} aria-hidden="true" />
                                    ) : (
                                      <CopySimple size={14} aria-hidden="true" />
                                    )}
                                  </button>
                                </div>
                                <p className="mt-3 font-sans text-xs leading-normal text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-4 ${
                    group.category === 'Logos'
                      ? 'sm:grid-cols-2 lg:grid-cols-4'
                      : group.category === 'Typefaces'
                        ? 'md:grid-cols-2'
                        : 'sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col gap-3 rounded-[4px] border border-foreground p-5"
                    >
                      {item.previewText ? (
                        <div className="flex h-28 flex-col justify-center rounded-[4px] border border-foreground/20 bg-background px-6">
                          <p className={`${item.typefaceClass} text-3xl leading-none`}>Aa</p>
                          <p className={`${item.typefaceClass} mt-3 truncate text-sm text-muted-foreground`}>
                            {item.previewText}
                          </p>
                        </div>
                      ) : item.assetUrl ? (
                        <div
                          className={`flex h-28 items-center justify-center rounded-[4px] border border-foreground/20 p-6 ${
                            item.previewOnDark ? 'bg-foreground' : 'bg-background'
                          }`}
                        >
                          <img src={item.assetUrl} alt="" className="h-full w-full object-contain" loading="lazy" />
                        </div>
                      ) : null}
                      <div>
                        <p className="font-sans font-medium text-sm">{item.name}</p>
                        <p className="font-mono text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      {item.assetUrl ? (
                        <div className="mt-auto flex flex-col gap-2">
                          <a
                            href={item.assetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={item.assetLabel === 'Download SVG'}
                            className="inline-flex h-8 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-4 font-sans text-xs font-medium text-accent-foreground transition-all duration-300 hover:border-accent hover:bg-foreground hover:text-accent"
                          >
                            {item.assetLabel}
                          </a>
                          {item.secondaryAssetUrl && (
                            <a
                              href={item.secondaryAssetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex h-8 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-foreground bg-transparent px-4 font-sans text-xs font-medium text-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                            >
                              {item.secondaryAssetLabel}
                            </a>
                          )}
                        </div>
                      ) : (
                        <button
                          disabled={!item.available}
                          className="mt-auto inline-flex h-8 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-4 font-sans text-xs font-medium text-accent-foreground transition-all duration-300 hover:border-accent hover:bg-foreground hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:hover:text-accent-foreground"
                        >
                          {item.available ? 'Download' : 'Coming Soon'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section>
            <h3 className="mb-4 border-b border-foreground pb-3 font-sans text-base font-semibold">Design System</h3>
            <p className="mb-4 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground">
              Explore The ALANA Project&apos;s complete digital design system, including brand foundations, visual language,
              and interface guidance.
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-[4px] border border-foreground">
              <iframe
                title="The ALANA Project digital design system"
                src="https://embed.figma.com/design/VidDkOacJRUfQFplDFNuD9/The-ALANA-Project---Digital-Design-System?node-id=0-1&embed-host=share"
                className="h-full w-full"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
