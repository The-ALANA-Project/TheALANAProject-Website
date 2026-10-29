import { fetchManagedResource, mutateGuardianResource } from './guardianApi';

export interface BlogCuration {
  guid: string;
  visible: boolean;
  display_order: number | null;
  is_hero: boolean;
}

export async function fetchCurations(): Promise<BlogCuration[]> {
  try {
    return await fetchManagedResource<BlogCuration>('curations');
  } catch {
    return [];
  }
}

export async function upsertCuration(entry: BlogCuration): Promise<void> {
  await mutateGuardianResource('upsert', 'curations', entry);
}

export async function upsertManyCurations(entries: BlogCuration[]): Promise<void> {
  if (entries.length === 0) return;
  await mutateGuardianResource('upsertMany', 'curations', entries);
}

// Clears any existing hero, then pins the given guid.
export async function setHero(guid: string, currentCurations: BlogCuration[]): Promise<BlogCuration[]> {
  await mutateGuardianResource('setHero', 'curations', { guid });

  return currentCurations
    .map(c => ({ ...c, is_hero: false }))
    .map(c => c.guid === guid ? { ...c, is_hero: true } : c)
    .concat(currentCurations.find(c => c.guid === guid) ? [] : [{ guid, visible: true, display_order: null, is_hero: true }]);
}

export async function clearHero(): Promise<void> {
  await mutateGuardianResource('clearHero', 'curations');
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
