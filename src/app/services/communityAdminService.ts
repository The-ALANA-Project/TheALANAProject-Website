import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const REST = `https://${projectId}.supabase.co/rest/v1`;
const STORAGE = `https://${projectId}.supabase.co/storage/v1`;

// ── Image upload ───────────────────────────────────────────────────────────

export async function uploadMemberImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  try {
    const res = await fetch(`${STORAGE}/object/community-members/${filename}`, {
      method: 'POST',
      headers: {
        apikey: publicAnonKey,
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': file.type,
        'Cache-Control': '3600',
      },
      body: file,
    });
    if (!res.ok) return null;
    return `${STORAGE}/object/public/community-members/${filename}`;
  } catch {
    return null;
  }
}

// ── NFT role detection ─────────────────────────────────────────────────────

const OPTIMISM_RPC = 'https://mainnet.optimism.io';

const NFT_CONTRACTS = [
  { address: '0x1093a86C1dcB9F8346ce7657C766802326598D8d', role: 'Nucleus Guardian' },
  { address: '0xa6eeABe3f6999C08fEf8f0d44D7AaaB2D28042CD', role: 'Nucleus Specialist' },
  { address: '0x89216a198344d198eA26325C400F8417b6dc9D8C', role: 'Nucleus Apprentice' },
] as const;

export async function detectNFTRole(wallet: string): Promise<{ role: string; active: boolean } | null> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) return null;
  const padded = wallet.slice(2).toLowerCase().padStart(64, '0');
  try {
    const results = await Promise.all(
      NFT_CONTRACTS.map(async (c) => {
        const res = await fetch(OPTIMISM_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'eth_call',
            params: [{ to: c.address, data: `0x70a08231${padded}` }, 'latest'],
            id: 1,
          }),
        });
        const data = await res.json();
        const balance = parseInt(data.result ?? '0x0', 16);
        return { role: c.role, balance };
      }),
    );
    const match = results.find(r => r.balance > 0);
    return match ? { role: match.role, active: true } : { role: '', active: false };
  } catch {
    return null;
  }
}

const baseHeaders = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

// ── Ticker ─────────────────────────────────────────────────────────────────

export interface TickerItem {
  id: string;
  text: string;
  display_order: number;
  active: boolean;
}

export async function fetchTickerItems(): Promise<TickerItem[]> {
  try {
    const res = await fetch(
      `${REST}/community_ticker_items?select=id,text,display_order,active&order=display_order.asc`,
      { headers: baseHeaders },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function upsertTickerItem(item: Omit<TickerItem, 'id'> & { id?: string }): Promise<TickerItem | null> {
  try {
    const res = await fetch(`${REST}/community_ticker_items`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(item),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows[0] : rows;
  } catch {
    return null;
  }
}

export async function deleteTickerItem(id: string): Promise<void> {
  try {
    await fetch(`${REST}/community_ticker_items?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: baseHeaders,
    });
  } catch { /* silent */ }
}

// ── Members ────────────────────────────────────────────────────────────────

export interface CommunityMember {
  id: string;
  wallet_address: string;
  name: string;
  role: string;
  team: string;
  skills: string[];
  active: boolean;
  bio: string;
  image_url: string;
  social_url: string;
  website_url: string;
  visible: boolean;
  display_order: number | null;
}

export async function fetchCommunityMembers(): Promise<CommunityMember[]> {
  try {
    const res = await fetch(
      `${REST}/community_members?select=id,wallet_address,name,role,team,skills,active,bio,image_url,social_url,website_url,visible,display_order&order=display_order.asc.nullslast`,
      { headers: baseHeaders },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function upsertCommunityMember(
  member: Omit<CommunityMember, 'id'> & { id?: string },
): Promise<CommunityMember | null> {
  try {
    const res = await fetch(`${REST}/community_members`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(member),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows[0] : rows;
  } catch {
    return null;
  }
}

export async function deleteCommunityMember(id: string): Promise<void> {
  try {
    await fetch(`${REST}/community_members?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: baseHeaders,
    });
  } catch { /* silent */ }
}

// ── Community Stories ──────────────────────────────────────────────────────

export interface StoryFlag {
  guid: string;
  flagged: boolean;
}

export async function fetchStoryFlags(): Promise<StoryFlag[]> {
  try {
    const res = await fetch(
      `${REST}/community_story_flags?select=guid,flagged`,
      { headers: baseHeaders },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function upsertStoryFlag(entry: StoryFlag): Promise<void> {
  try {
    await fetch(`${REST}/community_story_flags`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(entry),
    });
  } catch { /* silent */ }
}

// ── Community Tools ────────────────────────────────────────────────────────

export type ToolCategory = 'alana' | 'community' | 'internal_stack';

export interface CommunityTool {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  author: string | null;
  author_url: string | null;
  category: ToolCategory;
  note: string | null;
  active: boolean;
  display_order: number | null;
}

export async function fetchCommunityTools(): Promise<CommunityTool[]> {
  try {
    const res = await fetch(
      `${REST}/community_tools?select=*&order=display_order.asc.nullslast`,
      { headers: baseHeaders },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchCommunityToolsStatus(): Promise<{ ok: boolean; data: CommunityTool[] }> {
  try {
    const res = await fetch(
      `${REST}/community_tools?select=*&order=display_order.asc.nullslast`,
      { headers: baseHeaders },
    );
    if (!res.ok) return { ok: false, data: [] };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertCommunityTool(
  tool: Omit<CommunityTool, 'id'> & { id?: string },
): Promise<{ data: CommunityTool | null; error: string | null }> {
  try {
    const res = await fetch(`${REST}/community_tools`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(tool),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message ?? body?.error ?? `HTTP ${res.status}`;
      return { data: null, error: msg };
    }
    const rows = await res.json();
    return { data: Array.isArray(rows) ? rows[0] : rows, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteCommunityTool(id: string): Promise<void> {
  try {
    await fetch(`${REST}/community_tools?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: baseHeaders,
    });
  } catch { /* silent */ }
}

// ── Hub Webinars ───────────────────────────────────────────────────────────────

export interface HubWebinar {
  id: string;
  title: string;
  speaker: string | null;
  description: string | null;
  url: string | null;
  thumbnail_url: string | null;
  event_date: string | null;
  active: boolean;
  display_order: number | null;
}

export async function fetchHubWebinars(): Promise<{ ok: boolean; data: HubWebinar[] }> {
  try {
    const res = await fetch(
      `${REST}/hub_webinars?select=*&order=display_order.asc.nullslast`,
      { headers: baseHeaders },
    );
    if (!res.ok) return { ok: false, data: [] };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertHubWebinar(
  item: Omit<HubWebinar, 'id'> & { id?: string },
): Promise<{ data: HubWebinar | null; error: string | null }> {
  try {
    const res = await fetch(`${REST}/hub_webinars`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body?.message ?? body?.error ?? `HTTP ${res.status}` };
    }
    const rows = await res.json();
    return { data: Array.isArray(rows) ? rows[0] : rows, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteHubWebinar(id: string): Promise<void> {
  try {
    await fetch(`${REST}/hub_webinars?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: baseHeaders,
    });
  } catch { /* silent */ }
}

// ── Hub Onboarding ─────────────────────────────────────────────────────────────

export interface HubOnboardingItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  active: boolean;
  display_order: number | null;
}

export async function fetchHubOnboarding(): Promise<{ ok: boolean; data: HubOnboardingItem[] }> {
  try {
    const res = await fetch(
      `${REST}/hub_onboarding?select=*&order=display_order.asc.nullslast`,
      { headers: baseHeaders },
    );
    if (!res.ok) return { ok: false, data: [] };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertHubOnboardingItem(
  item: Omit<HubOnboardingItem, 'id'> & { id?: string },
): Promise<{ data: HubOnboardingItem | null; error: string | null }> {
  try {
    const res = await fetch(`${REST}/hub_onboarding`, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body?.message ?? body?.error ?? `HTTP ${res.status}` };
    }
    const rows = await res.json();
    return { data: Array.isArray(rows) ? rows[0] : rows, error: null };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteHubOnboardingItem(id: string): Promise<void> {
  try {
    await fetch(`${REST}/hub_onboarding?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: baseHeaders,
    });
  } catch { /* silent */ }
}
