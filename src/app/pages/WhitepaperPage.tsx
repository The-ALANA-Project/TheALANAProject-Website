import { useState, useEffect } from 'react';
import { Pencil, Check, X, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';
import { fetchManagedResource, mutateGuardianResource } from '../services/guardianApi';

type SubSection = { title: string; anchor: string };
type Section = { num: string; title: string; anchor: string; children?: SubSection[] };

const toc: Section[] = [
  { num: '01', title: 'Introduction', anchor: 'intro' },
  {
    num: '02', title: 'About The ALANA Project', anchor: 'about',
    children: [
      { title: 'Our Mission & Vision', anchor: 'mission' },
      { title: 'Resources & Product Ecosystem', anchor: 'resources' },
    ],
  },
  { num: '03', title: 'Problem Statement', anchor: 'problem' },
  {
    num: '04', title: 'Solutions', anchor: 'solutions',
    children: [
      { title: 'First Impact Layer', anchor: 'impact-1' },
      { title: 'Second Impact Layer', anchor: 'impact-2' },
      { title: 'Third Impact Layer', anchor: 'impact-3' },
    ],
  },
  {
    num: '05', title: 'Market Analysis and Products', anchor: 'market',
    children: [
      { title: 'Use Cases', anchor: 'use-cases' },
    ],
  },
  {
    num: '06', title: 'Tokenomics and Governance', anchor: 'tokenomics',
    children: [
      { title: 'Organizational Structure & Governance', anchor: 'org-structure' },
      { title: 'Membership Roles', anchor: 'membership' },
      { title: 'How Governance Works', anchor: 'gov-works' },
      { title: 'Tokenomics', anchor: 'tokenomics-detail' },
      { title: 'Earning $ALANA', anchor: 'earning' },
      { title: 'Contribution Measurement & Transparency', anchor: 'contribution' },
      { title: 'Treasury & Values', anchor: 'treasury' },
    ],
  },
  { num: '07', title: 'Roadmap', anchor: 'roadmap' },
  {
    num: '08', title: 'About the Authors', anchor: 'authors',
    children: [
      { title: 'Core Authors', anchor: 'core-authors' },
      { title: 'Editors', anchor: 'editors' },
    ],
  },
  {
    num: '09', title: 'Legal and Regulatory Considerations', anchor: 'legal',
    children: [
      { title: 'Regulatory Challenges and Token Issuance', anchor: 'regulatory' },
      { title: 'Legal Jurisdiction and Compliance Measures', anchor: 'jurisdiction' },
      { title: 'Disclaimers for Users', anchor: 'disclaimers' },
    ],
  },
  {
    num: '10', title: 'Security and Risks', anchor: 'security',
    children: [
      { title: 'Potential Threats and Risks', anchor: 'threats' },
      { title: 'Security Measures and Audits', anchor: 'security-measures' },
      { title: 'Risk Mitigation Strategies', anchor: 'risk-mitigation' },
    ],
  },
  { num: '11', title: 'Conclusion', anchor: 'conclusion' },
  { num: '', title: 'References and Appendix', anchor: 'references' },
];

const SEED_CONTENT: Record<string, string> = {
  intro: `The ALANA Project is a decentralised, community-driven initiative designed to reward meaningful contribution through a transparent, on-chain incentive framework. Members earn $ALANA tokens by completing verifiable quests — tasks that grow and sustain the ecosystem.\n\nAccess to the contribution framework is gated by NFT-based roles on the Optimism network: Nucleus Guardians govern the protocol, Specialists lead domain-specific workstreams, and Apprentices learn by doing. Together they form a self-sustaining meritocracy.`,
};

const LS_KEY = (anchor: string) => `alana_wp_${anchor}`;

async function fetchSection(anchor: string): Promise<string | null> {
  try {
    const rows = await fetchManagedResource<{ anchor: string; content: string }>(
      'whitepaper',
      { anchor },
    );
    if (rows[0]?.content) return rows[0].content;
  } catch {}
  return localStorage.getItem(LS_KEY(anchor));
}

function isBlockLine(l: string): boolean {
  const t = l.trimStart();
  // empty lines, headings, list items (marker + space), blockquotes, fences, tables, hr
  return (
    t === '' ||
    /^#{1,6} /.test(t) ||
    /^[-*+] /.test(t) ||
    /^\d+[.)]\s/.test(t) ||
    /^>/.test(t) ||
    /^`{3}/.test(t) ||
    /^\|/.test(t) ||
    /^[-*_]{3,}\s*$/.test(t)
  );
}

function preprocessMarkdown(content: string): string {
  // react-markdown escapes raw HTML by design. Support only explicit break tags:
  // standalone tags become spacer paragraphs, while inline tags become Markdown hard breaks.
  const normalized = content
    .replace(/^[\t ]*<br\s*\/?>[\t ]*$/gim, '\n&nbsp;\n')
    .replace(/<br\s*\/?>/gi, '  \n');
  const lines = normalized.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Convert bare [x] / [ ] to GFM task list items
    if (/^\[x\]\s/i.test(line)) line = `- [x] ${line.slice(4)}`;
    else if (/^\[ \]\s/.test(line)) line = `- [ ] ${line.slice(4)}`;

    // Add two trailing spaces (hard line break) between consecutive non-block lines
    // so each editor line stays in the same paragraph but renders on its own visual line
    const next = lines[i + 1];
    if (line !== '' && !isBlockLine(line) && next !== undefined && next !== '' && !isBlockLine(next)) {
      line = line.trimEnd() + '  ';
    }

    out.push(line);
  }

  return out.join('\n');
}

async function upsertSection(anchor: string, content: string): Promise<void> {
  localStorage.setItem(LS_KEY(anchor), content);
  await mutateGuardianResource('upsert', 'whitepaper', { anchor, content });
}

function SectionCard({
  anchor,
  title,
  num,
  isGuardian,
  isExpanded,
  onToggle,
}: {
  anchor: string;
  title: string;
  num?: string;
  isGuardian: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const seedContent = SEED_CONTENT[anchor] ?? '';
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<string>(seedContent);
  const [draft, setDraft] = useState(seedContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSection(anchor).then((content) => {
      if (content) {
        setSaved(content);
        setDraft(content);
      }
    });
  }, [anchor]);

  async function handleSave() {
    setSaving(true);
    await upsertSection(anchor, draft);
    setSaved(draft);
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(saved);
    setEditing(false);
  }

  const borderClass = saved ? 'border-foreground' : 'border-foreground/30';

  return (
    <div id={anchor} className={`border ${borderClass} rounded-[8px] p-6 md:p-8`}>
      <div className={`flex items-start justify-between gap-4 ${isExpanded ? 'mb-4' : ''}`}>
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between gap-4 text-left"
          aria-expanded={isExpanded}
          aria-controls={`${anchor}-content`}
        >
          <div>
            {num && (
              <span className="font-mono text-xs text-muted-foreground tracking-widest block mb-1">
                {num}.
              </span>
            )}
            <h2 className="text-lg font-sans font-semibold">{title}</h2>
          </div>
          <ChevronDown
            size={18}
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {isGuardian && !editing && (
          <button
            onClick={() => {
              if (!isExpanded) onToggle();
              setEditing(true);
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-1"
            aria-label="Edit section"
          >
            <Pencil size={15} />
          </button>
        )}
        {isGuardian && editing && (
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              aria-label="Save"
            >
              <Check size={15} />
            </button>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cancel"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div id={`${anchor}-content`}>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            placeholder={`Use ## Sub-section Name to add sub-headings within this section.\n\nSupports Markdown: **bold**, *italic*, - list, [link](url)`}
            className="w-full text-sm font-mono bg-transparent border border-foreground/20 rounded-[4px] p-3 text-foreground resize-vertical focus:outline-none focus:border-foreground/60 placeholder:text-muted-foreground/40"
          />
          <p className="text-xs text-muted-foreground/50 font-mono">
            ## Sub-heading &nbsp;·&nbsp; **bold** &nbsp;·&nbsp; *italic* &nbsp;·&nbsp; - list &nbsp;·&nbsp; [x] checkbox &nbsp;·&nbsp; [text](url)
          </p>
        </div>
      ) : saved ? (
        <div className="
          text-sm text-muted-foreground leading-relaxed
          [&_h2]:text-base [&_h2]:font-sans [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h2:first-child]:mt-0
          [&_h3]:text-sm [&_h3]:font-sans [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1
          [&_h4]:text-[14px] [&_h4]:font-sans [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-4 [&_h4]:mb-2
          [&_strong]:text-foreground [&_strong]:font-semibold
          [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-foreground/30 hover:[&_a]:decoration-foreground
          [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-2 [&_ul]:space-y-1
          [&_ul:has(input)]:list-none [&_ul:has(input)]:pl-0
          [&_li:has(input)]:flex [&_li:has(input)]:items-baseline [&_li:has(input)]:gap-2
          [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mt-2 [&_ol]:space-y-1
          [&_p]:mb-3 [&_p:last-child]:mb-0
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              br: () => <br className="block content-[''] mb-2" />,
              input: ({ checked }) => (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="shrink-0 accent-foreground cursor-default translate-y-[3px]"
                />
              ),
            }}
          >
            {preprocessMarkdown(saved)}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          This section is being drafted and will be published shortly.
        </p>
      )}
        </div>
      )}
    </div>
  );
}

export function WhitepaperPage() {
  const { role, guardianSessionStatus } = useAuth();
  const isGuardian = role === 'guardian' && guardianSessionStatus === 'authorized';
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const allSectionsExpanded = expandedSections.size === toc.length;

  function toggleSection(anchor: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(anchor) ? next.delete(anchor) : next.add(anchor);
      return next;
    });
  }

  function toggleAllSections() {
    setExpandedSections(allSectionsExpanded ? new Set() : new Set(toc.map((section) => section.anchor)));
  }

  return (
    <>
      <Seo
        title="Whitepaper"
        description="The technical and conceptual foundation of The ALANA Project — covering token economics, governance, contributor roles, and the long-term vision."
        path="/whitepaper"
      />
      <div className="min-h-[calc(100vh-160px)] w-full px-8 md:px-16 max-w-6xl mx-auto py-20">
        <header className="mb-16">
          <p className="font-mono text-sm text-muted-foreground mb-2">The ALANA Project</p>
          <h1 className="leading-tight">Whitepaper 0.3</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            A Community-Governed Ecosystem for Creator Sovereignty
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Authored by</span>
            {[
              { name: 'Lutra', url: 'https://www.linkedin.com/in/nils-otter-a23446131/' },
              { name: 'Stella', url: 'https://www.linkedin.com/in/stella-achenbach/' },
              { name: 'Greyscale', url: 'https://www.linkedin.com/in/kerry-allen-greyscale-group/' },
            ].map(({ name, url }, i, arr) => (
              <span key={name} className="font-mono text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground"
                >
                  {name}
                </a>
                {i < arr.length - 1 && <span className="text-muted-foreground">,</span>}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              type="button"
              onClick={toggleAllSections}
              className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium bg-accent text-[#262424] backdrop-blur-sm border border-accent shadow-lg rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent"
            >
              {allSectionsExpanded ? 'Collapse All' : 'Expand All'}
            </button>
            <button
              disabled
              className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium bg-accent text-[#262424] backdrop-blur-sm border border-accent shadow-lg rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download PDF
            </button>
          </div>
        </header>

        {/* Content — one card per top-level section */}
        <div className="space-y-6">
          {toc.map((s) => (
            <SectionCard
              key={s.anchor}
              anchor={s.anchor}
              title={s.title}
              num={s.num || undefined}
              isGuardian={isGuardian}
              isExpanded={expandedSections.has(s.anchor)}
              onToggle={() => toggleSection(s.anchor)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
