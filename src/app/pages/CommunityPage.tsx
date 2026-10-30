import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Footer } from '../components/Footer';
import { HeroScrambleHeading } from '../components/HeroScrambleHeading';
import { Seo } from '../components/Seo';
import { Button } from '../components/ui/button';
import { siteConfig } from '../config/site';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { fetchBlogPosts, BlogPost, getAuthorInitials, formatPubDate } from '../services/blogService';
import { fetchTickerItems, fetchStoryFlags, fetchCommunityMembers, fetchCommunityTools, type CommunityMember, type CommunityTool } from '../services/communityAdminService';
import { optimizedImageSrcSet, optimizedImageUrl } from '../utils/image';
import { Plus } from '@phosphor-icons/react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Member {
  name: string;
  role: string;
  team: string;
  skills: string[];
  active: boolean;
  bio?: string;
  imageUrl?: string;
  socialUrl?: string;
  websiteUrl?: string;
}

const communityQuotes = [
  { quote: "It's a joy to be involved with this project!", name: 'Kerry Allen', href: 'https://www.linkedin.com/in/kerry-allen-greyscale-group/' },
  { quote: "A rare community where personal and professional growth happen naturally, supported by people that value both innovation and wellbeing.", name: 'Daniele Nanni', href: 'https://www.linkedin.com/in/daniele-nanni-90/' },
];

const CONTRIBUTION_CALCULATOR_IMAGE_URL = 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeid5op27w5udlle4b4c6fcclicyiuaye4d3tpfhsteus7wbwdxtmbi';

const alanaTools = [
  {
    name: 'Contribution Calculator',
    description: 'Track and visualise your contributions to the ALANA ecosystem. See how your work translates into recognition.',
    url: 'https://contributions.the-alana-project.xyz/',
    imageUrl: CONTRIBUTION_CALCULATOR_IMAGE_URL,
  },
];

const communityTools = [
  {
    name: 'Creator Pricing',
    description: 'A tool to help creators make their pricing transparent and fair — know your worth and communicate it clearly.',
    url: 'https://creatorpricing.com/',
    author: 'Stella Achenbach',
    author_url: null as string | null,
    imageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiasqu72yapwwk7qbjfia43rik2obqkawgugyzdteaaktve4nc6gpa/CPC-Social%20Crawler%20Image.png',
    authorImageUrl: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidm2g3gnn5zezkpajalnmkbc2mshoqdonyz3g2q2tqglzaqkpdx4i',
  },
];

const internalStack = [
  { name: 'Milanote', url: 'https://milanote.com', note: 'Visual planning' },
  { name: 'Telegram', url: 'https://t.me/+1To9sD5l3T8zMjIy', note: 'Community chat' },
  { name: 'Figma', url: 'https://figma.com', note: 'Design' },
  { name: 'Snapshot', url: 'https://snapshot.org/#/s:the-alana-project.eth', note: 'Voting platform' },
];

const EVENT_PHOTOS = [
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreig3soehtbe5zpqj5u2vigt2brf4euylwsplps4nm5tpvkx25mvw2e',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreicy2fely3636o6oayf2vil3jcjy34h3u2je6e3o6zvn6lz7wv47pq',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiclfsh4nspmid443gwwonxrrugow4ux7vxdjr3oiosxz44ewzkkbm',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidloxlg747wria2rldrmt6jmzegvmuemjijp2edox7fse3jod5sgy',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeihei2nvhzozd6ss2zatwr5jun4mcoyitglsa5mk2v3kyitqajlaii',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeieluer37znxw7s73dryuivwptvfzcqduf4yrf7i4ae4nce7kunfni',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeibukrurpsmp4wdqgk655w7tdekx2ga6xmuo6wwelpba5ofs6occga',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeif3usavyuvosm6yid3bjxsljzznexmvfwcfqufiab4bd5xhg5alda',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidve4ml6ripxzwvcbev3w4mmrknjnd7wcpm4rn7nbnbqxmeuj35cq',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeicdro6aq4wvez6x6funcjl6oibcu6eprsku4au7sq2du5sknqaqtm',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeifsy5e6qxo3afnrgehiohhon6oupkmtu5sus6c7zjtdw7zj5jrv2q',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeic72eaj4l7mllbk5gcggcibjvjyb2n66m4izwsslu5dpler5ooena',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiesm7k47bvjfwqzeo3urvfuba2rnocaiwde7dv7y3mh4yb6fd3azy',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreigajavgy5w7yeeccmwavsnfxwbg3tghwebpfsfhtymeuskswn6cjq',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreideds2na66tetwe2qzsqpnwintctxrf3e6cgwbj7aalsdxhbjdhvq',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidbtlscarjxjucbayfdi3lsvy77zkmkp6dyn4nlrayute6ywgcmbq',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeifrorwybcg5mbkhlex2wh7k6plrowl27tmsh54kzotgmbth6mqg6a',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeidohloolswiwakrqzdp5ododjlmhk6vmxclabszv23ynmyrr4lmre',
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeigmtenz25lszetwi4yx5tkoxzcp5onvx7ie5osw4pgxhnnb4xs7uq',
];

const eventPhotoCount = EVENT_PHOTOS.length;

// ── Sub-components ─────────────────────────────────────────────────────────────
const BASE_ROTATIONS = [-2.1, 1.4, -1.6, 2.0, -0.9, 1.7, -2.3, 0.5];

function EventPhotoCard({ index }: { index: number }) {
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
    setTilt({ x: ((cy - y) / cy) * 10, y: ((x - cx) / cx) * 10 });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }); setGlow({ x: 50, y: 50 }); }}
        style={{
          transform: isHovered
            ? `rotate(${baseRot}deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px)`
            : `rotate(${baseRot}deg)`,
          boxShadow: isHovered
            ? '0 25px 50px rgba(0,0,0,0.16), 0 0 28px rgba(220,194,254,0.12)'
            : '0 4px 18px rgba(0,0,0,0.1)',
          transitionDuration: isHovered ? '150ms' : '300ms',
          transitionProperty: 'transform, box-shadow',
          transitionTimingFunction: 'ease-out',
          width: EVENT_PHOTOS[index] ? 'fit-content' : '300px',
          height: '340px',
        }}
        className="relative overflow-hidden cursor-pointer rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] bg-[#1a1a1a]"
      >
        {EVENT_PHOTOS[index] ? (
          <>
            <img
              src={optimizedImageUrl(EVENT_PHOTOS[index], 640)}
              srcSet={optimizedImageSrcSet(EVENT_PHOTOS[index], [320, 480, 640, 760])}
              sizes="(max-width: 767px) 80vw, 480px"
              alt={`Community moment ${index + 1}`}
              className="h-full w-auto block"
              loading="lazy"
              decoding="async"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(220,194,254,0.08), transparent 65%)` }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-3">
            <span className="font-mono font-bold text-[#DCC2FE]/10 text-7xl select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#DCC2FE]/20 select-none">
              Event Photo
            </span>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(220,194,254,0.08), transparent 65%)` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="group flex h-full flex-col gap-4 rounded-[8px] border border-foreground bg-background p-5">
      <div
        className={`aspect-square w-full overflow-hidden rounded-[4px] ${
          member.active
            ? 'ring-2 ring-accent shadow-lg shadow-accent/60'
            : 'border border-foreground/20'
        }`}
      >
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/30">
            <span className="font-mono text-3xl font-medium text-foreground">{initials}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-medium">{member.name}</span>
          {member.active && <span className="sr-only">Active member</span>}
        </div>
        <p className="text-xs text-muted-foreground font-bold mt-0.5">{member.role}</p>
        <p className="text-xs text-muted-foreground">{member.team}</p>
      </div>
      {member.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {member.skills.map(skill => (
          <span key={skill} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 border border-foreground/20 text-muted-foreground">
            {skill}
          </span>
        ))}
      </div>
      {(member.socialUrl || member.websiteUrl) && (
        <div className="flex gap-3 pt-1">
          {member.socialUrl && (
            <a
              href={member.socialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors"
            >
              Social
            </a>
          )}
          {member.websiteUrl && (
            <a
              href={member.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors"
            >
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function AuthorAvatar({ name, avatarUrl, size = 'sm' }: { name: string; avatarUrl: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const text = size === 'md' ? 'text-xs' : 'text-[10px]';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${dim} ${text} rounded-full bg-accent text-[#262424] flex items-center justify-center font-mono font-semibold shrink-0`}>
      {getAuthorInitials(name)}
    </div>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group border border-foreground rounded-[8px] overflow-hidden cursor-pointer hover:border-accent transition-colors flex flex-col bg-background"
    >
      {post.imageUrl && (
        <div className="w-full shrink-0">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto block" loading="lazy" />
          <div className="w-full h-px bg-foreground" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        <h4 className="leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 pt-1 border-t border-foreground/10">
          <AuthorAvatar name={post.author} avatarUrl={post.authorAvatarUrl ?? null} />
          <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{post.author}</span>
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">{formatPubDate(post.pubDate)}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function CommunityPage() {
  const {
    shouldReduceMotion,
    revealDescription,
    descriptionVisible,
    transition: heroRevealTransition,
  } = useHeroIntroSequence();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleMemberCount, setVisibleMemberCount] = useState(3);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [liveTickerItems, setLiveTickerItems] = useState<string[]>([]);
  const [liveMembers, setLiveMembers] = useState<CommunityMember[] | null>(null);
  const [liveTools, setLiveTools] = useState<CommunityTool[]>([]);

  const shuffledPhotoIndices = useMemo(() => {
    const indices = Array.from({ length: eventPhotoCount }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % communityQuotes.length);
        setQuoteVisible(true);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live members managed through the Guardian Panel.
  useEffect(() => {
    fetchCommunityMembers().then(fetched => {
      const visible = fetched.filter(m => m.visible);
      if (visible.length > 0) setLiveMembers(visible);
    }).catch(() => {});
  }, []);

  // Fetch live ticker items from Guardian Panel; fall back to hardcoded list
  useEffect(() => {
    fetchTickerItems().then(items => {
      const active = items.filter(i => i.active).map(i => i.text);
      if (active.length > 0) setLiveTickerItems(active);
    }).catch(() => {});
  }, []);

  // Fetch live tools from Guardian Panel; fall back to static data if empty
  useEffect(() => {
    fetchCommunityTools().then(fetched => {
      const active = fetched.filter(t => t.active);
      if (active.length > 0) setLiveTools(active);
    }).catch(() => {});
  }, []);

  // Fetch blog posts — 3 random from flagged pool, falling back to full feed
  useEffect(() => {
    Promise.all([fetchBlogPosts(), fetchStoryFlags()]).then(([posts, flags]) => {
      const flaggedGuids = new Set(flags.filter(f => f.flagged).map(f => f.guid));
      const pool = flaggedGuids.size > 0
        ? posts.filter(p => flaggedGuids.has(p.guid))
        : posts;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setBlogPosts(shuffled.slice(0, 3));
    }).catch(() => {});
  }, []);

  // Normalise live members, then shuffle once per fetch so each page load starts
  // with a different cross-section while remaining stable during interaction.
  const resolvedMembers = useMemo<Member[]>(() => {
    const members = liveMembers
      ? liveMembers.map(m => ({
          name: m.name,
          role: m.role,
          team: m.team,
          skills: m.skills,
          active: m.active,
          bio: m.bio,
          imageUrl: m.image_url || undefined,
          socialUrl: m.social_url || undefined,
          websiteUrl: m.website_url || undefined,
        }))
      : [];

    for (let i = members.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [members[i], members[j]] = [members[j], members[i]];
    }

    return members;
  }, [liveMembers]);

  // Filter members
  const filteredMembers = resolvedMembers.filter(m => {
    const q = search.toLowerCase();
    return !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.team.toLowerCase().includes(q) ||
      m.skills.some(s => s.toLowerCase().includes(q));
  });
  const visibleMembers = filteredMembers.slice(0, visibleMemberCount);

  useEffect(() => {
    setVisibleMemberCount(3);
  }, [search]);

  const allTicker = [...liveTickerItems, ...liveTickerItems];

  // Derive live tool lists, falling back to static data when Supabase returns nothing
  const liveAlanaTools = liveTools.filter(t => t.category === 'alana');
  const resolvedAlanaTools    = liveAlanaTools.length > 0
    ? liveAlanaTools.map(tool => tool.name === 'Contribution Calculator'
      ? { ...tool, image_url: CONTRIBUTION_CALCULATOR_IMAGE_URL }
      : tool)
    : alanaTools.map(t => ({ ...t, id: t.name, author: null, category: 'alana' as const, note: null, active: true, display_order: null }));
  const resolvedCommunityTools = liveTools.filter(t => t.category === 'community').length > 0
    ? liveTools.filter(t => t.category === 'community')
    : communityTools.map(t => ({ ...t, id: t.name, image_url: t.imageUrl ?? null, author_url: t.author_url ?? null, category: 'community' as const, note: null, active: true, display_order: null }));
  const resolvedStack          = liveTools.filter(t => t.category === 'internal_stack').length > 0
    ? liveTools.filter(t => t.category === 'internal_stack')
    : internalStack.map(t => ({ ...t, id: t.name, description: null, author: null, category: 'internal_stack' as const, active: true, display_order: null }));

  return (
    <div className="w-full max-w-full overflow-x-clip">
      <Seo
        title="Community"
        description="Meet the ALANA community — members, stories, resources, and a living directory of contributors from around the world."
        path="/community"
      />

      {/* ── Hero ────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 overflow-hidden" style={{ background: '#e2ccfe' }}>
        {/* Organic blob layer */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="ch-grain-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
          </svg>
          <div className="ch-blob ch-blob-1" />
          <div className="ch-blob ch-blob-2" />
          <div className="ch-blob ch-blob-3" />
          <div className="ch-blob ch-blob-4" />
          {/* Grain overlay — fractalNoise at fine frequency for film-grain feel */}
          <div className="ch-grain" />
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-16">
          <HeroScrambleHeading
            className="font-medium text-[#262424] leading-tight max-w-2xl"
            onComplete={revealDescription}
          >
            The ALANA Community
          </HeroScrambleHeading>
          <motion.p
            className="mt-4 text-[#262424]/70 max-w-2xl font-normal leading-relaxed"
            initial={{ y: shouldReduceMotion ? 0 : -24, opacity: 0 }}
            animate={{
              y: descriptionVisible || shouldReduceMotion ? 0 : -24,
              opacity: descriptionVisible || shouldReduceMotion ? 1 : 0,
            }}
            transition={heroRevealTransition}
          >
            Join our vibrant community where creativity, innovation, and ownership thrive together. Connect with creators, builders, and tech-curious minds from around the world.
          </motion.p>
        </div>
        <style>{`
          .ch-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(55px);
          }
          /* Deep violet — starts far left, sweeps across to right */
          .ch-blob-1 {
            width: 40%;
            height: 180%;
            background: radial-gradient(circle, #6b3fa0 0%, transparent 65%);
            opacity: 0.55;
            top: -40%;
            left: -10%;
            animation: ch-float-1 18s ease-in-out infinite;
          }
          /* Near-white highlight — starts far right, sweeps to left */
          .ch-blob-2 {
            width: 40%;
            height: 180%;
            background: radial-gradient(circle, #f5eeff 0%, transparent 60%);
            opacity: 0.9;
            top: -30%;
            right: -10%;
            animation: ch-float-2 22s ease-in-out infinite;
          }
          /* Mid deep purple — starts bottom-center, sweeps left then right */
          .ch-blob-3 {
            width: 35%;
            height: 160%;
            background: radial-gradient(circle, #7c4db8 0%, transparent 65%);
            opacity: 0.5;
            bottom: -60%;
            left: 30%;
            animation: ch-float-3 15s ease-in-out infinite;
          }
          /* Lavender mid-tone — starts right-center, drifts left */
          .ch-blob-4 {
            width: 30%;
            height: 150%;
            background: radial-gradient(circle, #DCC2FE 0%, transparent 65%);
            opacity: 0.8;
            top: -20%;
            left: 55%;
            animation: ch-float-4 26s ease-in-out infinite;
          }
          @keyframes ch-float-1 {
            0%   { transform: translate(0vw, 0%) scale(1); }
            33%  { transform: translate(45vw, 15%) scale(1.08); }
            66%  { transform: translate(20vw, -5%) scale(0.95); }
            100% { transform: translate(0vw, 0%) scale(1); }
          }
          @keyframes ch-float-2 {
            0%   { transform: translate(0vw, 0%) scale(1); }
            25%  { transform: translate(-42vw, 10%) scale(1.05); }
            60%  { transform: translate(-18vw, -8%) scale(0.97); }
            80%  { transform: translate(-30vw, 12%) scale(1.03); }
            100% { transform: translate(0vw, 0%) scale(1); }
          }
          @keyframes ch-float-3 {
            0%   { transform: translate(0vw, 0%) scale(1); }
            40%  { transform: translate(-28vw, -15%) scale(1.1); }
            70%  { transform: translate(22vw, -5%) scale(0.93); }
            100% { transform: translate(0vw, 0%) scale(1); }
          }
          @keyframes ch-float-4 {
            0%   { transform: translate(0vw, 0%) scale(1); }
            35%  { transform: translate(-38vw, 20%) scale(1.06); }
            65%  { transform: translate(-10vw, 8%) scale(0.96); }
            100% { transform: translate(0vw, 0%) scale(1); }
          }
          /* Grain — off-black base gives filter real content to work with */
          .ch-grain {
            position: absolute;
            inset: 0;
            background: #262424;
            filter: url(#ch-grain-filter);
            opacity: 0.28;
            mix-blend-mode: overlay;
            pointer-events: none;
          }
          /* Aligns scroll-row left edge with max-w-6xl mx-auto content (72rem = 1152px) */
          .scroll-inset-l {
            padding-left: max(2rem, calc((100vw - 72rem) / 2 + 2rem));
          }
          @media (min-width: 768px) {
            .scroll-inset-l {
              padding-left: max(4rem, calc((100vw - 72rem) / 2 + 4rem));
            }
          }
        `}</style>
      </section>

      {allTicker.length > 0 && (
        <div className="w-full bg-foreground overflow-hidden py-3 select-none">
          <div
            className="flex gap-12 whitespace-nowrap"
            style={{
              animation: 'ticker-scroll 40s linear infinite',
              width: 'max-content',
            }}
          >
            {allTicker.map((item, i) => (
              <span key={i} className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60 flex items-center gap-12">
                {item}
                <span className="text-accent text-base">✦</span>
              </span>
            ))}
          </div>
          <style>{`
            @keyframes ticker-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}

      {/* ── Event Photo Strip ─────────────────────────────────────────────── */}
      <section className="w-full bg-background pb-4" style={{ overflowX: 'clip' }}>
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16 pt-16">
          <h2 className="mb-2">Moments</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mb-0 leading-relaxed">
            Online calls, live events, and behind-the-scenes moments from across the ALANA community.
          </p>
        </div>
        <div
          className="flex w-full max-w-full flex-row gap-5 overflow-x-auto overscroll-x-contain pt-10 pb-16 scroll-inset-l pr-8 md:pr-16"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(220,194,254,0.3) transparent' }}
        >
          {shuffledPhotoIndices.map((photoIdx, i) => (
            <div key={photoIdx} className="flex-shrink-0" style={{ marginTop: [0, 32, 16, 40, 8, 36, 20, 44][i % 8] }}>
              <EventPhotoCard index={photoIdx} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Pull Quote ────────────────────────────────────────────────────── */}
      <section className="w-full py-16 bg-accent">
        <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
          <div className="relative">
            {/* Ghost height lock */}
            <div className="invisible pointer-events-none space-y-6" aria-hidden="true">
              <blockquote className="text-xl md:text-3xl font-medium leading-relaxed italic">
                "{communityQuotes[1].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-px" />
                <span>{communityQuotes[1].name}</span>
                <div className="w-16 h-px" />
              </div>
            </div>
            {/* Active quote */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
              style={{ opacity: quoteVisible ? 1 : 0, transition: 'opacity 600ms ease' }}
            >
              <blockquote className="text-xl md:text-3xl font-medium text-[#262424] leading-relaxed italic">
                "{communityQuotes[quoteIndex].quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-px bg-[#262424] opacity-40" />
                <cite className="text-[#262424] not-italic">
                  <a href={communityQuotes[quoteIndex].href} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                    {communityQuotes[quoteIndex].name}
                  </a>
                </cite>
                <div className="w-16 h-px bg-[#262424] opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Member Directory ──────────────────────────────────────────────── */}
      <section className="w-full bg-background py-20">
        <div className="mx-auto w-full max-w-6xl px-8 md:px-16">
          <h2 className="mb-2">Member Directory</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
            Active and inactive members of the ALANA ecosystem, searchable by name, role, team, or skill.
          </p>

          <div className="mb-8 flex items-stretch">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[4px] border border-foreground px-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" className="text-muted-foreground shrink-0 fill-current">
                <path d="M229.66,218.34l-50.07-50.07a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, role, branch, or skill…"
                className="min-w-0 flex-1 bg-transparent py-3 font-mono text-xs placeholder:text-muted-foreground focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" className="fill-current">
                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div
            className="w-full max-w-full overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
          >
            <div className="flex w-max snap-x snap-mandatory items-stretch gap-4 scroll-inset-l pr-8 pb-4 md:pr-16">
              {visibleMembers.map((member) => (
                <div key={member.name} className="w-[calc(100vw-4rem)] shrink-0 snap-start md:w-[300px]">
                  <MemberCard member={member} />
                </div>
              ))}
              {visibleMemberCount < filteredMembers.length && (
                <Button
                  type="button"
                  onClick={() => setVisibleMemberCount(count => count + 3)}
                  className="h-auto min-h-48 w-[180px] shrink-0 snap-start flex-col rounded-[8px] border border-dashed border-foreground/30 bg-transparent px-6 text-foreground/60 shadow-none hover:border-accent hover:bg-accent/10 hover:text-foreground"
                  aria-label="Show more members"
                >
                  <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-current">
                    <Plus className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs">Show 3 more</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="px-8 py-12 text-center font-mono text-sm text-muted-foreground md:px-16">No members match your search.</p>
        )}
      </section>

      {/* ── Community Stories ─────────────────────────────────────────────── */}
      <section className="w-full py-20" style={{ background: '#DCC2FE' }}>
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="mb-2">Community Stories</h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
                Stories from and about the people who make ALANA what it is. For more articles, check out our{' '}
                <Link to="/blog" className="underline underline-offset-2 hover:text-foreground transition-colors">Blog</Link>.
              </p>
            </div>
          </div>
        </div>

        {blogPosts.length > 0 ? (
          <div
            className="w-full max-w-full overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
          >
            <div className="flex gap-6 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {blogPosts.map(post => (
                <div key={post.slug} style={{ width: '300px', flexShrink: 0 }}>
                  <BlogPostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="w-full max-w-full overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
          >
            <div className="flex gap-6 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="border border-foreground rounded-[8px] overflow-hidden" style={{ width: '300px', flexShrink: 0 }}>
                  <div className="aspect-video bg-muted" />
                  <div className="p-5 space-y-2">
                    <div className="h-2 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Community Resources ───────────────────────────────────────────── */}
      <section className="w-full overflow-x-clip bg-background pt-20 pb-12">
        {/* Section header */}
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-8">
          <h2 className="mb-2">Community Resources</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            Tools built by and for the ALANA ecosystem, plus how we keep ourselves organised day-to-day.
          </p>
        </div>

        {/* How we organize — horizontal scroll strip */}
        <div className="mb-12">
          <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-4">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[18px] font-medium text-foreground whitespace-nowrap">How we work</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>
          </div>
          <div
            className="w-full max-w-full overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(220,194,254,0.4) transparent' }}
          >
            <div className="flex gap-2 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {resolvedStack.map(tool => (
                <a
                  key={tool.name}
                  href={tool.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3.5 py-2 border border-foreground/20 rounded-[4px] hover:border-foreground transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-mono text-xs text-foreground">{tool.name}</span>
                  <span className="font-mono text-xs text-foreground" aria-hidden="true">|</span>
                  <span className="font-mono text-[10px] text-muted-foreground capitalize">{tool.note}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 1 — Built by ALANA */}
        <div className="mb-10">
          <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[18px] font-medium text-foreground">Built by ALANA</span>
              <span className="font-mono text-xs text-muted-foreground text-[#262424b3] opacity-70">Official tools from the project</span>
            </div>
          </div>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(220,194,254,0.4) transparent' }}>
            <div className="flex gap-4 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {resolvedAlanaTools.map(tool => (
                <div
                  key={tool.name}
                  className="group border border-foreground rounded-[8px] overflow-hidden flex flex-col bg-background"
                  style={{ width: '280px', flexShrink: 0 }}
                >
                  {(tool as typeof tool & { imageUrl?: string; image_url?: string }).imageUrl || (tool as typeof tool & { imageUrl?: string; image_url?: string }).image_url ? (
                    <img
                      src={(tool as typeof tool & { imageUrl?: string; image_url?: string }).imageUrl || (tool as typeof tool & { imageUrl?: string; image_url?: string }).image_url}
                      alt={tool.name}
                      className="w-full object-cover block"
                      style={{ height: '140px' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full bg-accent/20 flex items-center justify-center" style={{ height: '140px' }}>
                      <div className="text-center">
                        <div className="font-mono font-bold text-5xl text-accent/30 select-none leading-none">
                          {tool.name.split(' ').map((w: string) => w[0]).join('')}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/20 mt-1">alana tool</div>
                      </div>
                    </div>
                  )}
                  <div className="w-full h-px bg-foreground" />
                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    <span className="font-mono text-sm font-medium leading-snug">{tool.name}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
                    {tool.url && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-foreground group-hover:text-accent transition-colors mt-1"
                      >
                        VISIT
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {/* Coming soon placeholder */}
              <div
                className="border border-foreground/20 rounded-[8px] overflow-hidden flex flex-col bg-background opacity-50"
                style={{ width: '280px', flexShrink: 0 }}
              >
                <div className="w-full bg-muted/30 flex items-center justify-center" style={{ height: '140px' }}>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/20">more coming</div>
                </div>
                <div className="w-full h-px bg-foreground/20" />
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <span className="font-mono text-sm font-medium text-foreground/30">More tools soon</span>
                  <p className="text-xs text-muted-foreground/50 leading-relaxed">Additional ALANA-built tools are in development.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — Built by community */}
        <div>
          <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[18px] font-medium text-foreground">Built by our community</span>
              <span className="font-mono text-xs text-muted-foreground opacity-70">Tools members have independently created</span>
            </div>
          </div>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(220,194,254,0.4) transparent' }}>
            <div className="flex gap-4 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {resolvedCommunityTools.map(tool => {
                return (
                  <div
                    key={tool.name}
                    className="group border border-foreground rounded-[8px] overflow-hidden flex flex-col bg-background"
                    style={{ width: '280px', flexShrink: 0 }}
                  >
                    {(tool as typeof tool & { imageUrl?: string; image_url?: string }).imageUrl || (tool as typeof tool & { imageUrl?: string; image_url?: string }).image_url ? (
                      <img
                        src={(tool as typeof tool & { imageUrl?: string; image_url?: string }).imageUrl || (tool as typeof tool & { imageUrl?: string; image_url?: string }).image_url}
                        alt={tool.name}
                        className="w-full object-cover block"
                        style={{ height: '140px' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full bg-accent/10 flex items-center justify-center" style={{ height: '140px' }}>
                        <div className="text-center">
                          <div className="font-mono font-bold text-5xl text-accent/25 select-none leading-none">
                            {tool.name.split(' ').map((w: string) => w[0]).join('')}
                          </div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/20 mt-1">community build</div>
                        </div>
                      </div>
                    )}
                    <div className="w-full h-px bg-foreground" />
                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                      <span className="font-mono text-sm font-medium leading-snug">{tool.name}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{tool.description}</p>
                      <div className="flex items-center gap-2 pt-2 mt-3 border-t border-foreground/10">
                        {tool.author_url ? (
                          <a
                            href={tool.author_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-muted-foreground group-hover:text-accent transition-colors truncate"
                          >
                            {tool.author}
                          </a>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground group-hover:text-accent transition-colors truncate">{tool.author}</span>
                        )}
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-foreground group-hover:text-accent transition-colors ml-auto shrink-0"
                          >
                            VISIT
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Submit your tool CTA */}
              <a
                href={siteConfig.socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-dashed border-foreground/30 rounded-[8px] overflow-hidden hover:border-accent transition-colors flex flex-col items-center justify-center bg-transparent text-center p-6 gap-3"
                style={{ width: '280px', flexShrink: 0, minHeight: '220px' }}
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-foreground/30 group-hover:border-accent flex items-center justify-center transition-colors">
                  <span className="text-foreground/40 group-hover:text-accent text-lg leading-none transition-colors">+</span>
                </div>
                <div>
                  <p className="font-mono text-xs font-medium text-foreground/50 group-hover:text-foreground transition-colors">Share your tool</p>
                  <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Built something for creators? Let us know on Telegram.</p>
                </div>
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ── Telegram CTA ──────────────────────────────────────────────────── */}
      <section className="w-full mb-0">
        <div className="relative w-full min-h-[35vh] overflow-hidden group" style={{ background: '#DCC2FE' }}>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${optimizedImageUrl('https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeido2glqw574c5kxquhgythghbnchqibzbvvr6exxshlfve5ldsnd4', 1920)})`,
              mixBlendMode: 'luminosity',
            opacity: 0.6,
            }}
          />

          {/* Content */}
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
  );
}
