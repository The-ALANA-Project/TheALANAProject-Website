import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { HorizontalTimeline } from '../components/HorizontalTimeline';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';

interface Portrait {
  imageUrl: string;
  caption: string;
}

const portraits: Portrait[] = [
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiezsmalwthphmri3bqvflmaugxggu4w5ftyzyc3ejxcrujzdubd6a', caption: 'ALANA was crafted by Stella Achenbach as a digital personification of the Web3 Revolution — a denim outfit covered in patches, badges and insignia to symbolise Web3.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidm5qca7kxgotj3fnm75v36kbv6clqxubc7bnxwrkjeh6jaamimcm', caption: 'At first, ALANA went by "the web3 girl" — a symbol pointing fellow creators toward a quiet tech revolution they could actually benefit from.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiaya54uw5pxuuaynrz6fy3npkrvigfvoyfvybv46nv35cljamd2oi', caption: "Soon after ALANA's birth, she stepped onto the virtual runway to moderate Digitalax's first Web3 Fashion Week, leading to her first protocol collaboration with Bancor." },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeih5mk4lbsgewzbv76pz67tq63qhyvr6qqxnbutlhuyw2yf5dh2afe', caption: 'For Harvest Finance, Paola, Domingo and Stella crafted a custom anniversary message for their third year on the market.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiaaslf4sfvrfnjqrg3rdrt7nrlsnp7nklggib5aapj7raoexn4t3y', caption: 'Pickle Finance was the third protocol we were invited to showcase with ALANA — Stella tried her best to make her look as tough as they come.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreihwsjm2oglzmbl6ww2vqvi3enjhf5ph2cqxlgsrhfv6sji6zxqozy', caption: 'Upside down on the sofa, ALANA lets gravity and guitar riffs pull her into a half-dreaming state. Created by Tânia and Stella as a cinematic NFT.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeigijj5abilhgaopyrtevquqlwvnp7uacrb47d6qqqtkihyko5jmwi', caption: 'In her second cinematic NFT, ALANA was dressed by dgtlstylist aka Alyona.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeib2fhh2e7javramww2blwf62aghgwpmya3ppqodvf72qkqzxuvtda', caption: 'After Paridhi joined us, ALANA got a visit from the Diwali fairy herself. Even in the middle of a desert, ALANA keeps her cool.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidxew3ranazmfryxporzw2cnocewfpugh4ukaudapesf6f7svevlu', caption: 'A walking nebula covers ALANA, designed by Heej.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibar2lvnglkzpj7tdgog5mfah4iwds54f2trbhie5cgdkgvrcmjw4', caption: 'Responsible for this bouquet mini-dress for ALANA was Kevin.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibi4ovrgrgi6q5anayhy6jlvp35kvu5bsgo6l5mnkua6nk35jz2ju', caption: 'A glazed sugar outfit in rainbow candy colours by Nicole.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidw5zq6353w3yupobdr7ocvitqg5xt5c24fpj5kkpbpk3y35cpjk4', caption: 'A futuristic design carrying a lot of symbolism by Burak, with custom make-up by Stella.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibncodnbqrzqbouv7jkls5hydy2vv22r54s547umskeyjf4nzfzf4', caption: 'Thanks to Paola, ALANA even became part of an academic thesis.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeieq6v3amvaq3cyb5nhdz7myel4aosbrbaz4hyomzbfyk2caqhru6u', caption: 'Catherine put ALANA in the midst of a protest styled as a fashion editorial giving a voice to a cause that needs one.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiasqdlisv4krciljiadvxkdsuxbjax4n46aoppufpfppzx73hxq5i', caption: 'ALANA Dracarys was brought to life by Tânia, Lillian and Stella.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeifiicjum3xycakjwa36xgbv3xpwnoidjg3gw2i46rtzixekgj2ef4', caption: "Heej, Zoe and Stella created the first version of Earendel Chateau, ALANA's elaborate space ship with an energy core from which ALANA could power the entire ship." },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibdql7zv4q6bitjngqqqgw7ntne7du44adytbb6vcobtsn6qlju24', caption: 'The rebranding transforms ALANA from a personal avatar to a community-driven persona, following brand guidelines by Klaus, Kirsty, Gonzalo and Stella.' },
  { imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeigo5apqzhlsmjzr57bniyslvborrtt6c2zaxytdn4r5exed5rtxs4', caption: 'How will the next version of ALANA look like? Ana, Jessica and Stella all had their hands on that new version considering the new community branding for ALANA.' },
];

const BASE_ROTATIONS = [-2.5, 1.2, -1.8, 2.2, -0.8, 1.5, -2.2, 0.6, -1.4, 2.8, -1.2, 0.4, 1.8, -1.6, 1.0, -2.0, 0.8];

const nameLinks: Record<string, string> = {
  'Stella':    'https://www.linkedin.com/in/stella-achenbach/',
  'Paola':     'https://www.linkedin.com/in/paolaguivel/',
  'Domingo':   'https://www.linkedin.com/in/domingo-beta/',
  'Tânia':     'https://www.linkedin.com/in/tania-viegas/',
  'Alyona':    'https://www.linkedin.com/in/alyona-briukhanova/',
  'Paridhi':   'https://www.linkedin.com/in/paridhi-dhariwal-6263a3187/',
  'Heej':      'https://www.linkedin.com/in/hee-jung-kang-363a551a/',
  'Kevin':     'https://www.linkedin.com/in/kevintung27/',
  'Nicole':    'https://www.linkedin.com/in/nkne/',
  'Burak':     'https://www.linkedin.com/in/burakdahan/',
  'Catherine': 'https://www.linkedin.com/in/catrod3d/',
  'Lillian':   'https://www.linkedin.com/in/lilliansato/',
  'Zoe':       'https://www.linkedin.com/in/zoe-vanezis/',
  'Klaus':     'https://www.linkedin.com/in/klaus-fleischhacker/',
  'Kirsty':    'https://www.linkedin.com/in/kirstymilloy/',
  'Gonzalo':   'https://www.linkedin.com/in/gonzalo-espinoza-mendoza-b6721491/',
  'Ana':       'https://www.linkedin.com/in/ana-paula-garza-sep%C3%BAlveda-bb885b1b6/',
  'Jessica':   'https://www.linkedin.com/in/princess-jessica-n-305245201/',
};

function linkifyCaption(caption: string) {
  const names = Object.keys(nameLinks).sort((a, b) => b.length - a.length);
  const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(caption)) !== null) {
    if (match.index > lastIndex) parts.push(caption.slice(lastIndex, match.index));
    const name = match[1];
    parts.push(
      <a
        key={match.index}
        href={nameLinks[name]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-70 transition-opacity pointer-events-auto"
      >
        {name}
      </a>
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < caption.length) parts.push(caption.slice(lastIndex));
  return parts;
}

function FloatingGalleryCard({ portrait, index }: { portrait: Portrait; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const baseRot = BASE_ROTATIONS[index % BASE_ROTATIONS.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({ x: ((cy - y) / cy) * 12, y: ((x - cx) / cx) * 12 });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotate(${baseRot}deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-10px)`
            : `rotate(${baseRot}deg)`,
          boxShadow: isHovered
            ? '0 25px 50px rgba(0,0,0,0.18), 0 0 30px rgba(220,194,254,0.1)'
            : '0 4px 18px rgba(0,0,0,0.12)',
          transitionDuration: isHovered ? '150ms' : '300ms',
          transitionProperty: 'transform, box-shadow',
          transitionTimingFunction: 'ease-out',
          width: 'fit-content',
          height: '380px',
        }}
        className="relative overflow-hidden cursor-pointer rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px]"
      >
        <img
          src={portrait.imageUrl}
          alt={`ALANA ${index + 1}`}
          className="h-full w-auto block"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.15), transparent 65%)`,
          }}
        />

        <div
          className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(38,36,36,0.92) 0%, rgba(38,36,36,0.45) 40%, transparent 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 250ms ease',
          }}
        >
          <p className="text-[#D9D9D9] text-xs leading-relaxed">{linkifyCaption(portrait.caption)}</p>
        </div>
      </div>
    </div>
  );
}


const teamMembers = [
  {
    name: 'Stella Achenbach',
    role: 'Nucleus Guardian',
    bio: "Stella is a creative strategist and community builder who brings structure and vision to The ALANA Project. As a Nucleus Guardian she oversees contributor onboarding and ensures the quest framework reflects the community's values.",
    initials: 'SA',
    linkedin: 'https://www.linkedin.com/in/stella-achenbach/',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidm2g3gnn5zezkpajalnmkbc2mshoqdonyz3g2q2tqglzaqkpdx4i',
    grayscale: false,
  },
  {
    name: 'Nils Otter',
    role: 'Nucleus Guardian',
    bio: "Nils is a product and technology specialist who shapes the technical infrastructure behind ALANA's contributor ecosystem. As a Nucleus Guardian he bridges engineering and community governance to keep the platform running and evolving.",
    initials: 'NO',
    linkedin: 'https://www.linkedin.com/in/nils-otter-a23446131/',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreifharckw7z6ll7itpoine2tuw3afapfpcgsp555rnljqcvbtvkcci',
    grayscale: true,
  },
  {
    name: 'Kerry Allen',
    role: 'Nucleus Specialist',
    bio: 'Kerry is a brand and design professional with deep experience in creative direction and visual communication. At ALANA she brings her expertise from Greyscale Group to help shape the aesthetic identity and contributor experience.',
    initials: 'KA',
    linkedin: 'https://www.linkedin.com/in/kerry-allen-greyscale-group/',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreiahrdlai2zlnvk3gutq5g6ktwhngtz6qsn2vrnnpoiuzs4qvhzqiq',
    grayscale: false,
  },
];

const cards = [
  {
    label: 'Our Origin',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiezsmalwthphmri3bqvflmaugxggu4w5ftyzyc3ejxcrujzdubd6a',
    text: 'ALANA began as a 3D avatar and grew into a home base for creators, creative builders and Web3-curious minds who want guidance, not hype. Together, we explore how storytelling, education, and onchain tools can unlock new ways to build creative products.',
    cta: 'Read More',
    href: 'https://paragraph.com/@the-alana-project',
  },
  {
    label: 'Our Mission',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibieu5wi7ijpfkgu4kmrlyd6znxkdupifdd3spftwsx7bhslpvjae',
    text: 'To make Web3 learning practical, safe, and creatively rewarding for everyone who joins. We build a collaborative space where people learn the basics, co-create projects, and grow ideas into sustainable, onchain opportunities.',
    cta: 'Join the Community',
    href: 'https://t.me/+1To9sD5l3T8zMjIy',
  },
  {
    label: 'Our Values',
    image: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidxw5nzssmeslj5jzpe3kdkfgfkp5vjnvbamb5s74u7js5ugmtfmy',
    text: "ALANA values clarity, safety, and community — no-nonsense education, real examples from creators, and honest conversations about both risks and possibilities. Every guide, workshop, and story aims to give you more control over your work, your data, and your path in Web3.",
    cta: 'Mint the Manifesto',
    href: 'https://app.unlock-protocol.com/checkout?id=fc22b412-bd47-49bb-8b5c-7415f277a935',
  },
];

const stats = [
  { value: '7,500+', label: 'Community Members' },
  { value: '30+', label: 'Creative Collaborations' },
  { value: '40+', label: 'Educational Resources' },
  { value: '~2,000', label: 'Hours of Mentorship' },
];

const pullQuotes = [
  {
    quote: "ALANA is 100% grassroots, most positive project in Blockchain <3.",
    name: 'Dr. Mark B. Richardson',
    href: 'https://www.linkedin.com/in/mrichardson87/',
  },
  {
    quote: "The cosmic vibes and inclusive community make learning fun. ALANA doesn't just teach web3 — it builds confidence and lasting friendships.",
    name: 'Kirsty Milloy',
    href: 'https://www.linkedin.com/in/kirstymilloy/',
  },
  {
    quote: 'This is a project created by good-hearted people and will actually have a positive impact for our future. We need this kind of project in tech so badly at the moment.',
    name: 'Hee Jung Kang',
    href: 'https://www.linkedin.com/in/hee-jung-kang-363a551a/',
  },
];

export function AboutPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % pullQuotes.length);
        setQuoteVisible(true);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Seo title="About" description={siteConfig.description} path="/about" />
      <div className="min-h-screen bg-background">

        {/* ── Hero ── */}
        <section className="w-full">
          <div className="relative w-full min-h-[80vh] overflow-hidden">
            <img
              src="https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidm2g3gnn5zezkpajalnmkbc2mshoqdonyz3g2q2tqglzaqkpdx4i"
              alt="ALANA"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#262424]/90 via-[#1a1020]/70 to-transparent" />
            <div className="relative z-10 flex items-center min-h-[80vh]">
              <div className="max-w-6xl mx-auto px-8 md:px-16 w-full">
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-4xl md:text-6xl font-medium text-white">
                    The Story of ALANA
                  </h1>
                  <p className="text-lg md:text-xl text-[#F3F3F3]/90 max-w-2xl font-normal">
                    From a 3D avatar to a thriving Web3 creative community — this is how ALANA was born, grew, and became a home base for creators and builders around the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <HorizontalTimeline />

        {/* ── Pull Quote ── */}
        <section className="w-full py-16 bg-accent">
          <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
            <div className="relative">
              {/* Ghost — Kirsty's quote (longest) locks the container height */}
              <div className="invisible pointer-events-none space-y-6" aria-hidden="true">
                <blockquote className="text-xl md:text-3xl font-medium leading-relaxed italic">
                  "{pullQuotes[1].quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-px" />
                  <span>{pullQuotes[1].name}</span>
                  <div className="w-16 h-px" />
                </div>
              </div>

              {/* Single active quote — fades out, swaps, fades in */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                style={{ opacity: quoteVisible ? 1 : 0, transition: 'opacity 600ms ease' }}
              >
                <blockquote className="text-xl md:text-3xl font-medium text-[#262424] leading-relaxed italic">
                  "{pullQuotes[quoteIndex].quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-px bg-[#262424] opacity-40" />
                  <cite className="text-[#262424] not-italic">
                    <a
                      href={pullQuotes[quoteIndex].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60 transition-opacity"
                    >
                      {pullQuotes[quoteIndex].name}
                    </a>
                  </cite>
                  <div className="w-16 h-px bg-[#262424] opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who Is ALANA + Floating Gallery ── */}
        <section className="w-full bg-background py-14" style={{ overflowX: 'clip' }}>
          <div className="mx-auto pl-8 md:pl-16 pr-0">
            <h2 className="text-2xl md:text-3xl font-medium mb-4">Who Is ALANA?</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-4xl mb-14 leading-relaxed">
              ALANA is a digital persona at the centre of our tech-forward Web3 community. Her journey evolved from a digital fashion model to a character owning her own storyline — spanning protocol collaborations, immersive storytelling, and building bridges between creators and decentralised technology.
            </p>

            <div
              className="flex flex-row gap-5 overflow-x-auto pt-10 pb-16 pl-3 pr-8 md:pr-16"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(220,194,254,0.3) transparent' }}
            >
              {portraits.map((p, i) => {
                const staggerPx = [0, 36, 18];
                return (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{ marginTop: staggerPx[i % 3] }}
                  >
                    <FloatingGalleryCard portrait={p} index={i} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="bg-accent py-12">
          <div className="max-w-6xl mx-auto px-8 md:px-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="text-2xl md:text-3xl font-medium text-[#262424]">{s.value}</div>
                  <div className="text-sm text-[#262424]/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Light bg sections ── */}
        <div className="bg-background">

          {/* Origin / Mission / Values */}
          <section className="max-w-6xl mx-auto px-8 md:px-16 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="border border-foreground rounded-[8px] overflow-hidden flex flex-col"
                >
                  {card.image ? (
                    <div className="w-full aspect-square overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.label}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-muted" />
                  )}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <h3 className="text-lg font-medium">{card.label}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{card.text}</p>
                    {card.label === 'Our Origin' ? (
                      <Link
                        to="/blog"
                        className="inline-flex items-center justify-center px-6 h-11 text-sm font-medium bg-accent text-[#262424] border border-accent rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent"
                      >
                        {card.cta}
                      </Link>
                    ) : (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 h-11 text-sm font-medium bg-accent text-[#262424] border border-accent rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent"
                      >
                        {card.cta}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>


        </div>

        {/* ── Telegram CTA ──────────────────────────────────────────────── */}
        <section className="w-full mt-12 mb-0">
          <div className="relative w-full min-h-[35vh] overflow-hidden group" style={{ background: '#DCC2FE' }}>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url(https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeido2glqw574c5kxquhgythghbnchqibzbvvr6exxshlfve5ldsnd4)`,
                mixBlendMode: 'luminosity',
                opacity: 0.6,
              }}
            />
            <div className="relative z-10 flex items-center justify-center min-h-[35vh] px-8 md:px-16">
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="font-medium text-[#F3F3F3]">Join Us</h2>
                <p className="text-[#F3F3F3]/90 text-base md:text-lg leading-relaxed">
                  Reach out to us and become an official ALANA contributor.
                </p>
                <a
                  href={siteConfig.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium text-white bg-white/5 backdrop-blur-sm border border-white/30 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-white/5 hover:border-accent hover:text-accent"
                >
                  Join Our Community on Telegram
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
