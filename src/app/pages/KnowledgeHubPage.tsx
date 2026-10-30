import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CaretDoubleDown, X } from '@phosphor-icons/react';
import { fetchHubWebinars, fetchHubOnboarding, type HubWebinar, type HubOnboardingItem } from '../services/communityAdminService';
import { LearnerQuiz } from '../components/LearnerQuiz';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Seo } from '../components/Seo';
import { Footer } from '../components/Footer';
import { HeroScrambleHeading } from '../components/HeroScrambleHeading';
import { siteConfig } from '../config/site';
import { Button } from '../components/ui/button';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { optimizedImageSrcSet, optimizedImageUrl } from '../utils/image';

// ── Shaders ───────────────────────────────────────────────────────────────────
const AdvancedLensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAberration: { value: 0.004 },
    uDistortion: { value: 0.12 },
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAberration; uniform float uDistortion; varying vec2 vUv;
    vec2 distort(vec2 uv, float k) { vec2 c = uv - 0.5; float r2 = dot(c,c); float f = 1.0 + r2*(k+k*sqrt(r2)); return f*c+0.5; }
    void main() {
      vec2 rUv = distort(vUv, uDistortion-uAberration); vec2 gUv = distort(vUv, uDistortion); vec2 bUv = distort(vUv, uDistortion+uAberration);
      float r = texture2D(tDiffuse, rUv).r; float g = texture2D(tDiffuse, gUv).g; float b = texture2D(tDiffuse, bUv).b;
      float mask = 1.0;
      if (rUv.x<0.0||rUv.x>1.0||rUv.y<0.0||rUv.y>1.0) mask=0.0;
      if (bUv.x<0.0||bUv.x>1.0||bUv.y<0.0||bUv.y>1.0) mask=0.0;
      gl_FragColor = vec4(r,g,b,1.0)*mask;
    }`,
};

// ── HUD block ─────────────────────────────────────────────────────────────────
function HudBlock({ label, rows, align }: {
  label: string;
  rows: [string, string][];
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';
  return (
    <div className={`flex flex-col gap-1 ${isRight ? 'items-end' : 'items-start'}`}>
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] mb-0.5" style={{ color: 'rgba(243,243,243,0.3)' }}>
        {label}
      </p>
      <div className="w-16 h-px mb-1" style={{ background: 'rgba(220,194,254,0.2)' }} />
      {rows.map(([key, val]) => (
        <div key={key} className={`flex gap-3 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(243,243,243,0.22)' }}>{key}</span>
          <span className="font-mono text-[9px]" style={{ color: 'rgba(243,243,243,0.55)' }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

const A_NAMES = new Set(['ALANA001', 'ALANA002', 'ALANA003', 'ALANA004', 'ALANA005']);
const KNOWLEDGE_MODEL_URL = `${import.meta.env.BASE_URL}models/knowledge-hub.glb`;
const ONBOARDING_QUIZZES = [
  {
    id: 'web3',
    number: '01',
    title: 'Web3 Essentials',
    description: 'Explore Web3 foundations, digital ownership, wallets, blockchain, and decentralized applications.',
    badgeImage: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeievvwtucf3uhaywhizyqqeg2pxcdzz2kfox5n2glyz6mtr6da2kym',
    mintUrl: 'https://app.unlock-protocol.com/checkout?id=0f870453-7a99-493b-ad61-97b04238ab0c',
    available: true,
  },
  {
    id: 'cybersecurity',
    number: '02',
    title: 'Cybersecurity Essentials',
    description: 'Build practical habits for protecting your identity, accounts, devices, and digital assets.',
    badgeImage: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeieqaqwbzo5z6ykqtjwd5bdcjfgipkv5pzvvseqgywyo6sr3dczioe',
    mintUrl: 'https://app.unlock-protocol.com/checkout?id=e031b0bf-17b5-489a-aa55-5499036c61e4',
    available: true,
  },
  {
    id: 'ai',
    number: '03',
    title: 'AI Tech Essentials',
    description: 'Learn how artificial intelligence works, where it creates value, and how to use it responsibly.',
    badgeImage: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeifki7xtenjii6mfrluuli6e5skum2okqp7cgmjkz74kup3zodut3y',
    mintUrl: 'https://app.unlock-protocol.com/checkout?id=2757ca19-06b7-455e-9419-48ab740254bb',
    available: true,
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────
const ALL_TOOLS = [
  { id: 'metamask',    name: 'MetaMask',        category: 'Hot Wallet',       url: 'https://metamask.io/',                      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',                                        description: 'Your gateway to blockchain apps. A crypto wallet & gateway to the Web3 world.' },
  { id: 'burner',      name: 'Burner Wallet',   category: 'Hardware Wallet',  url: 'https://burner.pro/',                       logo: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreigbnmyzwdz72yvz4yiyullesdas7moalk6wjimtirqtk6ysaupuge',  description: 'The most accessible and affordable hardware wallet. Secure your crypto with ease.' },
  { id: 'rabby',       name: 'Rabby Wallet',    category: 'Hot Wallet',       url: 'https://rabby.io/',                         logo: 'https://rabby.io/assets/images/logo-128.png',                                                                 description: 'Better wallet for DeFi users with multi-chain support and security features.' },
  { id: 'safe',        name: 'Safe',            category: 'Multi-Sig Wallet', url: 'https://safe.global/',                      logo: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreifpe3ww6d2y6cngyhxmjybyy4pmdde7ylcrmcryt3i4bqkrhveg4e',  description: 'Multi-signature smart wallet for managing digital assets with enhanced security.' },
  { id: 'unlock',      name: 'Unlock Protocol', category: 'Membership',       url: 'https://unlock-protocol.com/',              logo: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreiheiiy2rh77snnejbqpw5rjav66ieaajmcxdvwgnvobai5etaayiy',  description: 'Create memberships, subscriptions, and time-based access using NFTs.' },
  { id: 'paragraph',   name: 'Paragraph',       category: 'Publishing',       url: 'https://paragraph.xyz/',                    logo: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreihowktmn2cgp5rgxon7s5gqr6xte5ptxxt3sco6mkp3kot6rpbflu',  description: 'A Web3-native newsletter platform for creators to own their audience.' },
  { id: 'ens',         name: 'ENS',             category: 'Identity',         url: 'https://ens.domains/',                      logo: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreieie346uslq6ddpg2mo6z7qwx4fpt4okq7lotw3vaqwt7gnfnp5na',  description: 'Ethereum Name Service — your Web3 username and decentralized identity.' },
  { id: 'lens',        name: 'Lens Protocol',   category: 'Social Media',     url: 'https://lens.xyz/',                         logo: 'https://static.chainbroker.io/mediafiles/projects/lens-protocol/lens.jpeg',                                   description: 'Own your social graph and content across decentralized social applications.' },
  { id: 'farcaster',   name: 'Farcaster',       category: 'Social Network',   url: 'https://www.farcaster.xyz/',                logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2T0kilyhZkFCl0Jmti2qdV8rZ73SAjTCNTw&s',             description: 'Decentralized social network where you own your content and connections.' },
  { id: 'photocraft',  name: 'PhotoCraft',      category: 'Image Editor',     url: 'https://getartcraft.com/apps/photocraft',   logo: 'https://getartcraft.com/images/apps/photocraft/icon.webp',                                                    description: 'The open-source image editor you already know how to use.' },
  { id: 'vectorcraft', name: 'VectorCraft',     category: 'Vector Design',    url: 'https://getartcraft.com/apps/vectorcraft',  logo: 'https://getartcraft.com/images/apps/vectorcraft/icon.webp',                                                   description: 'Fast, open-source vector illustration, reimagined in pure Rust.' },
  { id: 'filmcraft',   name: 'FilmCraft',       category: 'Video Editing',    url: 'https://getartcraft.com/apps/filmcraft',    logo: 'https://getartcraft.com/images/apps/filmcraft/icon.webp',                                                     description: 'Professional, open-source video editing, rebuilt from scratch in Rust.' },
  { id: 'lightcraft',  name: 'LightCraft',      category: 'Photo Library',    url: 'https://getartcraft.com/apps/lightcraft',   logo: 'https://getartcraft.com/images/apps/lightcraft/icon.webp',                                                    description: 'An open-source photo library and raw developer that runs on your machine.' },
  { id: 'pdfcraft',    name: 'PdfCraft',        category: 'PDF Workbench',    url: 'https://getartcraft.com/apps/pdfcraft',     logo: 'https://getartcraft.com/images/apps/pdfcraft/icon.webp',                                                      description: 'Read, organize, combine, split and secure — the open-source PDF workbench.' },
  { id: 'effectcraft', name: 'EffectCraft',     category: 'Motion Graphics',  url: 'https://getartcraft.com/apps/effectcraft',  logo: 'https://getartcraft.com/images/apps/effectcraft/icon.webp',                                                   description: 'Open-source motion graphics and visual effects, built in pure Rust.' },
  { id: 'designcraft', name: 'DesignCraft',     category: 'Page Layout',      url: 'https://getartcraft.com/apps/designcraft',  logo: 'https://getartcraft.com/images/apps/designcraft/icon.webp',                                                   description: 'Open-source page layout and publishing, rebuilt in pure Rust.' },
];

export function KnowledgeHubPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [webinars, setWebinars] = useState<HubWebinar[]>([]);
  const [onboarding, setOnboarding] = useState<HubOnboardingItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const {
    shouldReduceMotion,
    revealDescription,
    revealActions,
    descriptionVisible,
    actionsVisible,
    transition: heroRevealTransition,
  } = useHeroIntroSequence();
  const activeQuiz = ONBOARDING_QUIZZES.find(quiz => quiz.id === activeQuizId);
  const shuffledTools = useMemo(() => {
    const arr = [...ALL_TOOLS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  const isPlayingRef = useRef(true);

  function togglePlay() {
    const next = !isPlayingRef.current;
    isPlayingRef.current = next;
    setIsPlaying(next);
  }

  useEffect(() => {
    fetchHubWebinars().then(({ data }) => setWebinars(data.filter(w => w.active)));
    fetchHubOnboarding().then(({ data }) => setOnboarding(data.filter(o => o.active)));
  }, []);

  useEffect(() => {
    if (!activeQuizId) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveQuizId(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeQuizId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.022);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const purpleKey = new THREE.PointLight(0xdcc2fe, 2, 30);
    purpleKey.position.set(3, 4, 5);
    scene.add(purpleKey);
    const rimLight = new THREE.PointLight(0xffffff, 0.6, 20);
    rimLight.position.set(-4, -2, -4);
    scene.add(rimLight);

    // GLB model
    let modelRef: THREE.Group | null = null;
    let mixerRef: THREE.AnimationMixer | null = null;
    const loader = new GLTFLoader();
    loader.load(
      KNOWLEDGE_MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const targetSize = container.clientWidth < 768 ? 4.6 : 5.5;
        const scale = targetSize / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.sub(centre.multiplyScalar(scale));
        model.rotation.x = Math.PI / 4;
        scene.add(model);
        modelRef = model;
        if (gltf.animations.length > 0) {
          mixerRef = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixerRef!.clipAction(clip).play());
        }
      },
      undefined,
      (err) => console.error('GLB load failed:', err),
    );

    // Background particles
    const pCount = 4000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 2.5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.5;
      pPos[i*3]   = r * Math.cos(theta);
      pPos[i*3+1] = r * Math.sin(phi);
      pPos[i*3+2] = r * Math.sin(theta);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0xdcc2fe, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Two-pass selective bloom ──────────────────────────────────────────────
    // modelBloom:    particles hidden → model blooms at radius 0.45
    // particleBloom: meshes darkened  → particles bloom at radius 0.65
    // finalComposer: full scene + both bloom textures mixed additively

    const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const savedMats = new Map<string, THREE.Material | THREE.Material[]>();

    function darkenMeshes() {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) { savedMats.set(obj.uuid, obj.material); obj.material = darkMaterial; }
      });
    }
    function darkenAMeshes() {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && A_NAMES.has(obj.name)) { savedMats.set(obj.uuid, obj.material); obj.material = darkMaterial; }
      });
    }
    function darkenNonAMeshes() {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && !A_NAMES.has(obj.name)) { savedMats.set(obj.uuid, obj.material); obj.material = darkMaterial; }
      });
    }
    function restoreMeshes() {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && savedMats.has(obj.uuid)) obj.material = savedMats.get(obj.uuid)!;
      });
      savedMats.clear();
    }

    const w = container.clientWidth, h = container.clientHeight;
    const vec2 = new THREE.Vector2(w, h);

    const modelBloomComposer = new EffectComposer(renderer);
    modelBloomComposer.renderToScreen = false;
    modelBloomComposer.addPass(new RenderPass(scene, camera));
    const modelBloomPass = new UnrealBloomPass(vec2, 1.5, 0.4, 0.85);
    modelBloomPass.threshold = 0.0; modelBloomPass.strength = 0.3; modelBloomPass.radius = 0.25;
    modelBloomComposer.addPass(modelBloomPass);

    const particleBloomComposer = new EffectComposer(renderer);
    particleBloomComposer.renderToScreen = false;
    particleBloomComposer.addPass(new RenderPass(scene, camera));
    const particleBloomPass = new UnrealBloomPass(vec2, 1.5, 0.4, 0.85);
    particleBloomPass.threshold = 0.0; particleBloomPass.strength = 1.0; particleBloomPass.radius = 0.6;
    particleBloomComposer.addPass(particleBloomPass);

    // A-mesh bloom — tight radius, low strength, visually dim
    const aBloomComposer = new EffectComposer(renderer);
    aBloomComposer.renderToScreen = false;
    aBloomComposer.addPass(new RenderPass(scene, camera));
    const aBloomPass = new UnrealBloomPass(vec2, 1.5, 0.4, 0.85);
    aBloomPass.threshold = 0.0; aBloomPass.strength = 0.12; aBloomPass.radius = 0.02;
    aBloomComposer.addPass(aBloomPass);

    const mixMaterial = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture:          { value: null },
        modelBloomTexture:    { value: modelBloomComposer.renderTarget2.texture },
        particleBloomTexture: { value: particleBloomComposer.renderTarget2.texture },
        aBloomTexture:        { value: aBloomComposer.renderTarget2.texture },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D modelBloomTexture;
        uniform sampler2D particleBloomTexture;
        uniform sampler2D aBloomTexture;
        varying vec2 vUv;
        void main(){
          vec4 base = texture2D(baseTexture, vUv);
          vec3 bloom = texture2D(modelBloomTexture, vUv).rgb
                     + texture2D(particleBloomTexture, vUv).rgb
                     + texture2D(aBloomTexture, vUv).rgb;
          gl_FragColor = vec4(base.rgb + bloom, base.a);
        }
      `,
    });

    const lensMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse:     { value: null },
        uAberration:  { value: 0.004 },
        uDistortion:  { value: 0.12 },
      },
      vertexShader: AdvancedLensShader.vertexShader,
      fragmentShader: AdvancedLensShader.fragmentShader,
    });

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(new RenderPass(scene, camera));
    finalComposer.addPass(new ShaderPass(mixMaterial, 'baseTexture'));
    finalComposer.addPass(new FilmPass(0.4, false));
    finalComposer.addPass(new ShaderPass(lensMaterial));

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const timer = new THREE.Timer();
    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!isPlayingRef.current) return;
      timer.update();
      const t = timer.getElapsed();
      const delta = timer.getDelta();
      if (mixerRef) mixerRef.update(delta);
      if (modelRef) {
        modelRef.rotation.y = t * 0.15;
        modelRef.rotation.x = Math.PI / 4 + Math.sin(t * 0.3) * 0.05;
      }
      particles.rotation.y = -t * 0.07;
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      // Model bloom — hide particles, darken A meshes, render rest
      particles.visible = false;
      darkenAMeshes();
      modelBloomComposer.render();
      restoreMeshes();
      particles.visible = true;
      // A bloom — hide particles, darken non-A meshes, render A's only
      particles.visible = false;
      darkenNonAMeshes();
      aBloomComposer.render();
      restoreMeshes();
      particles.visible = true;
      // Particle bloom — darken all meshes, render particles only
      darkenMeshes();
      particleBloomComposer.render();
      restoreMeshes();
      // Final — full scene + all three bloom textures
      finalComposer.render();
    }

    const startTimeout = setTimeout(() => animate(), 500);

    // Auto-pause when hero scrolls out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        isPlayingRef.current = visible;
        setIsPlaying(visible);
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      modelBloomComposer.setSize(container.clientWidth, container.clientHeight);
      particleBloomComposer.setSize(container.clientWidth, container.clientHeight);
      aBloomComposer.setSize(container.clientWidth, container.clientHeight);
      finalComposer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <Seo
        title="Knowledge HUB"
        description="Everything you need to understand, participate in, and build on The ALANA Project ecosystem."
        path="/knowledge-hub"
      />

      {/* Hero — full-height black section, scrolls naturally */}
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: 'calc(100vh - 60px)', background: '#000' }}>
        <div ref={mountRef} className="absolute inset-0" />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, transparent 36%, rgba(0,0,0,0.85) 110%)' }}
        />

        {/* Left-aligned HUD — shares the header container so it lines up with the logo */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-between px-8 pb-10 pt-10 md:px-16">
          {/* Title — upper left */}
          <div className="flex flex-col items-start gap-2 pointer-events-none select-none">
            <HeroScrambleHeading
              className="m-0 font-sans text-2xl font-medium leading-normal text-background"
              onComplete={revealDescription}
            >
              Knowledge HUB
            </HeroScrambleHeading>
            <motion.span
              className="block font-sans text-[20px] uppercase tracking-widest mt-1"
              style={{ color: 'rgba(243,243,243,0.55)' }}
              initial={{ y: shouldReduceMotion ? 0 : -24, opacity: 0 }}
              animate={{
                y: descriptionVisible || shouldReduceMotion ? 0 : -24,
                opacity: descriptionVisible || shouldReduceMotion ? 1 : 0,
              }}
              transition={heroRevealTransition}
              onAnimationComplete={revealActions}
            >
              LEARN — CREATE — BUILD
            </motion.span>
            <motion.div
              initial={{ y: shouldReduceMotion ? 0 : 24, opacity: 0 }}
              animate={{
                y: actionsVisible || shouldReduceMotion ? 0 : 24,
                opacity: actionsVisible || shouldReduceMotion ? 1 : 0,
              }}
              transition={heroRevealTransition}
            >
              <Button
                onClick={togglePlay}
                title={isPlaying ? 'Pause animation' : 'Resume animation'}
                aria-label={isPlaying ? 'Pause hero animation' : 'Resume hero animation'}
                className="pointer-events-auto mt-2 h-11 w-fit rounded-[4px] border border-white/30 bg-white/5 px-6 font-sans text-sm font-medium text-white backdrop-blur-sm hover:border-accent hover:bg-white/5 hover:text-accent"
              >
                {isPlaying ? (
                  <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor" aria-hidden="true">
                    <rect x="0" y="0" width="3.5" height="11" rx="1" />
                    <rect x="6.5" y="0" width="3.5" height="11" rx="1" />
                  </svg>
                ) : (
                  <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor" aria-hidden="true">
                    <path d="M1 0.5L9.5 5.5L1 10.5V0.5Z" />
                  </svg>
                )}
                {isPlaying ? 'Pause' : 'Resume'}
              </Button>
            </motion.div>
          </div>

          {/* HUD bottom-left */}
          <div className="pointer-events-none select-none">
            <HudBlock align="left" label="PORTS" rows={[
              ['01', 'ALANAarchive'],
              ['02', 'ALANAlab'],
              ['03', 'Earendel Chateau'],
              ['04', 'AltaAgri°XIII'],
              ['05', 'ALANAboutique'],
            ]} />
          </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2"
          animate={shouldReduceMotion ? { opacity: 1 } : { y: [0, 12, 0], opacity: [0.85, 1, 0.85] }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
        >
          <Button
            variant="ghost"
            onClick={() => document.getElementById('knowledge-content')?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })}
            aria-label="Scroll to Knowledge Hub content"
            className="h-16 w-16 rounded-none bg-transparent p-0 text-accent drop-shadow-[0_0_20px_rgba(220,194,254,0.8)] hover:bg-transparent hover:text-white"
          >
            <CaretDoubleDown className="size-16" size={64} weight="regular" aria-hidden="true" />
          </Button>
        </motion.div>
      </div>

      {/* Off-white content sections */}
      <div id="knowledge-content" className="bg-background">
        {/* ── Knowledge Challenges ── */}
        <section className="w-full max-w-6xl mx-auto px-8 md:px-16 py-14">
          <h2 className="mb-3">Knowledge Challenges</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            Test your knowledge of Web3, AI, cybersecurity, open source, creativity, and more. Complete each challenge successfully to earn a blockchain-verified badge.
          </p>

          <div
            className="-mr-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-8 pb-4 md:mr-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pr-0 md:pb-0"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
          >
            {ONBOARDING_QUIZZES.map(quiz => (
              <article
                key={quiz.id}
                className="group flex w-[calc(100%-2rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[8px] border border-foreground bg-background transition-colors hover:border-accent md:w-auto"
              >
                <div className="relative aspect-square w-full overflow-hidden border-b border-foreground bg-foreground">
                  <img
                    src={optimizedImageUrl(quiz.badgeImage, 640)}
                    srcSet={optimizedImageSrcSet(quiz.badgeImage, [320, 480, 640])}
                    sizes="(max-width: 767px) calc(100vw - 4rem), 320px"
                    alt={`${quiz.title} badge`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {!quiz.available && (
                    <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-white backdrop-blur-sm">
                      Coming shortly
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Challenge {quiz.number}
                  </p>
                  <h3 className="mb-3 font-sans text-xl font-medium leading-tight">{quiz.title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{quiz.description}</p>
                  <Button
                    onClick={() => setActiveQuizId(quiz.id)}
                    className="h-11 w-full rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
                  >
                    Start Now
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {onboarding.length > 0 && (
            <div className="mt-16">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Additional Resources</p>
              <ol className="space-y-4">
                {onboarding.map((o, i) => (
                  <li key={o.id} className="border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-5 flex gap-5 items-start">
                    <span className="font-mono text-2xl font-medium text-accent/60 shrink-0 leading-none mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium">{o.title}</p>
                      {o.description && <p className="text-xs text-muted-foreground leading-relaxed mt-1">{o.description}</p>}
                      {o.url && (
                        <a href={o.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-foreground hover:text-accent transition-colors mt-2 inline-block">
                          GET STARTED →
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* ── Webinars ── */}
        <section className="w-full py-14">
          <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-10">
            <h2 className="mb-3">Webinars</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
              A selection of our most recent community webinars. For all our video content check{' '}
              <a href="https://www.youtube.com/@TheALANAProject" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
                ALANA's YouTube channel
              </a>.
            </p>
          </div>
          {webinars.length > 0 ? (
            <div
              className="overflow-x-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
            >
              <div className="flex gap-6 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
                {webinars.map(w => (
                  <a
                    key={w.id}
                    href={w.url ?? undefined}
                    target={w.url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`group border border-foreground rounded-[8px] overflow-hidden flex flex-col bg-background ${w.url ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{ width: '300px', flexShrink: 0 }}
                  >
                    {w.thumbnail_url ? (
                      <div className="w-full shrink-0">
                        <img src={w.thumbnail_url.replace('hqdefault', 'mqdefault')} alt={w.title} className="w-full h-auto block" loading="lazy" />
                        <div className="w-full h-px bg-foreground" />
                      </div>
                    ) : (
                      <div className="w-full bg-muted flex items-center justify-center shrink-0" style={{ height: '169px' }}>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/20">webinar</span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5 gap-2.5">
                      <h4 className="leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1">{w.title}</h4>
                      {w.description && (
                        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{w.description}…</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl mx-auto px-8 md:px-16">
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
                Live and recorded sessions with the ALANA team, ecosystem partners, and community contributors. Details coming soon.
              </p>
            </div>
          )}
        </section>

        {/* ── Tools That Empower Creators ── */}
        <section className="w-full py-14">
          <div className="w-full max-w-6xl mx-auto px-8 md:px-16 mb-10">
            <h2 className="mb-3">Tools That Empower Creators</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
              Web3 tools and open-source creative apps to create, manage, and grow your digital presence.{' '}
              <a
                href="mailto:contact@the-alana-project.xyz?subject=Tool%20Suggestion%20for%20ALANA%20Knowledge%20Hub"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Have a tool we should add?
              </a>
            </p>
          </div>
          <div
            className="overflow-x-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,36,36,0.2) transparent' }}
          >
            <div className="flex gap-5 scroll-inset-l pr-8 md:pr-16" style={{ width: 'max-content', paddingBottom: '16px' }}>
              {shuffledTools.map(tool => (
                <a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-foreground rounded-[8px] overflow-hidden flex flex-col bg-background cursor-pointer"
                  style={{ width: '240px', flexShrink: 0 }}
                >
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-8 h-8 object-contain rounded-[4px] shrink-0"
                        loading="lazy"
                      />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground border border-foreground/20 px-1.5 py-0.5 shrink-0">
                        {tool.category}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm group-hover:text-accent transition-colors mb-1">{tool.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-foreground/10" />
                  <div className="px-5 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                      Visit
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>




      </div>

      {/* ── Telegram CTA ──────────────────────────────────────────────────── */}
      <section className="w-full mt-12 mb-0">
        <div className="relative w-full min-h-[35vh] overflow-hidden group" style={{ background: '#DCC2FE' }}>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${optimizedImageUrl('https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeido2glqw574c5kxquhgythghbnchqibzbvvr6exxshlfve5ldsnd4', 1920)})`,
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

      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="active-quiz-title">
            <motion.div
              className="absolute inset-0 bg-black/35 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              onClick={() => setActiveQuizId(null)}
            />
            <div className="absolute inset-x-0 bottom-0 mx-auto h-[88vh] w-full max-w-6xl px-8 md:px-16">
              <motion.div
                className="flex h-full w-full flex-col overflow-hidden rounded-t-[24px] border border-white/40 bg-[#F3F3F3] shadow-2xl backdrop-blur-2xl"
                initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0.8 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 30 }}
              >
              <div className="flex shrink-0 items-center justify-between gap-6 border-b border-foreground/15 bg-white/10 px-6 py-4 backdrop-blur-xl md:px-10">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Knowledge challenge {activeQuiz.number}
                  </p>
                  <h2 id="active-quiz-title" className="truncate font-sans text-xl font-medium md:text-2xl">
                    {activeQuiz.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveQuizId(null)}
                  aria-label="Close quiz"
                  className="shrink-0 rounded-none border-0 bg-transparent text-foreground hover:bg-transparent hover:text-accent"
                >
                  <X className="size-5" weight="regular" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8 md:px-10">
                {activeQuiz.available ? (
                  <LearnerQuiz
                    key={activeQuiz.id}
                    storageKey={activeQuiz.id}
                    badgeImage={activeQuiz.badgeImage}
                    challengeTitle={activeQuiz.title}
                    mintUrl={activeQuiz.mintUrl}
                  />
                ) : (
                  <div className="flex min-h-full items-center justify-center py-16 text-center">
                    <div className="max-w-lg">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">Coming shortly</p>
                      <h3 className="mb-3 font-sans text-2xl font-medium">{activeQuiz.title} is in development</h3>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        This challenge will be added soon. The tablet is ready for its quiz content when the next question set arrives.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
