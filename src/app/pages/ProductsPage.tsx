import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { Seo } from '../components/Seo';
import alanaBoutiqueImage from '../../assets/products/alana-boutique.webp';
import alanaWorldImage from '../../assets/products/alana-world.webp';

function ProductVideo({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      void video.play().catch(() => {
        // Muted playback can still be blocked by browser or device policies.
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  );
}

const slides = [
  {
    num: '01',
    brand: 'ALANAmagazine',
    title: 'ALANAmagazine',
    tagline: 'Where Tech, Culture & Lifestyle Collide.',
    subtitle:
      'At ALANAmagazine™, we explore how novel technologies are reshaping creativity, culture, and the way we live.',
    mediaType: 'video' as const,
    mediaSrc:
      'https://res.cloudinary.com/uglymolluska/video/upload/v1739356701/alana-mag/EARTHEdition_optimised_x0l7p2.mp4',
    specs: [
      { label: 'Type', value: 'Phygital Magazine' },
      { label: 'Frequency', value: 'Collectible' },
      { label: 'Status', value: 'Launched' },
    ],
    cta: { label: 'Visit Website', href: 'https://alanamagazine.xyz/', external: true },
  },
  {
    num: '02',
    brand: 'ALANAboutique',
    title: 'ALANAboutique',
    tagline: 'Where Digital Craft Finds Its Shelf.',
    subtitle:
      'At ALANAboutique™, we give creators a place to mint, license, and sell their digital work on their own terms — and take it anywhere.',
    mediaType: 'image' as const,
    mediaSrc: alanaBoutiqueImage,
    specs: [
      { label: 'Type', value: 'Immersive Marketplace' },
      { label: 'Frequency', value: 'Ongoing' },
      { label: 'Status', value: 'Launch Expected 2027' },
    ],
    cta: { label: 'Coming Soon', href: null, external: false },
  },
  {
    num: '03',
    brand: 'FABAstudio',
    title: 'FABAstudio',
    tagline: 'Where Creative Tools Stop Owning You.',
    subtitle:
      'At FABAstudio™, we bring the best open-source creative tools into one canvas that works the way you want to work.',
    mediaType: 'image' as const,
    mediaSrc:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1600&q=85',
    specs: [
      { label: 'Type', value: 'Creative HUB' },
      { label: 'Frequency', value: 'Ongoing' },
      { label: 'Status', value: 'Launch Expected 2027' },
    ],
    cta: { label: 'Coming Soon', href: null, external: false },
  },
  {
    num: '04',
    brand: 'ALANAworld',
    title: 'ALANAworld',
    tagline: 'Where Stories Become Worlds.',
    subtitle:
      'At ALANAworld™, players follow ALANA through an action-adventure story that explores techno-philosophical ideas, alternative uses of novel technologies, and how to navigate them safely.',
    mediaType: 'image' as const,
    mediaSrc: alanaWorldImage,
    specs: [
      { label: 'Type', value: 'Action Adventure Game' },
      { label: 'Frequency', value: 'Ongoing' },
      { label: 'Status', value: 'Planning Stage' },
    ],
    cta: { label: 'Coming Soon', href: null, external: false },
  },
];

export function ProductsPage() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateViewport = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        setActiveIndex(i => (i + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex(i => (i - 1 + slides.length) % slides.length);
      } else if (e.key === 'Escape') {
        setActiveIndex(-1);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function toggle(i: number) {
    setActiveIndex(prev => (prev === i ? -1 : i));
  }

  return (
    <>
      <Seo
        title="Products"
        description="The tools and platforms that make up The ALANA Project ecosystem — ALANAmagazine, ALANAboutique, FABAstudio, and ALANAworld."
        path="/products"
      />

      {isDesktop ? (
        /* ── Desktop accordion ────────────────────────────────────────────── */
        <div
          className="flex"
          style={{ height: 'calc(100vh - 73px)', background: '#262424' }}
        >
        {slides.map((slide, i) => {
          const isActive = activeIndex === i;
          const isAny = activeIndex !== -1;

          return (
            <motion.div
              key={slide.num}
              onClick={() => toggle(i)}
              className="relative overflow-hidden cursor-pointer group"
              initial={false}
              animate={{ flexGrow: isActive ? 5 : 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 320, damping: 34, mass: 0.7 }
              }
              style={{
                flexBasis: 0,
                flexShrink: 1,
              }}
            >
              {/* Background media */}
              <div className="absolute inset-0">
                {slide.mediaType === 'video' ? (
                  <ProductVideo src={slide.mediaSrc} isActive={isActive} />
                ) : (
                  <img
                    src={slide.mediaSrc}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* A composited dimmer avoids repainting full-screen media filters during resize. */}
              <div
                className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 motion-reduce:duration-0 ${
                  isActive
                    ? 'opacity-45'
                    : isAny
                      ? 'opacity-70'
                      : 'opacity-60 group-hover:opacity-50'
                }`}
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Toggle indicator */}
              <div
                className="absolute z-10 flex items-center justify-center w-8 h-8 border rounded-full transition-all duration-200 motion-reduce:duration-0"
                style={{
                  borderColor: '#DCC2FE',
                  top: '1.5rem',
                  right: '1.5rem',
                  color: '#DCC2FE',
                }}
              >
                {isActive ? <Minus size={15} strokeWidth={1.75} /> : <Plus size={15} strokeWidth={1.75} />}
              </div>

              {/* Collapsed label */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                initial={false}
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span
                  className="font-mono text-sm font-medium select-none"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    color: '#DCC2FE',
                    letterSpacing: '0.1em',
                  }}
                >
                  {slide.num}
                </span>
                <span
                  className="font-mono text-xs select-none"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.15em',
                  }}
                >
                  {slide.brand}
                </span>
              </motion.div>

              {/* Expanded content */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-10"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 12 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
              >
                {/* Slide number + brand */}
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="font-mono text-5xl font-medium leading-none" style={{ color: '#DCC2FE' }}>
                    {slide.num}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {slide.brand}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-mono mb-4" style={{ color: '#DCC2FE' }}>
                  {slide.title}
                </h2>

                {/* Tagline */}
                {slide.tagline && (
                  <p className="font-sans text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>
                    {slide.tagline}
                  </p>
                )}

                {/* Subtitle */}
                <p
                  className="font-sans text-sm leading-relaxed mb-6 max-w-md"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  {slide.subtitle}
                </p>

                {/* Specs */}
                <div className="flex flex-col gap-1.5 mb-8">
                  {slide.specs.map(spec => (
                    <div
                      key={spec.label}
                      className="flex items-center gap-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest w-24 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {spec.label}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {slide.cta.href ? (
                  <a
                    href={slide.cta.href}
                    target={slide.cta.external ? '_blank' : '_self'}
                    rel={slide.cta.external ? 'noopener noreferrer' : undefined}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex h-11 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
                  >
                    {slide.cta.label}
                  </a>
                ) : (
                  <span
                    className="inline-flex h-11 cursor-default items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] opacity-50 shadow-lg backdrop-blur-sm"
                  >
                    {slide.cta.label}
                  </span>
                )}
              </motion.div>
            </motion.div>
          );
        })}
        </div>
      ) : (
        /* ── Mobile stacked layout ────────────────────────────────────────── */
        <div style={{ background: '#262424' }}>
        {slides.map((slide, i) => {
          const isActive = activeIndex === i;
          return (
            <div key={slide.num} className="relative min-h-20 overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0">
                {slide.mediaType === 'video' ? (
                  <ProductVideo src={slide.mediaSrc} isActive={isActive} />
                ) : (
                  <img src={slide.mediaSrc} alt={slide.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div
                className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 motion-reduce:duration-0 ${
                  isActive ? 'opacity-45' : 'opacity-70'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Header row — always visible */}
              <div
                className="relative flex items-center justify-between px-6 cursor-pointer"
                style={{ height: '80px' }}
                onClick={() => toggle(i)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-medium" style={{ color: '#DCC2FE' }}>{slide.num}</span>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>{slide.brand}</span>
                </div>
                <div className="flex items-center justify-center w-7 h-7 border rounded-full" style={{ borderColor: '#DCC2FE', color: '#DCC2FE' }}>
                  {isActive ? <Minus size={14} strokeWidth={1.75} /> : <Plus size={14} strokeWidth={1.75} />}
                </div>
              </div>

              {/* Expanded content */}
              <motion.div
                className="relative overflow-hidden"
                initial={false}
                animate={{
                  height: isActive ? 'auto' : 0,
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 12,
                }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        height: { duration: 0.28, ease: [0.2, 0, 0, 1] },
                        opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                        y: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      }
                }
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
              >
                <div className="px-6 pb-10">
                  <h2 className="font-mono mb-3" style={{ color: '#DCC2FE' }}>{slide.title}</h2>
                  {slide.tagline && (
                    <p className="font-sans text-base font-medium mb-2" style={{ color: 'rgba(255,255,255,0.92)' }}>
                      {slide.tagline}
                    </p>
                  )}
                  <p className="font-sans text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.75)' }}>{slide.subtitle}</p>
                  <div className="flex flex-col gap-1.5 mb-6">
                    {slide.specs.map(spec => (
                      <div key={spec.label} className="flex items-center gap-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest w-24 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{spec.label}</span>
                        <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  {slide.cta.href ? (
                    <a
                      href={slide.cta.href}
                      target={slide.cta.external ? '_blank' : '_self'}
                      rel={slide.cta.external ? 'noopener noreferrer' : undefined}
                      className="inline-flex h-11 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
                    >
                      {slide.cta.label}
                    </a>
                  ) : (
                    <span className="inline-flex h-11 cursor-default items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] opacity-50 shadow-lg backdrop-blur-sm">
                      {slide.cta.label}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
        </div>
      )}
    </>
  );
}
