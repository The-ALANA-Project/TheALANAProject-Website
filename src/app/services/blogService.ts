import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-44fc6238`;
const PARAGRAPH_RSS = 'https://api.paragraph.com/blogs/rss/@the-alana-project';
const PARAGRAPH_API_KEY = 'para_ixWvNrN89ZobmhGi4rh85eN8lTB3oisXyKSjUXmjtwI';
const REST = `https://${projectId}.supabase.co/rest/v1`;

// Fetches name→image_url map from community_members table, cached per session.
let memberAvatarCache: Map<string, string> | null = null;
export async function fetchMemberAvatarMap(): Promise<Map<string, string>> {
  if (memberAvatarCache) return memberAvatarCache;
  try {
    const res = await fetch(
      `${REST}/community_members?select=name,image_url&visible=eq.true`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${publicAnonKey}` } },
    );
    if (res.ok) {
      const rows = (await res.json()) as { name: string; image_url: string | null }[];
      memberAvatarCache = new Map(
        rows.filter((r) => r.name && r.image_url).map((r) => [r.name.trim().toLowerCase(), r.image_url!]),
      );
      return memberAvatarCache;
    }
  } catch { /* non-critical */ }
  memberAvatarCache = new Map();
  return memberAvatarCache;
}

export async function lookupMemberAvatar(authorName: string): Promise<string | null> {
  const map = await fetchMemberAvatarMap();
  return map.get(authorName.trim().toLowerCase()) ?? null;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  imageUrl: string;
  author: string;
  authorAvatarUrl: string | null;
  pubDate: string;
  readingTimeMin: number;
  categories: string[];
  originalUrl: string;
  guid: string;
}

// Per-session avatar cache so we don't re-fetch on every navigation
const avatarCache = new Map<string, string | null>();

// Exact Paragraph handles for known contributors.
const AUTHOR_HANDLES: Record<string, string> = {
  'Stella Achenbach': 'stellaachenbach',
  'Shellpen Writes':  'shellpensshell',
  'Sogand':           'sgnobahar',
  'Greyscale':        'greyscale',
  'Lutra':            'lutra',
};

export async function resolveAuthorAvatar(name: string): Promise<string | null> {
  if (avatarCache.has(name)) return avatarCache.get(name)!;

  const knownHandle = AUTHOR_HANDLES[name];
  const slugVariants = knownHandle
    ? [knownHandle]
    : [...new Set([
        name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      ])].filter(Boolean);

  for (const slug of slugVariants) {
    try {
      const res = await timedFetch(`https://paragraph.com/api/blogs/@${slug}`, undefined, 3000);
      if (res.ok) {
        const data = await res.json();
        const url: string | null = data?.user?.avatar_url ?? null;
        if (url) { avatarCache.set(name, url); return url; }
      }
    } catch { /* try next */ }
  }

  avatarCache.set(name, null);
  return null;
}

export function getAuthorInitials(name: string): string {
  return name.split(' ').map((p) => p[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function parseAuthorName(raw: string): string {
  const m = raw.match(/\(([^)]+)\)$/);
  return m ? m[1].trim() : raw.trim();
}

function slugFromUrl(url: string): string {
  return url.split('/').filter(Boolean).pop() ?? url;
}

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.ceil(text.split(' ').filter(Boolean).length / 200));
}

function toExcerpt(raw: string): string {
  const text = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [];
  const four = sentences.slice(0, 4).join('').trim();
  if (four.length >= 80) return four;
  return text.length > 320 ? text.slice(0, 320) + '…' : text;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
}

function getText(el: Element, tag: string): string {
  return el.getElementsByTagName(tag)[0]?.textContent ?? '';
}

// ── Shared RSS item parser ─────────────────────────────────────────────────

function parseRssItem(item: Element): Omit<BlogPost, 'authorAvatarUrl'> & { authorAvatarUrl: null } {
  const title       = getText(item, 'title');
  const link        = getText(item, 'link');
  const description = getText(item, 'description');
  const author      = getText(item, 'author');
  const pubDate     = getText(item, 'pubDate');
  const guid        = getText(item, 'guid');
  const enclosureUrl = item.querySelector('enclosure')?.getAttribute('url') ?? '';
  const categories  = Array.from(item.querySelectorAll('category'))
    .map((c) => c.textContent ?? '').filter(Boolean);

  const contentEl =
    item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0] ||
    item.getElementsByTagName('content:encoded')[0];
  const contentHtml = sanitizeHtml(contentEl?.textContent ?? '');

  const excerpt = (() => {
    const fromContent = toExcerpt(contentHtml);
    if (fromContent.length >= 80) return fromContent;
    const fromDesc = toExcerpt(description);
    return fromDesc.length > fromContent.length ? fromDesc : fromContent;
  })();

  return {
    slug: slugFromUrl(link),
    title,
    excerpt,
    contentHtml,
    imageUrl: enclosureUrl,
    author: parseAuthorName(author),
    authorAvatarUrl: null,
    pubDate,
    readingTimeMin: calcReadingTime(contentHtml || description),
    categories,
    originalUrl: link,
    guid,
  };
}

async function attachAvatars(posts: BlogPost[]): Promise<BlogPost[]> {
  const uniqueAuthors = [...new Set(posts.map((p) => p.author))];
  const avatarEntries = await Promise.all(
    uniqueAuthors.map(async (name) => [name, await resolveAuthorAvatar(name)] as const),
  );
  const avatarMap = new Map(avatarEntries);
  return posts.map((p) => ({ ...p, authorAvatarUrl: p.authorAvatarUrl ?? avatarMap.get(p.author) ?? null }));
}

// ── Fetch strategies ───────────────────────────────────────────────────────

async function timedFetch(url: string, init?: RequestInit, timeoutMs = 7000): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

// Single-page fetch via edge function then direct fallback (used by public blog)
async function fetchRssXml(): Promise<string> {
  try {
    const res = await timedFetch(`${PARAGRAPH_RSS}?limit=100`, undefined, 7000);
    if (res.ok) return res.text();
  } catch { /* fall through */ }

  try {
    const res = await timedFetch(`${BASE}/blog-feed`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (res.ok) return res.text();
  } catch { /* fall through */ }

  throw new Error('Blog feed unavailable. Please try again in a moment.');
}

// Collect RSS items from an XML string, deduplicating by guid.
function collectRssItems(xml: string, seenGuids: Set<string>): Element[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const fresh: Element[] = [];
  for (const item of Array.from(doc.querySelectorAll('item'))) {
    const guid = getText(item, 'guid');
    if (!seenGuids.has(guid)) { seenGuids.add(guid); fresh.push(item); }
  }
  return fresh;
}

// Fetch all published article URLs from the Paragraph sitemap.
// Returns entries with the canonical URL and lastmod date.
async function fetchSitemapEntries(): Promise<Array<{ url: string; lastmod: string }>> {
  const SITEMAP = 'https://paragraph.com/@the-alana-project/sitemap.xml';
  try {
    const res = await timedFetch(SITEMAP, undefined, 10000);
    if (!res.ok) return [];
    const doc = new DOMParser().parseFromString(await res.text(), 'text/xml');

    return Array.from(doc.querySelectorAll('url')).flatMap((el) => {
      const url     = el.querySelector('loc')?.textContent?.trim() ?? '';
      const lastmod = el.querySelector('lastmod')?.textContent?.trim() ?? '';

      // Only include article URLs: must have a segment after @the-alana-project/
      // and that segment must not contain further slashes (no sub-paths).
      const afterHandle = url.split('@the-alana-project/')[1];
      if (!afterHandle || afterHandle.includes('/') || afterHandle === '') return [];

      return [{ url, lastmod }];
    });
  } catch {
    return [];
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

let cache: BlogPost[] | null = null;

// Used by the public blog page — edge function first, fast.
export async function fetchBlogPosts(force = false): Promise<BlogPost[]> {
  if (cache && !force) return cache;
  const xml = await fetchRssXml();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const parsed = Array.from(doc.querySelectorAll('item')).map(parseRssItem) as BlogPost[];
  const posts = await attachAvatars(parsed);
  cache = posts;
  return posts;
}

// Map a raw Paragraph API post object to BlogPost.
function mapParagraphPost(p: Record<string, unknown>): BlogPost | null {
  const title = String(p.title ?? '').trim();
  const slug  = String(p.slug ?? '').trim();
  if (!title || !slug) return null;

  const link    = String(p.url ?? p.canonicalUrl ?? `https://paragraph.com/@the-alana-project/${slug}`);
  const desc    = String(p.subtitle ?? p.excerpt ?? p.description ?? '');
  const html    = sanitizeHtml(String(p.content ?? p.contentHtml ?? p.body ?? p.html ?? ''));
  const image   = String(p.imageUrl ?? p.coverImage ?? p.cover_image ?? p.image ?? p.thumbnail ?? '');

  // publishedAt comes as a Unix millisecond timestamp string from the Paragraph API.
  const rawDate = (() => {
    const raw = String(p.publishedAt ?? p.published_at ?? p.createdAt ?? p.created_at ?? '');
    const ms = Number(raw);
    return (!isNaN(ms) && ms > 1e11) ? new Date(ms).toISOString() : raw;
  })();

  // Paragraph API returns `authors` as an array; each entry has name + avatarUrl inline.
  const authors = Array.isArray(p.authors) ? p.authors as Record<string, unknown>[] : [];
  const primaryAuthor = authors[0] ?? {};
  const authorName = String(primaryAuthor.name ?? p.authorName ?? p.author_name ?? '').trim();
  const avatarUrl = String(primaryAuthor.avatarUrl ?? primaryAuthor.avatar_url ?? '') || null;

  const cats = Array.isArray(p.tags) ? (p.tags as unknown[]).map(String).filter(Boolean) : [];

  return {
    slug,
    title,
    excerpt: toExcerpt(html || desc),
    contentHtml: html,
    imageUrl: image,
    author: authorName || 'ALANA',
    authorAvatarUrl: avatarUrl as string | null,
    pubDate: rawDate,
    readingTimeMin: calcReadingTime(html || desc),
    categories: cats,
    originalUrl: link,
    guid: String(p.id ?? link),
  };
}

// Try Paragraph's posts API directly, attempting known URL patterns until one works.
async function fetchPostsFromParagraphApi(apiKey?: string): Promise<BlogPost[] | null> {
  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const BASE_CANDIDATES = [
    'https://public.api.paragraph.com/api/v1/posts?publicationSlug=the-alana-project',
  ];

  for (const base of BASE_CANDIDATES) {
    try {
      const allPosts: BlogPost[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(base);
        url.searchParams.set('limit', '50');
        if (cursor) url.searchParams.set('cursor', cursor);

        const res = await timedFetch(url.toString(), { headers }, 15000);
        const text = await res.text();
        if (!res.ok) break;

        const data = JSON.parse(text) as Record<string, unknown>;
        const page = (Array.isArray(data.items) ? data.items : []) as Record<string, unknown>[];
        const mapped = page.map(mapParagraphPost).filter((p): p is BlogPost => p !== null);
        allPosts.push(...mapped);

        const pagination = data.pagination as Record<string, unknown> | undefined;
        cursor  = pagination?.cursor as string | undefined;
        hasMore = !!(pagination?.hasMore) && page.length > 0;
      }

      if (allPosts.length > 0) return allPosts;
    } catch (err) {
      console.error(`[blogService] paragraph-api error (${base}):`, err);
    }
  }
  return null;
}

// Paragraph API → RSS fallback.
export async function fetchAllBlogPosts(): Promise<BlogPost[]> {
  const fromApi = await fetchPostsFromParagraphApi(PARAGRAPH_API_KEY);
  if (fromApi && fromApi.length > 0) return fromApi;
  return fetchBlogPosts(true);
}

export function formatPubDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
