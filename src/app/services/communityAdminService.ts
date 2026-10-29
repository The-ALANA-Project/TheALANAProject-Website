import { decodeFunctionResult, encodeFunctionData } from 'viem';
import {
  fetchManagedResource,
  mutateGuardianResource,
  uploadGuardianMemberImage,
} from './guardianApi';

// ── Image upload ───────────────────────────────────────────────────────────

export async function uploadMemberImage(file: File): Promise<string | null> {
  try {
    return await uploadGuardianMemberImage(file);
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

const validKeyAbi = [{
  inputs: [{ name: '_user', type: 'address' }],
  name: 'getHasValidKey',
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
}] as const;

export async function detectNFTRole(wallet: string): Promise<{ role: string; active: boolean } | null> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) return null;
  try {
    const results = await Promise.all(
      NFT_CONTRACTS.map(async (c) => {
        const res = await fetch(OPTIMISM_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'eth_call',
            params: [{
              to: c.address,
              data: encodeFunctionData({
                abi: validKeyAbi,
                functionName: 'getHasValidKey',
                args: [wallet as `0x${string}`],
              }),
            }, 'latest'],
            id: 1,
          }),
        });
        const data = await res.json();
        const active = data.result
          ? decodeFunctionResult({
              abi: validKeyAbi,
              functionName: 'getHasValidKey',
              data: data.result,
            })
          : false;
        return { role: c.role, active };
      }),
    );
    const match = results.find(r => r.active);
    return match ? { role: match.role, active: true } : { role: '', active: false };
  } catch {
    return null;
  }
}

// ── Ticker ─────────────────────────────────────────────────────────────────

export interface TickerItem {
  id: string;
  text: string;
  display_order: number;
  active: boolean;
}

export async function fetchTickerItems(): Promise<TickerItem[]> {
  try {
    return await fetchManagedResource<TickerItem>('ticker');
  } catch {
    return [];
  }
}

export async function upsertTickerItem(item: Omit<TickerItem, 'id'> & { id?: string }): Promise<TickerItem | null> {
  try {
    return await mutateGuardianResource<TickerItem>('upsert', 'ticker', item);
  } catch {
    return null;
  }
}

export async function deleteTickerItem(id: string): Promise<void> {
  await mutateGuardianResource('delete', 'ticker', { id });
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
    return await fetchManagedResource<CommunityMember>('members');
  } catch {
    return [];
  }
}

export async function upsertCommunityMember(
  member: Omit<CommunityMember, 'id'> & { id?: string },
): Promise<CommunityMember | null> {
  try {
    return await mutateGuardianResource<CommunityMember>('upsert', 'members', member);
  } catch {
    return null;
  }
}

export async function deleteCommunityMember(id: string): Promise<void> {
  await mutateGuardianResource('delete', 'members', { id });
}

// ── Community Stories ──────────────────────────────────────────────────────

export interface StoryFlag {
  guid: string;
  flagged: boolean;
}

export async function fetchStoryFlags(): Promise<StoryFlag[]> {
  try {
    return await fetchManagedResource<StoryFlag>('story-flags');
  } catch {
    return [];
  }
}

export async function upsertStoryFlag(entry: StoryFlag): Promise<void> {
  await mutateGuardianResource('upsert', 'story-flags', entry);
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
    return await fetchManagedResource<CommunityTool>('tools');
  } catch {
    return [];
  }
}

export async function fetchCommunityToolsStatus(): Promise<{ ok: boolean; data: CommunityTool[] }> {
  try {
    return { ok: true, data: await fetchManagedResource<CommunityTool>('tools') };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertCommunityTool(
  tool: Omit<CommunityTool, 'id'> & { id?: string },
): Promise<{ data: CommunityTool | null; error: string | null }> {
  try {
    return {
      data: await mutateGuardianResource<CommunityTool>('upsert', 'tools', tool),
      error: null,
    };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteCommunityTool(id: string): Promise<void> {
  await mutateGuardianResource('delete', 'tools', { id });
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
    return { ok: true, data: await fetchManagedResource<HubWebinar>('webinars') };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertHubWebinar(
  item: Omit<HubWebinar, 'id'> & { id?: string },
): Promise<{ data: HubWebinar | null; error: string | null }> {
  try {
    return {
      data: await mutateGuardianResource<HubWebinar>('upsert', 'webinars', item),
      error: null,
    };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteHubWebinar(id: string): Promise<void> {
  await mutateGuardianResource('delete', 'webinars', { id });
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
    return { ok: true, data: await fetchManagedResource<HubOnboardingItem>('onboarding') };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function upsertHubOnboardingItem(
  item: Omit<HubOnboardingItem, 'id'> & { id?: string },
): Promise<{ data: HubOnboardingItem | null; error: string | null }> {
  try {
    return {
      data: await mutateGuardianResource<HubOnboardingItem>('upsert', 'onboarding', item),
      error: null,
    };
  } catch (e) {
    return { data: null, error: String(e) };
  }
}

export async function deleteHubOnboardingItem(id: string): Promise<void> {
  await mutateGuardianResource('delete', 'onboarding', { id });
}
