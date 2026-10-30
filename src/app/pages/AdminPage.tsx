import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowClockwise, Eye, EyeSlash, PencilSimple, PushPin, Trash, X as XIcon } from '@phosphor-icons/react';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { fetchAllBlogPosts, formatPubDate, type BlogPost } from '../services/blogService';
import {
  fetchCurations,
  upsertCuration,
  setHero,
  clearHero,
  type BlogCuration,
} from '../services/blogCurationService';
import {
  fetchTickerItems,
  upsertTickerItem,
  deleteTickerItem,
  fetchCommunityMembers,
  upsertCommunityMember,
  deleteCommunityMember,
  uploadMemberImage,
  detectNFTRole,
  fetchStoryFlags,
  upsertStoryFlag,
  fetchCommunityTools,
  fetchCommunityToolsStatus,
  upsertCommunityTool,
  deleteCommunityTool,
  fetchHubWebinars,
  upsertHubWebinar,
  deleteHubWebinar,
  type TickerItem,
  type CommunityMember,
  type StoryFlag,
  type CommunityTool,
  type ToolCategory,
  type HubWebinar,
} from '../services/communityAdminService';

// ── Blog Curation Panel ────────────────────────────────────────────────────

function BlogCurationPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [curations, setCurations] = useState<BlogCuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [fetchedPosts, fetchedCurations] = await Promise.all([
        fetchAllBlogPosts(),
        fetchCurations(),
      ]);
      setPosts(fetchedPosts);
      setCurations(fetchedCurations);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const workingList = useMemo(() => {
    const map = new Map(curations.map(c => [c.guid, c]));
    const merged = posts.map(p => ({
      ...p,
      curation: map.get(p.guid) ?? { guid: p.guid, visible: true, display_order: null, is_hero: false },
    }));
    return merged.sort((a, b) => {
      const oa = a.curation.display_order ?? Infinity;
      const ob = b.curation.display_order ?? Infinity;
      return oa - ob;
    });
  }, [posts, curations]);

  async function handleToggleVisible(guid: string) {
    const current = curations.find(c => c.guid === guid);
    const newVisible = !(current?.visible ?? true);
    setSaving(true);
    await upsertCuration({
      guid,
      visible: newVisible,
      display_order: current?.display_order ?? null,
      is_hero: current?.is_hero ?? false,
    });
    setCurations(prev => {
      const exists = prev.find(c => c.guid === guid);
      if (exists) return prev.map(c => c.guid === guid ? { ...c, visible: newVisible } : c);
      return [...prev, { guid, visible: newVisible, display_order: null, is_hero: false }];
    });
    setSaving(false);
    toast.success(newVisible ? 'Article now visible' : 'Article hidden');
  }

  async function handleSetHero(guid: string) {
    setSaving(true);
    const updatedCurations = await setHero(guid, curations);
    setCurations(updatedCurations);
    setSaving(false);
    toast.success('Hero article pinned');
  }

  async function handleClearHero() {
    setSaving(true);
    await clearHero();
    setCurations(prev => prev.map(c => ({ ...c, is_hero: false })));
    setSaving(false);
    toast.success('Hero unpinned');
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-48 bg-muted animate-pulse" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-[8px]" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="border border-foreground/20 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-8 text-center space-y-3">
        <p className="font-mono text-sm text-muted-foreground">{loadError}</p>
        <button
          onClick={load}
          className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border border-foreground/20 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-8 text-center space-y-3">
        <p className="font-mono text-sm text-muted-foreground">No articles found in the Paragraph feed.</p>
        <button
          onClick={load}
          className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
        Guardians shape what the community encounters first. Grant or revoke visibility and pin one piece to the hero position on the Blog page.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-5 pb-2 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Article</span>
          {saving
            ? <span className="font-mono text-[10px] text-muted-foreground animate-pulse">Saving…</span>
            : (
              <button
                onClick={load}
                disabled={saving}
                title="Reload feed"
                className="text-muted-foreground hover:text-foreground hover:rotate-180 transition-all duration-300 cursor-pointer"
              >
                <ArrowClockwise size={14} aria-hidden="true" />
                <span className="sr-only">Refresh</span>
              </button>
            )
          }
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Pin</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Show</span>
      </div>

      {/* Article rows */}
      <div className="space-y-3">
        {workingList.map((post) => {
          const { is_hero, visible } = post.curation;
          return (
            <div
              key={post.guid}
              className={`flex items-stretch border rounded-[8px] overflow-hidden transition-colors ${
                is_hero ? 'border-accent bg-accent/5' : !visible ? 'border-foreground opacity-50' : 'border-foreground'
              }`}
            >
              {/* Image flush to left/top/bottom */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-36 object-cover shrink-0"
                />
              )}

              {/* Content */}
              <div className="flex-1 flex items-center gap-6 px-5 py-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {is_hero && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent bg-accent/15 px-1.5 py-0.5 shrink-0">
                        Hero
                      </span>
                    )}
                    <p className="font-sans font-medium text-sm leading-snug truncate">{post.title}</p>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
                    {post.author} · {formatPubDate(post.pubDate)}
                  </p>
                </div>

                {/* Pin hero */}
                <button
                  onClick={() => is_hero ? handleClearHero() : handleSetHero(post.guid)}
                  disabled={saving}
                  title={is_hero ? 'Unpin hero' : 'Pin as hero'}
                  className={`flex items-center justify-center w-9 h-9 shrink-0 transition-colors ${
                    is_hero ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <PushPin size={18} weight={is_hero ? 'fill' : 'regular'} aria-hidden="true" />
                  <span className="sr-only">{is_hero ? 'Unpin' : 'Pin'}</span>
                </button>

                {/* Visibility toggle */}
                <button
                  onClick={() => handleToggleVisible(post.guid)}
                  disabled={saving}
                  title={visible ? 'Hide article' : 'Show article'}
                  className={`flex items-center justify-center w-9 h-9 shrink-0 transition-colors ${
                    visible ? 'text-foreground hover:text-muted-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground'
                  }`}
                >
                  {visible ? <Eye size={18} aria-hidden="true" /> : <EyeSlash size={18} aria-hidden="true" />}
<span className="sr-only">{visible ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Community Panel ────────────────────────────────────────────────────────

type CommunitySubTab = 'ticker' | 'members' | 'stories' | 'tools';

// ── Ticker sub-panel ───────────────────────────────────────────────────────

function TickerPanel() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await fetchTickerItems());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return;
    setSaving(true);
    const existing = items.find(i => i.id === id)!;
    await upsertTickerItem({ id, text: editText.trim(), display_order: existing.display_order, active: existing.active });
    setItems(prev => prev.map(i => i.id === id ? { ...i, text: editText.trim() } : i));
    setEditingId(null);
    setSaving(false);
    toast.success('Ticker item updated');
  }

  async function handleToggleActive(id: string) {
    const existing = items.find(i => i.id === id)!;
    setSaving(true);
    await upsertTickerItem({ id, text: existing.text, display_order: existing.display_order, active: !existing.active });
    setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
    setSaving(false);
    toast.success(existing.active ? 'Item hidden from ticker' : 'Item visible in ticker');
  }

  async function handleDelete(id: string) {
    setSaving(true);
    await deleteTickerItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    setSaving(false);
    toast.success('Ticker item removed');
  }

  async function handleAdd() {
    if (!newText.trim()) return;
    setSaving(true);
    const order = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
    const created = await upsertTickerItem({ text: newText.trim(), display_order: order, active: true });
    if (created) {
      setItems(prev => [...prev, created]);
      toast.success('Ticker item added');
    } else {
      toast.error('Failed to save — Supabase table may not exist yet');
    }
    setNewText('');
    setAdding(false);
    setSaving(false);
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
        Manage the scrolling ticker on the Community page. Active items appear in the live banner; inactive items are hidden but kept in reserve.
      </p>

      <div className="space-y-2">
        {items.length === 0 && !adding && (
          <p className="font-mono text-xs text-muted-foreground py-6 text-center">No ticker items yet.</p>
        )}
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 border transition-colors ${
              item.active ? 'border-foreground' : 'border-foreground/20 opacity-50'
            } rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px]`}
          >
            {editingId === item.id ? (
              <>
                <input
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 bg-transparent font-sans text-sm outline-none border-b border-foreground/30 focus:border-foreground pb-0.5"
                />
                <button onClick={() => handleSaveEdit(item.id)} disabled={saving} className="text-foreground hover:text-accent transition-colors">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="flex-1 font-sans text-sm leading-snug">{item.text}</p>
                <button
                  onClick={() => { setEditingId(item.id); setEditText(item.text); }}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <PencilSimple size={18} aria-hidden="true" />
                  <span className="sr-only">Edit</span>
                </button>
                <button
                  onClick={() => handleToggleActive(item.id)}
                  disabled={saving}
                  title={item.active ? 'Hide' : 'Show'}
                  className={`shrink-0 transition-colors ${item.active ? 'text-foreground hover:text-muted-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                >
                  {item.active ? <Eye size={18} aria-hidden="true" /> : <EyeSlash size={18} aria-hidden="true" />}
<span className="sr-only">{item.active ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={saving}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                >
                  <Trash size={18} aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </button>
              </>
            )}
          </div>
        ))}

        {adding && (
          <div className="flex items-center gap-3 px-4 py-3 border border-accent rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px]">
            <input
              autoFocus
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewText(''); } }}
              placeholder="New ticker item text…"
              className="flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-muted-foreground/50"
            />
            <button onClick={handleAdd} disabled={saving || !newText.trim()} className="text-foreground hover:text-accent transition-colors">
              Save
            </button>
            <button onClick={() => { setAdding(false); setNewText(''); }} className="text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Add item
        </button>
      )}
    </div>
  );
}

// ── Members sub-panel ──────────────────────────────────────────────────────

const MEMBER_ROLES = ['Nucleus Apprentice', 'Nucleus Specialist', 'Nucleus Guardian'] as const;
const MEMBER_BRANCHES = [
  'Infrastructure & Strategy',
  'Socials & Identity',
  'ALANAmagazine',
  'ALANAboutique',
  'FABAstudio',
] as const;

const EMPTY_MEMBER: Omit<CommunityMember, 'id'> = {
  wallet_address: '',
  name: '',
  role: '',
  team: '',
  skills: [],
  active: true,
  bio: '',
  image_url: '',
  social_url: '',
  website_url: '',
  visible: true,
  display_order: null,
};

function MemberForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: Omit<CommunityMember, 'id'> & { id?: string };
  onSave: (m: typeof initial) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    initial.team ? initial.team.split(',').map(s => s.trim()).filter(Boolean) : [],
  );
  const [skills, setSkills] = useState<string[]>(initial.skills.slice(0, 3));
  const [skillInput, setSkillInput] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleBranch(branch: string) {
    const isGuardian = form.role === 'Nucleus Guardian';
    if (isGuardian) {
      setSelectedBranches(prev => prev.includes(branch) ? [] : [branch]);
    } else {
      setSelectedBranches(prev =>
        prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch],
      );
    }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || skills.length >= 3 || skills.includes(s)) return;
    setSkills(prev => [...prev, s]);
    setSkillInput('');
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(sk => sk !== s));
  }

  async function handleDetect() {
    if (!form.wallet_address.trim()) { setDetectMsg('Enter a wallet address first'); return; }
    setDetecting(true);
    setDetectMsg('Checking Optimism mainnet…');
    const result = await detectNFTRole(form.wallet_address.trim());
    setDetecting(false);
    if (!result) {
      setDetectMsg('Could not reach Optimism RPC');
    } else if (!result.role) {
      setDetectMsg('No Nucleus NFT found for this wallet');
      set('active', false);
    } else {
      set('role', result.role);
      set('active', true);
      setDetectMsg(`Found: ${result.role}`);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadMemberImage(file);
    setUploading(false);
    if (url) {
      set('image_url', url);
      toast.success('Image uploaded');
    } else {
      toast.error('Upload failed — check Supabase storage bucket exists');
    }
    e.target.value = '';
  }

  function handleSubmit() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    onSave({ ...form, team: selectedBranches.join(', '), skills });
  }

  const field = 'font-sans text-sm bg-transparent border-b border-foreground/20 focus:border-foreground outline-none pb-0.5 w-full transition-colors';
  const lbl = 'font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block';

  return (
    <div className="border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-6 space-y-5">

      {/* Name + Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Name / Handle *</label>
          <input className={field} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name or handle" />
        </div>
        <div>
          <label className={lbl}>Wallet address</label>
          <div className="flex items-end gap-2">
            <input
              className={`${field} flex-1`}
              value={form.wallet_address}
              onChange={e => { set('wallet_address', e.target.value); setDetectMsg(''); }}
              placeholder="0x…"
            />
            <button
              type="button"
              onClick={handleDetect}
              disabled={detecting}
              className="shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-foreground rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors disabled:opacity-40"
            >
              {detecting ? '…' : 'Detect'}
            </button>
          </div>
          {detectMsg && (
            <p className={`font-mono text-[10px] mt-1.5 ${detectMsg.startsWith('Found') ? 'text-accent' : 'text-muted-foreground'}`}>
              {detectMsg}
            </p>
          )}
        </div>
      </div>

      {/* Role + Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Role</label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            className="font-sans text-sm bg-background border-b border-foreground/20 focus:border-foreground outline-none pb-0.5 w-full transition-colors cursor-pointer"
          >
            <option value="">Select a role…</option>
            {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Photo</label>
          <div className="flex items-end gap-3">
            {form.image_url ? (
              <div className="flex items-center gap-3">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded-[2px] shrink-0"
                />
                <button
                  type="button"
                  onClick={() => set('image_url', '')}
                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <label className="shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-foreground rounded-tl-[2px] rounded-tr-none rounded-br-[10px] rounded-bl-[2px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors cursor-pointer">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                <span className="font-mono text-[10px] text-muted-foreground">or</span>
                <input
                  className={`${field} flex-1`}
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="paste URL"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch select */}
      <div>
        <label className={lbl}>
          Branch
          {form.role === 'Nucleus Guardian' && (
            <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground text-[10px]">— Guardians oversee one branch</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {MEMBER_BRANCHES.map(branch => {
            const selected = selectedBranches.includes(branch);
            return (
              <button
                key={branch}
                type="button"
                onClick={() => toggleBranch(branch)}
                className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors rounded-none ${
                  selected
                    ? 'bg-accent text-foreground border-accent'
                    : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {branch}
              </button>
            );
          })}
        </div>
      </div>


      {/* Skills — max 3 */}
      <div>
        <label className={lbl}>Skills <span className="normal-case tracking-normal">(max 3)</span></label>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {skills.map(s => (
            <span key={s} className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 border border-foreground/30 rounded-none">
              {s}
              <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="flex items-center text-muted-foreground hover:text-foreground transition-colors ml-1">
                <XIcon size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
          {skills.length < 3 && (
            <input
              className="font-sans text-sm bg-transparent border-b border-foreground/20 focus:border-foreground outline-none pb-0.5 transition-colors w-36"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
              placeholder="Add skill…"
            />
          )}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Social media URL</label>
          <input
            className={field}
            value={form.social_url}
            onChange={e => set('social_url', e.target.value)}
            placeholder="https://twitter.com/…"
          />
        </div>
        <div>
          <label className={lbl}>Website URL</label>
          <input
            className={field}
            value={form.website_url}
            onChange={e => set('website_url', e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className={lbl}>Bio (~50 words)</label>
        <textarea
          className={`${field} resize-none`}
          rows={3}
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="Short member bio…"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="accent-foreground w-3.5 h-3.5" />
          <span className="font-mono text-xs">Active NFT membership</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.visible} onChange={e => set('visible', e.target.checked)} className="accent-foreground w-3.5 h-3.5" />
          <span className="font-mono text-xs">Visible in directory</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="font-mono text-xs uppercase tracking-widest px-5 py-2.5 bg-foreground text-background rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save member'}
        </button>
        <button
          onClick={onCancel}
          className="font-mono text-xs uppercase tracking-widest px-5 py-2.5 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function MembersPanel() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMembers(await fetchCommunityMembers());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(data: Omit<CommunityMember, 'id'> & { id?: string }) {
    setSaving(true);
    const { data: saved, error } = await upsertCommunityMember(data);
    if (saved) {
      if (data.id) {
        setMembers(prev => prev.map(m => m.id === data.id ? saved : m));
        toast.success('Member updated');
      } else {
        setMembers(prev => [...prev, saved]);
        toast.success('Member added');
      }
      setEditingId(null);
      setAdding(false);
    } else {
      toast.error(`Failed to save member: ${error ?? 'Unknown database error'}`);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setSaving(true);
    await deleteCommunityMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    setSaving(false);
    toast.success('Member removed');
  }

  async function handleToggleVisible(id: string) {
    const m = members.find(m => m.id === id)!;
    setSaving(true);
    const { data: saved, error } = await upsertCommunityMember({ ...m, visible: !m.visible });
    if (!saved) {
      toast.error(`Failed to update member: ${error ?? 'Unknown database error'}`);
      setSaving(false);
      return;
    }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    setSaving(false);
    toast.success(!m.visible ? 'Member visible in directory' : 'Member hidden from directory');
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>;
  }

  const editingMember = members.find(m => m.id === editingId);

  return (
    <div className="space-y-6">
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
        Add and manage community members by wallet address. Active status reflects NFT membership. Visibility controls whether a member appears in the public directory.
      </p>

      {adding && (
        <MemberForm
          initial={{ ...EMPTY_MEMBER }}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {editingId && editingMember && (
        <MemberForm
          initial={editingMember}
          onSave={data => handleSave({ ...data, id: editingId })}
          onCancel={() => setEditingId(null)}
          saving={saving}
        />
      )}

      {members.length === 0 && !adding && (
        <p className="font-mono text-xs text-muted-foreground py-6 text-center">No members added yet.</p>
      )}

      {members.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-4 pb-2 border-b border-foreground/10 items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Member</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Show</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Edit</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Del</span>
          </div>
          {members.map(m => (
            <div
              key={m.id}
              className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3 border transition-colors rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] ${
                !m.visible ? 'border-foreground/20 opacity-50' : m.active ? 'border-foreground' : 'border-foreground/40'
              }`}
            >
              <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 ${
                m.active ? 'bg-accent text-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {m.active ? 'Active' : 'Inactive'}
              </span>
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium truncate">{m.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground truncate">{m.role} · {m.team}</p>
              </div>
              <button
                onClick={() => handleToggleVisible(m.id)}
                disabled={saving}
                className={`flex items-center justify-center w-8 h-8 transition-colors ${
                  m.visible ? 'text-foreground hover:text-muted-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
              >
                {m.visible ? <Eye size={18} aria-hidden="true" /> : <EyeSlash size={18} aria-hidden="true" />}
<span className="sr-only">{m.visible ? 'Hide' : 'Show'}</span>
              </button>
              <button
                onClick={() => setEditingId(m.id)}
                className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
              >
                <PencilSimple size={18} aria-hidden="true" />
                <span className="sr-only">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={saving}
                className="flex items-center justify-center w-8 h-8 text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash size={18} aria-hidden="true" />
                <span className="sr-only">Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {!adding && !editingId && (
        <button
          onClick={() => setAdding(true)}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Add member
        </button>
      )}
    </div>
  );
}

// ── Community Stories sub-panel ────────────────────────────────────────────

function StoriesPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [flags, setFlags] = useState<StoryFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [fetchedPosts, fetchedFlags] = await Promise.all([
        fetchAllBlogPosts(),
        fetchStoryFlags(),
      ]);
      setPosts(fetchedPosts);
      setFlags(fetchedFlags);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flagMap = useMemo(() => new Map(flags.map(f => [f.guid, f.flagged])), [flags]);
  const flaggedCount = flags.filter(f => f.flagged).length;

  async function handleToggle(guid: string) {
    const current = flagMap.get(guid) ?? false;
    const next = !current;
    setSaving(true);
    await upsertStoryFlag({ guid, flagged: next });
    setFlags(prev => {
      const exists = prev.find(f => f.guid === guid);
      if (exists) return prev.map(f => f.guid === guid ? { ...f, flagged: next } : f);
      return [...prev, { guid, flagged: next }];
    });
    setSaving(false);
    toast.success(next ? 'Post flagged for Community Stories' : 'Post removed from Community Stories');
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>;
  }

  if (loadError) {
    return (
      <div className="border border-foreground/20 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-8 text-center space-y-3">
        <p className="font-mono text-sm text-muted-foreground">{loadError}</p>
        <button
          onClick={load}
          className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
        Flag any posts you want to include in Community Stories. On each page load, 3 are picked at random from your flagged selection. If nothing is flagged, 3 random posts from the full feed are shown instead.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto] gap-x-6 px-5 pb-2 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Article</span>
          {saving
            ? <span className="font-mono text-[10px] text-muted-foreground animate-pulse">Saving…</span>
            : (
              <button
                onClick={load}
                title="Reload feed"
                className="text-muted-foreground hover:text-foreground hover:rotate-180 transition-all duration-300 cursor-pointer"
              >
                <ArrowClockwise size={14} aria-hidden="true" />
                <span className="sr-only">Refresh</span>
              </button>
            )
          }
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
            Flagged{flaggedCount > 0 ? ` (${flaggedCount})` : ''}
          </span>
        </div>
      </div>

      {/* Post rows */}
      <div className="space-y-3">
        {posts.map(post => {
          const isFlagged = flagMap.get(post.guid) ?? false;
          return (
            <div
              key={post.guid}
              className={`flex items-stretch border rounded-[8px] overflow-hidden transition-colors ${
                isFlagged ? 'border-accent bg-accent/5' : 'border-foreground'
              }`}
            >
              {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="w-36 object-cover shrink-0" />
              )}
              <div className="flex-1 flex items-center gap-6 px-5 py-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isFlagged && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent bg-accent/15 px-1.5 py-0.5 shrink-0">
                        Flagged
                      </span>
                    )}
                    <p className="font-sans font-medium text-sm leading-snug truncate">{post.title}</p>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
                    {post.author} · {formatPubDate(post.pubDate)}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(post.guid)}
                  disabled={saving}
                  title={isFlagged ? 'Remove from Community Stories' : 'Flag for Community Stories'}
                  className={`flex items-center justify-center w-9 h-9 shrink-0 transition-colors ${
                    isFlagged ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Flag
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tools sub-panel ────────────────────────────────────────────────────────

const TOOL_BLANK: Omit<CommunityTool, 'id'> = {
  name: '', description: null, url: null, image_url: null, author: null, author_url: null,
  category: 'community', note: null, active: true, display_order: null,
};

const TOOL_SEEDS: (Omit<CommunityTool, 'id'>)[] = [
  {
    name: 'Contribution Calculator',
    description: 'Track and visualise your contributions to the ALANA ecosystem. See how your work translates into recognition.',
    url: 'https://contributions.the-alana-project.xyz/',
    image_url: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeid5op27w5udlle4b4c6fcclicyiuaye4d3tpfhsteus7wbwdxtmbi',
    author: null, author_url: null, category: 'alana', note: null, active: true, display_order: 0,
  },
  {
    name: 'Creator Pricing',
    description: 'A tool to help creators make their pricing transparent and fair — know your worth and communicate it clearly.',
    url: 'https://creatorpricing.com/',
    image_url: 'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeiasqu72yapwwk7qbjfia43rik2obqkawgugyzdteaaktve4nc6gpa/CPC-Social%20Crawler%20Image.png',
    author: 'Stella Achenbach', author_url: null, category: 'community', note: null, active: true, display_order: 0,
  },
  { name: 'Milanote',  description: null, url: 'https://milanote.com', image_url: null, author: null, author_url: null, category: 'internal_stack', note: 'Visual planning',    active: true, display_order: 0 },
  { name: 'Telegram',  description: null, url: 'https://t.me/+1To9sD5l3T8zMjIy', image_url: null, author: null, author_url: null, category: 'internal_stack', note: 'Community chat',   active: true, display_order: 1 },
  { name: 'Figma',     description: null, url: 'https://figma.com', image_url: null, author: null, author_url: null, category: 'internal_stack', note: 'Design',              active: true, display_order: 2 },
  { name: 'Snapshot',  description: null, url: 'https://snapshot.org/#/s:the-alana-project.eth', image_url: null, author: null, author_url: null, category: 'internal_stack', note: 'Voting platform', active: true, display_order: 3 },
];

const TOOL_CATEGORY_TABS: { id: ToolCategory; label: string }[] = [
  { id: 'alana',          label: 'Built by ALANA' },
  { id: 'community',      label: 'Community Builds' },
  { id: 'internal_stack', label: 'How We Organize' },
];

interface ToolFormValues {
  name: string; description: string; url: string; image_url: string;
  author: string; author_url: string; category: ToolCategory; note: string; active: boolean;
}

function ToolFormFields({
  values, onChange, onSave, onCancel, saving, showCategory, noBorder = false,
}: {
  values: ToolFormValues;
  onChange: (v: ToolFormValues) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  showCategory: boolean;
  noBorder?: boolean;
}) {
  const inp = 'w-full bg-transparent font-sans text-sm border-b border-foreground/20 focus:border-foreground outline-none py-1 mt-1 placeholder:text-muted-foreground/40';
  return (
    <div className={noBorder ? 'space-y-3' : 'border border-accent rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] p-4 space-y-3'}>
      <div className="space-y-3">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name *</label>
          <input autoFocus value={values.name} onChange={e => onChange({ ...values, name: e.target.value })} placeholder="Tool name" className={inp} />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
          <input value={values.description} onChange={e => onChange({ ...values, description: e.target.value })} placeholder="One-line description" className={inp} />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">URL</label>
          <input value={values.url} onChange={e => onChange({ ...values, url: e.target.value })} placeholder="https://…" className="w-full bg-transparent font-mono text-xs border-b border-foreground/20 focus:border-foreground outline-none py-1 mt-1 placeholder:text-muted-foreground/40" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Image URL</label>
          <input value={values.image_url} onChange={e => onChange({ ...values, image_url: e.target.value })} placeholder="https://… (thumbnail)" className="w-full bg-transparent font-mono text-xs border-b border-foreground/20 focus:border-foreground outline-none py-1 mt-1 placeholder:text-muted-foreground/40" />
        </div>
        {showCategory && (
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Category</label>
            <select value={values.category} onChange={e => onChange({ ...values, category: e.target.value as ToolCategory })} className="w-full bg-transparent font-mono text-xs border-b border-foreground/20 focus:border-foreground outline-none py-1.5 mt-1">
              {TOOL_CATEGORY_TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        )}
        {values.category === 'community' && (
          <>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Author</label>
              <input value={values.author} onChange={e => onChange({ ...values, author: e.target.value })} placeholder="Creator's display name" className={inp} />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Author Profile URL</label>
              <input value={values.author_url} onChange={e => onChange({ ...values, author_url: e.target.value })} placeholder="https://linkedin.com/in/… or personal site" className="w-full bg-transparent font-mono text-xs border-b border-foreground/20 focus:border-foreground outline-none py-1 mt-1 placeholder:text-muted-foreground/40" />
            </div>
          </>
        )}
        {values.category === 'internal_stack' && (
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Note</label>
            <input value={values.note} onChange={e => onChange({ ...values, note: e.target.value })} placeholder="e.g. Visual planning" className={inp} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button onClick={onSave} disabled={saving || !values.name.trim()} className="font-mono text-xs px-4 py-2 bg-foreground text-background rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40">
          Save
        </button>
        <button onClick={onCancel} className="font-mono text-xs px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function toFormValues(t: Omit<CommunityTool, 'id'>): ToolFormValues {
  return { name: t.name, description: t.description ?? '', url: t.url ?? '', image_url: t.image_url ?? '', author: t.author ?? '', author_url: t.author_url ?? '', category: t.category, note: t.note ?? '', active: t.active };
}

async function seedTool(seed: Omit<CommunityTool, 'id'>): Promise<{ data: CommunityTool | null; error: string | null }> {
  const first = await upsertCommunityTool(seed);
  if (first.data !== null) return first;
  // Fallback: retry without optional new columns (image_url, author_url) in case they don't exist yet
  const payload: Record<string, unknown> = { ...seed };
  delete payload.image_url;
  delete payload.author_url;
  return upsertCommunityTool(payload as Omit<CommunityTool, 'id'>);
}

function ToolsPanel() {
  const [tools, setTools]           = useState<CommunityTool[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [tableError, setTableError] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('alana');
  const [adding, setAdding]         = useState(false);
  const [addForm, setAddForm]       = useState<ToolFormValues>({ ...toFormValues(TOOL_BLANK), category: 'alana' });
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<ToolFormValues>(toFormValues(TOOL_BLANK));

  const load = useCallback(async () => {
    setLoading(true);
    setTableError(false);
    setWriteError(null);
    const { ok, data } = await fetchCommunityToolsStatus();
    if (!ok) {
      setTableError(true);
      setTools([]);
      setLoading(false);
      return;
    }
    let fetched = data;
    if (fetched.length === 0) {
      const results = await Promise.all(TOOL_SEEDS.map(s => seedTool(s)));
      const firstErr = results.find(r => r.error)?.error ?? null;
      if (firstErr) setWriteError(firstErr);
      fetched = await fetchCommunityTools();
    }
    setTools(fetched);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tools.filter(t => t.category === activeCategory);

  function resetAdd(cat: ToolCategory) {
    setAdding(false);
    setAddForm({ ...toFormValues(TOOL_BLANK), category: cat });
  }

  async function handleAdd() {
    if (!addForm.name.trim()) return;
    setSaving(true);
    setWriteError(null);
    const order = tools.filter(t => t.category === addForm.category).length;
    const payload = {
      ...TOOL_BLANK,
      name:          addForm.name.trim(),
      description:   addForm.description.trim() || null,
      url:           addForm.url.trim() || null,
      image_url:     addForm.image_url.trim() || null,
      author:        addForm.author.trim() || null,
      author_url:    addForm.author_url.trim() || null,
      category:      addForm.category,
      note:          addForm.note.trim() || null,
      display_order: order,
    };
    const { data: created, error } = await seedTool(payload);
    if (created) { setTools(prev => [...prev, created]); toast.success('Tool added'); }
    else { setWriteError(error); toast.error('Failed to save — see error below'); }
    resetAdd(addForm.category);
    setSaving(false);
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.name.trim()) return;
    setSaving(true);
    setWriteError(null);
    const existing = tools.find(t => t.id === id)!;
    const payload = {
      ...existing,
      name:        editForm.name.trim(),
      description: editForm.description.trim() || null,
      url:         editForm.url.trim() || null,
      image_url:   editForm.image_url.trim() || null,
      author:      editForm.author.trim() || null,
      author_url:  editForm.author_url.trim() || null,
      note:        editForm.note.trim() || null,
    };
    const { data: updated, error } = await seedTool(payload);
    if (updated) { setTools(prev => prev.map(t => t.id === id ? updated : t)); toast.success('Tool updated'); }
    else { setWriteError(error); toast.error('Failed to save — see error below'); }
    setEditingId(null);
    setSaving(false);
  }

  async function handleToggleActive(id: string) {
    const tool = tools.find(t => t.id === id)!;
    setSaving(true);
    const { data: updated } = await seedTool({ ...tool, active: !tool.active });
    if (updated) setTools(prev => prev.map(t => t.id === id ? updated : t));
    else setTools(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
    setSaving(false);
    toast.success(tool.active ? 'Tool hidden' : 'Tool visible');
  }

  async function handleDelete(id: string) {
    setSaving(true);
    await deleteCommunityTool(id);
    setTools(prev => prev.filter(t => t.id !== id));
    setSaving(false);
    toast.success('Tool removed');
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">

      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
        Manage the three tool rows on the Community Resources section. Switch category tabs to add or edit tools in each row.
      </p>

      <div className="flex flex-wrap gap-2">
        {TOOL_CATEGORY_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveCategory(t.id); setEditingId(null); resetAdd(t.id); }}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-[2px] border transition-colors ${
              activeCategory === t.id
                ? 'bg-accent text-foreground border-accent'
                : 'border-foreground/20 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tableError && (
        <div className="rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] border border-accent bg-accent/10 p-4 space-y-2">
          <p className="font-mono text-xs text-foreground font-semibold">community_tools table not found</p>
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">Run this SQL in your Supabase dashboard → SQL Editor:</p>
          <pre className="font-mono text-[10px] text-foreground bg-foreground/5 p-3 rounded overflow-x-auto whitespace-pre">{`create table community_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  url text,
  image_url text,
  author text,
  category text not null default 'community',
  note text,
  active boolean not null default true,
  display_order int
);
alter table community_tools disable row level security;`}</pre>
        </div>
      )}

      {writeError && (
        <div className="rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] border border-foreground/30 bg-foreground/5 p-4 space-y-2">
          <p className="font-mono text-xs text-foreground font-semibold">Write failed — Supabase error</p>
          <p className="font-mono text-[10px] text-muted-foreground break-all">{writeError}</p>
          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed pt-1">Run this in Supabase → SQL Editor to fix:</p>
          <pre className="font-mono text-[10px] text-foreground bg-foreground/5 p-3 rounded overflow-x-auto whitespace-pre">{`-- Fix RLS (most common cause):
alter table community_tools disable row level security;

-- Fix missing columns:
alter table community_tools add column if not exists image_url text;
alter table community_tools add column if not exists author_url text;`}</pre>
        </div>
      )}

      {/* Tool list */}
      <div className="space-y-2 w-full">
        {filtered.length === 0 && !adding && (
          <p className="font-mono text-xs text-muted-foreground py-6 text-center">No tools in this category yet.</p>
        )}
        {filtered.map(tool => (
          <div
            key={tool.id}
            className={`border rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] transition-colors ${tool.active ? 'border-foreground' : 'border-foreground/20 opacity-50'}`}
          >
            {editingId === tool.id ? (
              <div className="p-4">
                <ToolFormFields values={editForm} onChange={setEditForm} onSave={() => handleSaveEdit(tool.id)} onCancel={() => setEditingId(null)} saving={saving} showCategory={false} noBorder />
              </div>
            ) : (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium leading-snug">{tool.name}</p>
                  {tool.description && <p className="font-mono text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{tool.description}</p>}
                  {tool.author    && <p className="font-mono text-[10px] text-accent mt-0.5">by {tool.author}</p>}
                  {tool.note      && <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{tool.note}</p>}
                  {tool.url       && <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5 truncate">{tool.url}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingId(tool.id); setEditForm(toFormValues(tool)); }} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <PencilSimple size={18} aria-hidden="true" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button onClick={() => handleToggleActive(tool.id)} disabled={saving} className={`transition-colors p-1 ${tool.active ? 'text-foreground hover:text-muted-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}>
                    {tool.active ? <Eye size={18} aria-hidden="true" /> : <EyeSlash size={18} aria-hidden="true" />}
<span className="sr-only">{tool.active ? 'Hide' : 'Show'}</span>
                  </button>
                  <button onClick={() => handleDelete(tool.id)} disabled={saving} className="text-muted-foreground/40 hover:text-destructive transition-colors p-1">
                    <Trash size={18} aria-hidden="true" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <ToolFormFields
            values={addForm}
            onChange={setAddForm}
            onSave={handleAdd}
            onCancel={() => resetAdd(activeCategory)}
            saving={saving}
            showCategory={true}
          />
        )}
      </div>

      {!adding && !editingId && (
        <button onClick={() => setAdding(true)} className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors">
          Add tool
        </button>
      )}
    </div>
  );
}

// ── Community Panel (wrapper with sub-tabs) ────────────────────────────────

function CommunityPanel() {
  const [subTab, setSubTab] = useState<CommunitySubTab>('ticker');

  const subTabs: { id: CommunitySubTab; label: string }[] = [
    { id: 'ticker',  label: 'Ticker' },
    { id: 'members', label: 'Members' },
    { id: 'stories', label: 'Stories' },
    { id: 'tools',   label: 'Tools' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-0 border-b border-foreground/10">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 h-9 font-mono text-[11px] uppercase tracking-widest transition-colors ${
              subTab === t.id
                ? 'text-foreground border-b-2 border-foreground -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'ticker'  && <TickerPanel />}
      {subTab === 'members' && <MembersPanel />}
      {subTab === 'stories' && <StoriesPanel />}
      {subTab === 'tools'   && <ToolsPanel />}
    </div>
  );
}

// ── Hub Panel ──────────────────────────────────────────────────────────────

const WEBINAR_BLANK: Omit<HubWebinar, 'id'> = {
  title: '', speaker: null, description: null, url: null,
  thumbnail_url: null, event_date: null, active: true, display_order: null,
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function WebinarForm({
  values, onChange, onSave, onCancel, saving,
}: {
  values: Omit<HubWebinar, 'id'> & { id?: string };
  onChange: (v: typeof values) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [fetching, setFetching] = useState(false);
  const inp = 'w-full bg-transparent font-sans text-sm border-b border-foreground/20 focus:border-foreground outline-none py-1 mt-1 placeholder:text-muted-foreground/40';

  async function handleUrlBlur(url: string) {
    if (!url) return;
    const ytId = extractYouTubeId(url);
    if (!ytId) return;
    setFetching(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        onChange({
          ...values,
          url,
          title: values.title || data.title || '',
          thumbnail_url: values.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        });
      }
    } catch { /* silent — user can fill in manually */ }
    setFetching(false);
  }

  return (
    <div className="border border-accent rounded-tl-[4px] rounded-tr-none rounded-br-[10px] rounded-bl-[4px] p-5 space-y-4">
      {/* URL first — auto-fetches on blur */}
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          YouTube / Video URL {fetching && <span className="text-accent ml-2">Fetching…</span>}
        </label>
        <input
          value={values.url ?? ''}
          onChange={e => onChange({ ...values, url: e.target.value || null })}
          onBlur={e => handleUrlBlur(e.target.value)}
          placeholder="https://youtube.com/watch?v=…"
          className={inp}
        />
      </div>

      {/* Thumbnail preview + title */}
      <div className="flex gap-4 items-start">
        {values.thumbnail_url && (
          <img
            src={values.thumbnail_url}
            alt="thumbnail"
            className="w-28 h-16 object-cover rounded-[2px] shrink-0 border border-foreground/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title *</label>
          <input value={values.title} onChange={e => onChange({ ...values, title: e.target.value })} placeholder="Auto-filled from URL" className={inp} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
          <span className={`font-mono text-[10px] ${(values.description?.length ?? 0) >= 200 ? 'text-accent' : 'text-muted-foreground'}`}>
            {values.description?.length ?? 0}/200
          </span>
        </div>
        <textarea
          value={values.description ?? ''}
          onChange={e => onChange({ ...values, description: e.target.value.slice(0, 200) || null })}
          placeholder="Short description (max 200 chars)"
          rows={2}
          maxLength={200}
          className={`${inp} resize-none`}
        />
      </div>


      <div className="flex items-center gap-3 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-xs text-muted-foreground">
          <input type="checkbox" checked={values.active} onChange={e => onChange({ ...values, active: e.target.checked })} className="accent-foreground" />
          Active
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={onCancel} className="font-mono text-xs px-4 py-2 border border-foreground/20 rounded-[4px] hover:border-foreground transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving || !values.title.trim()} className="font-mono text-xs px-4 py-2 bg-foreground text-background rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const WEBINAR_SQL = `-- Run once in Supabase SQL Editor
create table if not exists hub_webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text,
  description text,
  url text,
  thumbnail_url text,
  event_date date,
  active boolean not null default true,
  display_order integer
);
alter table hub_webinars disable row level security;`;

function WebinarsPanel() {
  const [webinars, setWebinars] = useState<HubWebinar[]>([]);
  const [tableError, setTableError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<HubWebinar, 'id'>>(WEBINAR_BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<HubWebinar | null>(null);
  const [saving, setSaving] = useState(false);

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  useEffect(() => {
    fetchHubWebinars().then(({ ok, data }) => {
      if (!ok) setTableError(true);
      else setWebinars(shuffle(data));
    });
  }, []);

  async function save(payload: Omit<HubWebinar, 'id'> & { id?: string }) {
    setSaving(true);
    const { data, error } = await upsertHubWebinar(payload);
    setSaving(false);
    if (error || !data) { toast.error(error ?? 'Save failed'); return false; }
    setWebinars(prev => payload.id ? prev.map(w => w.id === payload.id ? data : w) : shuffle([...prev, data]));
    return true;
  }

  return (
    <div className="space-y-3">
      {tableError && (
        <div className="border border-foreground/20 rounded-[4px] p-5 space-y-3">
          <p className="font-mono text-xs text-foreground/70">Table missing. Run this SQL in Supabase:</p>
          <pre className="font-mono text-[11px] bg-foreground/5 rounded-[4px] p-4 overflow-x-auto whitespace-pre">{WEBINAR_SQL}</pre>
        </div>
      )}

      {adding && (
        <div className="mb-2">
          <WebinarForm values={draft} onChange={setDraft} saving={saving}
            onCancel={() => setAdding(false)}
            onSave={async () => { if (await save(draft)) { setAdding(false); setDraft(WEBINAR_BLANK); } }}
          />
        </div>
      )}

      {webinars.length === 0 && !adding && (
        <p className="font-mono text-xs text-muted-foreground py-6 text-center border border-dashed border-foreground/15 rounded-[4px]">No webinars yet.</p>
      )}

      {webinars.map(w => (
        <div key={w.id}>
          {editingId === w.id && editDraft ? (
            <WebinarForm values={editDraft} onChange={value => setEditDraft(value as HubWebinar)} saving={saving}
              onCancel={() => { setEditingId(null); setEditDraft(null); }}
              onSave={async () => { if (await save(editDraft)) { setEditingId(null); setEditDraft(null); } }}
            />
          ) : (
            <div className={`flex items-stretch border rounded-[8px] overflow-hidden transition-colors ${w.active ? 'border-foreground' : 'border-foreground/20 opacity-50'}`}>
              {w.thumbnail_url && (
                <img src={w.thumbnail_url.replace('hqdefault', 'mqdefault')} alt={w.title} className="w-36 shrink-0 self-stretch object-cover" />
              )}
              <div className="flex-1 flex items-center gap-4 px-5 py-4 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-sm leading-snug truncate">{w.title}</p>
                  {w.description && (
                    <p className="font-mono text-[11px] text-muted-foreground mt-1 line-clamp-2">{w.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingId(w.id); setEditDraft(w); }} className="p-1.5 hover:text-accent transition-colors"><PencilSimple size={18} aria-hidden="true" /><span className="sr-only">Edit</span></button>
                  <button onClick={async () => { await deleteHubWebinar(w.id); setWebinars(prev => prev.filter(x => x.id !== w.id)); }} className="p-1.5 hover:text-red-500 transition-colors"><Trash size={18} aria-hidden="true" /><span className="sr-only">Delete</span></button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {!adding && !editingId && webinars.length < 3 && (
        <button onClick={() => setAdding(true)}
          className="mt-2 font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-[#262424] hover:text-accent hover:border-accent transition-colors"
        >
          Add webinar
        </button>
      )}
      {!adding && !editingId && webinars.length >= 3 && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Max 3 webinars reached — remove one to add another.</p>
      )}
    </div>
  );
}

function HubPanel() {
  return <WebinarsPanel />;
}

function ComingSoonPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-foreground/15 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[280px]">
      <div className="w-px h-8 bg-foreground/20" />
      <div className="space-y-2">
        <p className="font-sans font-medium text-base">{title}</p>
        <p className="font-mono text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-3 py-1">
        Coming soon
      </span>
    </div>
  );
}

// ── Admin Page ─────────────────────────────────────────────────────────────
export function AdminPage() {
  const {
    role,
    guardianSessionStatus,
    guardianSessionError,
    authorizeGuardian,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'blog' | 'hub' | 'community'>('blog');

  if (role !== 'guardian') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-8">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-sans">Nucleus Guardians Only</h2>
          <p className="text-muted-foreground">
            This panel is restricted to Nucleus Guardian NFT holders.
          </p>
        </div>
      </div>
    );
  }

  if (guardianSessionStatus !== 'authorized') {
    const busy =
      guardianSessionStatus === 'checking' || guardianSessionStatus === 'authorizing';

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-8">
        <div className="w-full max-w-md space-y-5 rounded-[4px] border border-foreground bg-background/70 p-8 text-center shadow-lg backdrop-blur-xl">
          <div className="space-y-2">
            <h2 className="text-2xl font-sans">Authorize Guardian Panel</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign a message with your connected wallet. The server will confirm that your
              Nucleus Guardian membership is active on Optimism before granting access.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={busy}
            onClick={() => authorizeGuardian().catch(() => undefined)}
            className="h-11 w-full rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 text-accent-foreground shadow-lg hover:bg-foreground hover:text-accent"
          >
            {busy
              ? 'Verifying membership…'
              : guardianSessionStatus === 'error'
              ? 'Reconnect Guardian Session'
              : 'Sign in as Guardian'}
          </Button>
          {guardianSessionError && (
            <p className="font-mono text-xs text-destructive">{guardianSessionError}</p>
          )}
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Signing is free and does not create a transaction.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'blog',      label: 'Blog' },
    { id: 'hub',       label: 'HUB' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-8 md:px-16 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="font-sans">Guardian Panel</h2>
            </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-foreground/20">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 h-10 font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-accent -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'blog' && <BlogCurationPanel />}
          {activeTab === 'hub' && <HubPanel />}
          {activeTab === 'community' && <CommunityPanel />}
        </div>
      </div>
      <Footer />
    </>
  );
}
