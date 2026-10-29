import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const REST = `https://${projectId}.supabase.co/rest/v1`;

const baseHeaders = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

export interface BlogCuration {
  guid: string;
  visible: boolean;
  display_order: number | null;
  is_hero: boolean;
}

export async function fetchCurations(): Promise<BlogCuration[]> {
  try {
    const res = await fetch(`${REST}/blog_curations?select=guid,visible,display_order,is_hero`, {
      headers: baseHeaders,
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function upsertCuration(entry: BlogCuration): Promise<void> {
  await fetch(`${REST}/blog_curations`, {
    method: 'POST',
    headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(entry),
  });
}

export async function upsertManyCurations(entries: BlogCuration[]): Promise<void> {
  if (entries.length === 0) return;
  await fetch(`${REST}/blog_curations`, {
    method: 'POST',
    headers: { ...baseHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(entries),
  });
}

// Clears any existing hero, then pins the given guid.
export async function setHero(guid: string, currentCurations: BlogCuration[]): Promise<BlogCuration[]> {
  // Clear existing hero
  await fetch(`${REST}/blog_curations?is_hero=eq.true`, {
    method: 'PATCH',
    headers: { ...baseHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ is_hero: false }),
  });

  // Set new hero (upsert so it works even if no row exists yet)
  const existing = currentCurations.find(c => c.guid === guid);
  await upsertCuration({
    guid,
    visible: existing?.visible ?? true,
    display_order: existing?.display_order ?? null,
    is_hero: true,
  });

  return currentCurations
    .map(c => ({ ...c, is_hero: false }))
    .map(c => c.guid === guid ? { ...c, is_hero: true } : c)
    .concat(currentCurations.find(c => c.guid === guid) ? [] : [{ guid, visible: true, display_order: null, is_hero: true }]);
}

export async function clearHero(): Promise<void> {
  await fetch(`${REST}/blog_curations?is_hero=eq.true`, {
    method: 'PATCH',
    headers: { ...baseHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ is_hero: false }),
  });
}

// Applies curation rules to a raw post list:
// - filters hidden posts
// - sorts by display_order (nulls last, preserving original index for ties)
// Returns { sorted, heroGuid }
export function applyCurations<T extends { guid: string }>(
  posts: T[],
  curations: BlogCuration[],
): { sorted: T[]; heroGuid: string | null } {
  const map = new Map(curations.map(c => [c.guid, c]));

  const heroEntry = curations.find(c => c.is_hero);
  const heroGuid = heroEntry ? heroEntry.guid : null;

  const visible = posts.filter(p => {
    const c = map.get(p.guid);
    return !c || c.visible !== false;
  });

  const sorted = [...visible].sort((a, b) => {
    const oa = map.get(a.guid)?.display_order ?? Infinity;
    const ob = map.get(b.guid)?.display_order ?? Infinity;
    return oa - ob;
  });

  return { sorted, heroGuid };
}
