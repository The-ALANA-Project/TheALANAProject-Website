import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explainer: string;
  isMultiSelect?: boolean;
}

interface Step {
  id: number;
  label: string;
  questions: QuizQuestion[];
}

const STEPS: Step[] = [
  {
    id: 1,
    label: 'Web3 Basics',
    questions: [
      {
        question: 'What is the main characteristic that makes Web3 different from Web2?',
        options: [
          "It's faster and has better graphics",
          "It's decentralized - no single entity controls or owns it",
          'It only works on mobile devices',
          'It requires special hardware',
        ],
        correctAnswer: "It's decentralized - no single entity controls or owns it",
        explainer:
          "Web3's core innovation is decentralization. Instead of companies like Google or Facebook controlling your data, blockchain technology distributes control across a network, giving you true ownership of your digital assets and identity.",
      },
      {
        question: 'What technology powers Web3?',
        options: [
          'Cloud computing',
          'Blockchain technology (a shared digital record book that everyone can see)',
          'Artificial Intelligence (automated smart contract generation)',
          'Virtual Reality',
        ],
        correctAnswer: 'Blockchain technology (a shared digital record book that everyone can see)',
        explainer:
          "Blockchain is the foundational technology of Web3. It's a distributed ledger that records transactions across many computers, making it nearly impossible to alter records retroactively without consensus from the network.",
      },
      {
        question: "What does 'owning your data' mean in Web3?",
        options: [
          'Companies store your data more securely',
          'You pay monthly fees for data storage',
          'You control access with special digital passwords (cryptographic keys)',
          'Your data is deleted after each session (ephemeral data persistence)',
        ],
        correctAnswer: 'You control access with special digital passwords (cryptographic keys)',
        explainer:
          "In Web3, you use private keys (like digital passwords) to control who can access your information. Unlike Web2 where companies own your data, Web3 puts you in the driver's seat with cryptographic ownership.",
      },
    ],
  },
  {
    id: 2,
    label: 'Wallets & Security',
    questions: [
      {
        question: 'What about your wallet should you NEVER share with anyone?',
        options: [
          'Your public wallet address',
          'Your registered username (ENS) connected to your public wallet address',
          "Your wallet's recovery words or master password (seed phrase/private key)",
          'The email you registered with your wallet',
        ],
        correctAnswer: "Your wallet's recovery words or master password (seed phrase/private key)",
        explainer:
          "Your seed phrase (12-24 words) and private keys are like the master password to your entire digital wealth. Anyone with these can access and steal everything in your wallet. Never share them, not even with 'support' teams!",
      },
      {
        question: 'What is a digital wallet used for?',
        options: [
          'Only to store or reroute physical cash',
          'To store a range of digital assets and interact with Web3 apps (e.g. cryptocurrencies, NFTs & dApps)',
          'To mine (earn) Bitcoin',
          'To create decentralized applications (dApps)',
        ],
        correctAnswer:
          'To store a range of digital assets and interact with Web3 apps (e.g. cryptocurrencies, NFTs & dApps)',
        explainer:
          'A crypto wallet is your gateway to Web3. It stores your cryptocurrencies, NFTs, and enables you to interact with decentralized applications (dApps) by signing transactions with your private keys.',
      },
      {
        question:
          "What's the safest type of wallet to store large amounts of digital money (cryptocurrency) with?",
        options: [
          "A browser extension wallet aka 'hot wallet' (e.g. MetaMask, Rabby, Phantom, etc.)",
          'A wallet account with a centralized exchange (e.g. Coinbase, Binance, etc.)',
          "A hardware wallet or 'cold wallet' that comes as a physical device and is offline (e.g. Trezor, Ledger, Burner.pro, etc.)",
          'A mobile app wallet (e.g. Apple wallet)',
        ],
        correctAnswer:
          "A hardware wallet or 'cold wallet' that comes as a physical device and is offline (e.g. Trezor, Ledger, Burner.pro, etc.)",
        explainer:
          "Hardware wallets are physical devices that store your private keys offline, making them immune to online hacks. For significant holdings, they're the gold standard. Think of them as a personal vault for your digital assets.",
      },
    ],
  },
  {
    id: 3,
    label: 'Cryptocurrency',
    questions: [
      {
        question: 'What type of digital money maintains a stable value?',
        options: [
          'Bitcoin (BTC)',
          'Ethereum (ETH)',
          'Stablecoins (e.g. USDC, DAI, USDGLO, EURC)',
          'Memecoins (e.g. DEGEN, SHIB, PEPE)',
        ],
        correctAnswer: 'Stablecoins (e.g. USDC, DAI, USDGLO, EURC)',
        explainer:
          'Stablecoins are designed to maintain a 1:1 peg with traditional currencies like the US Dollar. They combine the speed and borderless nature of crypto with price stability, making them perfect for payments and as a safe harbor during market volatility.',
      },
      {
        question: 'What was the first digital money (cryptocurrency) ever created?',
        options: ['Ethereum', 'Bitcoin', 'Ripple', 'Dogecoin'],
        correctAnswer: 'Bitcoin',
        explainer:
          'Bitcoin, created by the mysterious Satoshi Nakamoto in 2009, was the first cryptocurrency. It introduced blockchain technology and proved that digital scarcity and peer-to-peer money could work without banks or governments.',
      },
      {
        question: 'What makes Ethereum special compared to Bitcoin?',
        options: [
          "Thanks to its Proof of Stake consensus, Ethereum often offers faster and cheaper transactions than Bitcoin.",
          'It can run programmable agreements and apps (smart contracts & dApps)',
          "It's more valuable as a store of value and has better long-term price appreciation potential",
          'Compared to Bitcoin, Ethereum is more sustainable thanks to its shift to a consensus mechanism that consumes far less energy',
        ],
        correctAnswer: [
          "Thanks to its Proof of Stake consensus, Ethereum often offers faster and cheaper transactions than Bitcoin.",
          'It can run programmable agreements and apps (smart contracts & dApps)',
          'Compared to Bitcoin, Ethereum is more sustainable thanks to its shift to a consensus mechanism that consumes far less energy',
        ],
        isMultiSelect: true,
        explainer:
          "While Bitcoin is primarily digital money, Ethereum is a programmable blockchain. Its smart contract capability allows developers to build complex applications like DeFi platforms, NFT marketplaces, and DAOs — making it the foundation of the Web3 ecosystem. Additionally, Ethereum's shift to Proof of Stake makes it more energy-efficient and often faster than Bitcoin.",
      },
    ],
  },
  {
    id: 4,
    label: 'NFTs & Digital Assets',
    questions: [
      {
        question: 'What does NFT stand for and what can it represent?',
        options: [
          'New Financial Token that only represents digital artwork',
          'Unique Digital Certificate (Non-Fungible Token) that can represent art, music, tickets, certificates, game items, and more',
          'Net File Transfer for gaming items only',
          'Never Forget This - a type of profile picture',
        ],
        correctAnswer:
          'Unique Digital Certificate (Non-Fungible Token) that can represent art, music, tickets, certificates, game items, and more',
        explainer:
          'Non-Fungible means unique and irreplaceable. Unlike cryptocurrencies where 1 Bitcoin equals any other Bitcoin, each NFT is distinct with its own metadata and value. NFTs can tokenize almost anything unique — from concert tickets and real estate deeds to in-game items, art, music, and membership passes.',
      },
      {
        question: 'Which of the following can a crypto wallet hold or manage?',
        options: [
          'Cryptocurrencies (Bitcoin, Ethereum, etc.)',
          'NFTs (Digital certificates of ownership)',
          'FIAT currency (USD, EUR, etc.)',
          'Tokens from decentralized apps',
          'Digital signatures for authentication',
        ],
        correctAnswer: [
          'Cryptocurrencies (Bitcoin, Ethereum, etc.)',
          'NFTs (Digital certificates of ownership)',
          'Tokens from decentralized apps',
          'Digital signatures for authentication',
        ],
        isMultiSelect: true,
        explainer:
          "A crypto wallet can hold cryptocurrencies, NFTs, various tokens from dApps, and manage digital signatures for authentication. However, FIAT currency cannot be stored directly in a crypto wallet — it exists in traditional bank accounts.",
      },
      {
        question: 'Where exactly is the ownership record of your NFTs stored and verified?',
        options: [
          "On the NFT marketplace's private company servers",
          'In your email inbox as a receipt',
          'On the immutable, public blockchain ledger that anyone can verify',
          "On your computer's local hard drive only",
        ],
        correctAnswer: 'On the immutable, public blockchain ledger that anyone can verify',
        explainer:
          'NFT ownership is permanently recorded on the blockchain — a decentralized, public ledger that is immutable and transparent. This means you truly own the asset independent of any platform or marketplace. Even if the website where you bought it goes offline, your ownership record persists on the blockchain forever.',
      },
    ],
  },
  {
    id: 5,
    label: 'DeFi & dApps',
    questions: [
      {
        question: 'What does DeFi stand for?',
        options: ['Digital Finance', 'Decentralized Finance', 'Defined Finance', 'Default Finance'],
        correctAnswer: 'Decentralized Finance',
        explainer:
          'DeFi recreates traditional financial services (lending, borrowing, trading) without banks or intermediaries. Smart contracts automatically execute transactions, making finance more accessible, transparent, and efficient for everyone with an internet connection.',
      },
      {
        question: 'What is a Web3 app (dApp)?',
        options: [
          'A regular mobile app designed for modern smartphones and tablets',
          'An app that runs on shared networks (blockchain) instead of company servers',
          'A desktop program optimized for traditional computer operating systems',
          'A type of cryptocurrency token used for digital transactions',
        ],
        correctAnswer: 'An app that runs on shared networks (blockchain) instead of company servers',
        explainer:
          "dApps are applications where the backend code runs on a decentralized blockchain network rather than centralized servers. This means no single company controls it, there's no single point of failure, and the rules are transparent and enforced by code.",
      },
      {
        question: "What's a key advantage of DeFi over traditional banking?",
        options: [
          'Free service with no transaction fees or operational costs',
          'Guaranteed profits and returns on all investments you make',
          'Always open for anyone, anywhere (24/7 access, no gatekeepers)',
          'No risk involved and complete protection from losses',
        ],
        correctAnswer: 'Always open for anyone, anywhere (24/7 access, no gatekeepers)',
        explainer:
          "DeFi never sleeps! Unlike banks with business hours and regional restrictions, DeFi protocols run 24/7 globally. Anyone with an internet connection can access financial services without needing approval from institutions — truly democratizing finance.",
      },
    ],
  },
];

function isAnswerCorrect(q: QuizQuestion, selected: string[]): boolean {
  if (q.isMultiSelect) {
    const correct = q.correctAnswer as string[];
    return correct.length === selected.length && correct.every(c => selected.includes(c));
  }
  return selected[0] === q.correctAnswer;
}

function getStepScore(stepId: number, answers: Record<number, string[]>): number {
  const step = STEPS.find(s => s.id === stepId)!;
  return step.questions.reduce((n, q, qi) => {
    return n + (isAnswerCorrect(q, answers[qi] ?? []) ? 1 : 0);
  }, 0);
}

function evaluateStep(stepId: number, answers: Record<number, string[]>) {
  const step = STEPS.find(s => s.id === stepId)!;
  let falseSelections = 0;
  let missedCorrectAnswers = 0;

  step.questions.forEach((question, questionIndex) => {
    const selected = answers[questionIndex] ?? [];
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    falseSelections += selected.filter(answer => !correctAnswers.includes(answer)).length;
    missedCorrectAnswers += correctAnswers.filter(answer => !selected.includes(answer)).length;
  });

  return {
    score: getStepScore(stepId, answers),
    passed: falseSelections <= 1 && missedCorrectAnswers === 0,
  };
}

type StepAnswers = Record<number, Record<number, string[]>>;
type RevealedSteps = Record<number, boolean>;

interface StoredQuizProgress {
  activeStep: number;
  completedSteps: number[];
  stepAnswers: StepAnswers;
  revealed: RevealedSteps;
}

const createEmptyAnswers = (): StepAnswers => ({ 1: {}, 2: {}, 3: {}, 4: {}, 5: {} });
const createEmptyRevealed = (): RevealedSteps => ({ 1: false, 2: false, 3: false, 4: false, 5: false });
const progressStorageKey = (challengeId: string) => `alana_knowledge_challenge_${challengeId}_v1`;

function loadQuizProgress(challengeId: string): StoredQuizProgress {
  const fallback: StoredQuizProgress = {
    activeStep: 1,
    completedSteps: [],
    stepAnswers: createEmptyAnswers(),
    revealed: createEmptyRevealed(),
  };

  try {
    const stored = localStorage.getItem(progressStorageKey(challengeId));
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as Partial<StoredQuizProgress>;
    const validStepIds = new Set(STEPS.map(step => step.id));
    const completedSteps = Array.isArray(parsed.completedSteps)
      ? parsed.completedSteps.filter(id => typeof id === 'number' && validStepIds.has(id))
      : [];
    const activeStep = typeof parsed.activeStep === 'number' && validStepIds.has(parsed.activeStep)
      ? parsed.activeStep
      : 1;

    return {
      activeStep,
      completedSteps,
      stepAnswers: { ...createEmptyAnswers(), ...(parsed.stepAnswers ?? {}) },
      revealed: { ...createEmptyRevealed(), ...(parsed.revealed ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function LearnerQuiz({
  storageKey = 'web3',
  badgeImage,
  challengeTitle = 'Web3 Essentials',
  mintUrl,
}: {
  storageKey?: string;
  badgeImage: string;
  challengeTitle?: string;
  mintUrl?: string | null;
}) {
  const initialProgress = useMemo(() => loadQuizProgress(storageKey), [storageKey]);
  const quizTopRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const stickActionsToBottomRef = useRef(false);
  const scrollQuizToTopRef = useRef(false);
  const [activeStep, setActiveStep] = useState(initialProgress.activeStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set(initialProgress.completedSteps),
  );
  const [stepAnswers, setStepAnswers] = useState<StepAnswers>(initialProgress.stepAnswers);
  const [revealed, setRevealed] = useState<RevealedSteps>(initialProgress.revealed);

  const shuffled = useMemo(() => {
    const out: Record<string, string[]> = {};
    STEPS.forEach(step => {
      step.questions.forEach((q, qi) => {
        const opts = [...q.options];
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        out[`${step.id}-${qi}`] = opts;
      });
    });
    return out;
  }, []);

  useEffect(() => {
    const progress: StoredQuizProgress = {
      activeStep,
      completedSteps: [...completedSteps],
      stepAnswers,
      revealed,
    };

    try {
      localStorage.setItem(progressStorageKey(storageKey), JSON.stringify(progress));
    } catch {
      // Progress persistence is optional when browser storage is unavailable.
    }
  }, [activeStep, completedSteps, revealed, stepAnswers, storageKey]);

  useLayoutEffect(() => {
    if (!stickActionsToBottomRef.current) return;
    stickActionsToBottomRef.current = false;
    actionsRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
  }, [completedSteps, revealed]);

  useLayoutEffect(() => {
    if (!scrollQuizToTopRef.current) return;
    scrollQuizToTopRef.current = false;
    quizTopRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [activeStep, revealed]);

  function isLocked(id: number) {
    return id > 1 && !completedSteps.has(id - 1);
  }

  function selectAnswer(stepId: number, qIdx: number, option: string, isMulti: boolean) {
    if (revealed[stepId]) return;
    setStepAnswers(prev => {
      const cur = prev[stepId][qIdx] ?? [];
      const next = isMulti
        ? cur.includes(option) ? cur.filter(o => o !== option) : [...cur, option]
        : [option];
      return { ...prev, [stepId]: { ...prev[stepId], [qIdx]: next } };
    });
  }

  function handleReveal(stepId: number) {
    const { passed } = evaluateStep(stepId, stepAnswers[stepId]);
    stickActionsToBottomRef.current = true;
    setRevealed(prev => ({ ...prev, [stepId]: true }));
    if (passed) {
      setCompletedSteps(prev => new Set([...prev, stepId]));
    }
  }

  function handleRetry(stepId: number) {
    scrollQuizToTopRef.current = true;
    setStepAnswers(prev => ({ ...prev, [stepId]: {} }));
    setRevealed(prev => ({ ...prev, [stepId]: false }));
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
  }

  const allDone = completedSteps.size === 5;

  const step = STEPS.find(s => s.id === activeStep)!;
  const isRevealed = revealed[activeStep];
  const answers = stepAnswers[activeStep];
  const allAnswered = step.questions.every((_, qi) => (answers[qi] ?? []).length > 0);
  const evaluation = evaluateStep(activeStep, answers);
  const score = isRevealed ? evaluation.score : 0;
  const passed = evaluation.passed;

  if (allDone) {
    return (
      <div className="w-full space-y-8 bg-[#F3F3F3]">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="group aspect-square w-full overflow-hidden rounded-[4px] bg-[#262424]">
            <img
              src={badgeImage}
              alt={`${challengeTitle} badge`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Challenge complete</p>
            <h3 className="font-sans text-2xl font-semibold">
              You've completed the {challengeTitle} Challenge!
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              You now have solid beginner knowledge in Web3, wallets, crypto, NFTs, and DeFi. Your blockchain-verified badge will be available to mint below.
            </p>
          </div>
        </div>
        {mintUrl ? (
          <a
            href={mintUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
          >
            Mint Your NFT Badge
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Mint link coming soon"
            className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] opacity-50 shadow-lg backdrop-blur-sm"
          >
            Mint Your NFT Badge
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={quizTopRef} className="space-y-6">
      {/* Step tabs */}
      <div className="flex gap-0 border-b border-foreground/10 overflow-x-auto">
        {STEPS.map(s => {
          const locked = isLocked(s.id);
          const done = completedSteps.has(s.id);
          const active = s.id === activeStep;
          return (
            <button
              key={s.id}
              onClick={() => !locked && setActiveStep(s.id)}
              disabled={locked}
              className={`px-4 h-10 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : locked
                  ? 'text-foreground/20 cursor-not-allowed'
                  : done
                  ? 'text-accent hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="mr-1.5 opacity-50">{String(s.id).padStart(2, '0')}</span>
              {s.label}
              {done && <span className="ml-1.5 text-accent">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {step.questions.map((q, qi) => {
          const selected = answers[qi] ?? [];
          const opts = shuffled[`${step.id}-${qi}`] ?? q.options;

          return (
            <div
              key={qi}
              className="border border-foreground rounded-[4px] overflow-hidden"
            >
              {/* Question header */}
              <div className="px-6 py-5 border-b border-foreground/10">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 mt-0.5">
                    Q{qi + 1}
                  </span>
                  <p className="font-sans text-sm font-medium leading-snug">{q.question}</p>
                </div>
                {q.isMultiSelect && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-2 ml-7">Select all that apply</p>
                )}
              </div>

              {/* Options */}
              <div className="p-4 space-y-2">
                {opts.map(opt => {
                  const isSelected = selected.includes(opt);
                  const correct = Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.includes(opt)
                    : opt === q.correctAnswer;

                  let cls =
                    'w-full text-left px-4 py-3 border font-sans text-sm leading-snug transition-colors rounded-[4px] ';

                  if (isRevealed) {
                    if (correct && isSelected) {
                      cls += 'border-green-500/60 bg-green-500/10 text-foreground';
                    } else if (correct && !isSelected) {
                      cls += 'border-[#EF2795] bg-[#EF2795]/10 text-foreground';
                    } else if (isSelected && !correct) {
                      cls += 'border-[#EF2795] bg-[#EF2795]/10 text-foreground';
                    } else {
                      cls += 'border-foreground/10 text-foreground/40';
                    }
                  } else if (isSelected) {
                    cls += 'border-accent bg-accent/20 text-foreground';
                  } else {
                    cls += 'border-foreground/20 hover:border-foreground/50 text-foreground cursor-pointer';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(step.id, qi, opt, !!q.isMultiSelect)}
                      disabled={isRevealed}
                      className={cls}
                    >
                      <span className="flex items-start gap-3">
                        {isRevealed && (
                          <span className="shrink-0 mt-0.5">
                            {correct && isSelected ? (
                              <Check size={13} className="text-green-500" />
                            ) : correct && !isSelected ? (
                              <X size={13} className="text-[#EF2795]" />
                            ) : isSelected ? (
                              <X size={13} className="text-[#EF2795]" />
                            ) : (
                              <span className="w-[13px] h-[13px] block" />
                            )}
                          </span>
                        )}
                        <span className="flex-1">{opt}</span>
                        {isRevealed && correct && !isSelected && (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#EF2795]">
                            Not selected
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explainer (post-reveal) */}
              {isRevealed && (
                <div className="px-6 pb-5">
                  <div className="border-t border-foreground/10 pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Explainer</p>
                    <p className="font-sans text-xs text-muted-foreground leading-relaxed">{q.explainer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div ref={actionsRef} className="flex w-full flex-wrap items-center gap-4 pt-2">
        {!isRevealed ? (
          <button
            onClick={() => handleReveal(step.id)}
            disabled={!allAnswered}
            className="ml-auto inline-flex h-11 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-[#262424]"
          >
            Check Answers
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xs uppercase tracking-widest ${passed ? 'text-green-600' : 'text-[#EF2795]'}`}>
                {score}/3 correct — {passed ? 'Step passed!' : 'Not passed'}
              </span>
            </div>
            {passed && activeStep < 5 && (
              <button
                onClick={() => {
                  scrollQuizToTopRef.current = true;
                  setActiveStep(activeStep + 1);
                }}
                className="ml-auto inline-flex h-11 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
              >
                Next Step
              </button>
            )}
            {passed && activeStep === 5 && (
              <span className="font-mono text-xs text-accent uppercase tracking-widest">Journey complete ✓</span>
            )}
            {!passed && (
              <button
                onClick={() => handleRetry(step.id)}
                className="ml-auto inline-flex h-11 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent"
              >
                Redo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
