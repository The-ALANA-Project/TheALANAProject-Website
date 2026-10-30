import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";
import { Hono } from "npm:hono";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import {
  createPublicClient,
  http,
} from "npm:viem@2.52.0";
import { optimism } from "npm:viem@2.52.0/chains";

const ROUTE_PREFIX = "/alana-website-guardian";
const GUARDIAN_CONTRACT = "0x1093a86C1dcB9F8346ce7657C766802326598D8d";
const SESSION_MINUTES = 30;
const NONCE_MINUTES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const PARAGRAPH_CACHE_MS = 5 * 60_000;
const PARAGRAPH_MAX_PAGES = 20;
const PARAGRAPH_POSTS_URL =
  "https://public.api.paragraph.com/api/v1/posts?publicationSlug=the-alana-project";

let paragraphPostsCache: {
  data: Record<string, unknown>[];
  expiresAt: number;
} | null = null;
let paragraphPostsRequest: Promise<Record<string, unknown>[]> | null = null;

const paragraphPostFields = [
  "id",
  "title",
  "slug",
  "url",
  "canonicalUrl",
  "subtitle",
  "excerpt",
  "description",
  "content",
  "contentHtml",
  "body",
  "html",
  "imageUrl",
  "coverImage",
  "cover_image",
  "image",
  "thumbnail",
  "publishedAt",
  "published_at",
  "createdAt",
  "created_at",
  "authorName",
  "author_name",
  "tags",
] as const;

function sanitizeParagraphPost(
  post: Record<string, unknown>,
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const field of paragraphPostFields) {
    if (post[field] !== undefined) clean[field] = post[field];
  }

  if (Array.isArray(post.authors)) {
    clean.authors = post.authors.flatMap((author) => {
      if (!author || typeof author !== "object" || Array.isArray(author)) return [];
      const value = author as Record<string, unknown>;
      return [{
        name: value.name,
        avatarUrl: value.avatarUrl,
        avatar_url: value.avatar_url,
      }];
    });
  }

  return clean;
}

const guardianAbi = [{
  inputs: [{ name: "_user", type: "address" }],
  name: "getHasValidKey",
  outputs: [{ name: "", type: "bool" }],
  stateMutability: "view",
  type: "function",
}] as const;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const optimismClient = createPublicClient({
  chain: optimism,
  transport: http(Deno.env.get("OPTIMISM_RPC_URL") || "https://mainnet.optimism.io"),
});

const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "https://the-alana-project.xyz",
  "https://www.the-alana-project.xyz",
  ...configuredOrigins,
]);

function originAllowed(origin: string): boolean {
  if (allowedOrigins.has(origin)) return true;
  try {
    const url = new URL(origin);
    return (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

function jsonError(c: any, status: number, error: string) {
  return c.json({ error }, status);
}

function isWalletAddress(value: unknown): value is `0x${string}` {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

function addMinutes(date: Date, minutes: number): string {
  return new Date(date.getTime() + minutes * 60_000).toISOString();
}

function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hasActiveGuardianKey(walletAddress: `0x${string}`): Promise<boolean> {
  return optimismClient.readContract({
    address: GUARDIAN_CONTRACT,
    abi: guardianAbi,
    functionName: "getHasValidKey",
    args: [walletAddress],
  });
}

async function enforceRateLimit(
  walletAddress: string,
  action: string,
  limit: number,
): Promise<boolean> {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await supabase
    .from("guardian_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("wallet_address", walletAddress.toLowerCase())
    .eq("action", action)
    .gte("created_at", since);

  if (error || (count ?? 0) >= limit) return false;

  const { error: insertError } = await supabase
    .from("guardian_rate_limits")
    .insert({
      wallet_address: walletAddress.toLowerCase(),
      action,
    });

  return !insertError;
}

async function audit(
  walletAddress: string,
  action: string,
  resource: string,
  recordId: string | null,
  success: boolean,
  requestId: string,
  errorMessage?: string,
) {
  await supabase.from("guardian_audit_log").insert({
    wallet_address: walletAddress.toLowerCase(),
    action,
    resource,
    record_id: recordId,
    success,
    request_id: requestId,
    error_message: errorMessage?.slice(0, 500) ?? null,
  });
}

async function requireGuardian(c: any): Promise<{
  walletAddress: `0x${string}`;
  sessionId: string;
} | null> {
  const token = c.req.header("X-Guardian-Session");
  if (!token) return null;

  const tokenHash = await sha256(token);
  const { data: session, error } = await supabase
    .from("guardian_sessions")
    .select("id,wallet_address,origin,expires_at,revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const requestOrigin = c.req.header("Origin") || "";
  if (
    error ||
    !session ||
    session.revoked_at ||
    !originAllowed(requestOrigin) ||
    session.origin !== requestOrigin ||
    Date.parse(session.expires_at) <= Date.now() ||
    !isWalletAddress(session.wallet_address)
  ) {
    return null;
  }

  if (!(await hasActiveGuardianKey(session.wallet_address))) {
    await supabase
      .from("guardian_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", session.id);
    return null;
  }

  await supabase
    .from("guardian_sessions")
    .update({ last_verified_at: new Date().toISOString() })
    .eq("id", session.id);

  return {
    walletAddress: session.wallet_address,
    sessionId: session.id,
  };
}

type ManagedResource =
  | "curations"
  | "ticker"
  | "members"
  | "story-flags"
  | "tools"
  | "webinars"
  | "onboarding"
  | "whitepaper";

const resourceConfig: Record<ManagedResource, {
  table: string;
  key: string;
  fields: readonly string[];
}> = {
  curations: {
    table: "blog_curations",
    key: "guid",
    fields: ["guid", "visible", "display_order", "is_hero"],
  },
  ticker: {
    table: "community_ticker_items",
    key: "id",
    fields: ["id", "text", "display_order", "active"],
  },
  members: {
    table: "community_members",
    key: "id",
    fields: [
      "id", "wallet_address", "name", "role", "team", "skills", "active",
      "bio", "image_url", "social_url", "website_url", "visible", "display_order",
    ],
  },
  "story-flags": {
    table: "community_story_flags",
    key: "guid",
    fields: ["guid", "flagged"],
  },
  tools: {
    table: "community_tools",
    key: "id",
    fields: [
      "id", "name", "description", "url", "image_url", "author", "author_url",
      "category", "note", "active", "display_order",
    ],
  },
  webinars: {
    table: "hub_webinars",
    key: "id",
    fields: [
      "id", "title", "speaker", "description", "url", "thumbnail_url",
      "event_date", "active", "display_order",
    ],
  },
  onboarding: {
    table: "hub_onboarding",
    key: "id",
    fields: ["id", "title", "description", "url", "active", "display_order"],
  },
  whitepaper: {
    table: "whitepaper_sections",
    key: "anchor",
    fields: ["anchor", "content"],
  },
};

function isManagedResource(value: string): value is ManagedResource {
  return Object.hasOwn(resourceConfig, value);
}

function validateUrl(value: string): boolean {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizePayload(
  resource: ManagedResource,
  input: unknown,
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid payload");
  }

  const config = resourceConfig[resource];
  const payload = input as Record<string, unknown>;
  const unknownFields = Object.keys(payload).filter((key) => !config.fields.includes(key));
  if (unknownFields.length > 0) {
    throw new Error(`Unexpected field: ${unknownFields[0]}`);
  }

  const clean: Record<string, unknown> = {};
  const booleanFields = new Set(["visible", "is_hero", "active", "flagged"]);
  const numberFields = new Set(["display_order"]);
  for (const field of config.fields) {
    const value = payload[field];
    if (value === undefined || (field === "id" && value === "")) continue;

    if (value === null) {
      clean[field] = value;
      continue;
    }

    if (field === "skills") {
      if (
        !Array.isArray(value) ||
        value.length > 32 ||
        value.some((item) => typeof item !== "string" || item.length > 80)
      ) {
        throw new Error("Invalid skills");
      }
    } else if (booleanFields.has(field)) {
      if (typeof value !== "boolean") throw new Error(`Invalid ${field}`);
    } else if (numberFields.has(field)) {
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 10_000
      ) {
        throw new Error(`Invalid ${field}`);
      }
    } else {
      if (typeof value !== "string") throw new Error(`Invalid ${field}`);
      const max = field === "content"
        ? 250_000
        : field === "bio" || field === "description"
        ? 5_000
        : 2_048;
      if (value.length > max) throw new Error(`${field} is too long`);
      if (field.includes("url") && value && !validateUrl(value)) {
        throw new Error(`${field} must be an HTTP or HTTPS URL`);
      }
      if (field === "wallet_address" && value && !isWalletAddress(value)) {
        throw new Error("Invalid wallet address");
      }
      if (
        field === "category" &&
        !["alana", "community", "internal_stack"].includes(value)
      ) {
        throw new Error("Invalid category");
      }
    }

    clean[field] = value;
  }

  return clean;
}

async function fetchPublicResource(resource: string, anchor?: string) {
  switch (resource) {
    case "curations":
      return supabase
        .from("blog_curations")
        .select("guid,visible,display_order,is_hero")
        .order("display_order", { ascending: true, nullsFirst: false });
    case "ticker":
      return supabase
        .from("community_ticker_items")
        .select("id,text,display_order,active")
        .eq("active", true)
        .order("display_order");
    case "members":
      return supabase
        .from("community_members")
        .select("id,name,role,team,skills,active,bio,image_url,social_url,website_url,visible,display_order")
        .eq("visible", true)
        .order("display_order", { ascending: true, nullsFirst: false });
    case "member-avatars":
      return supabase
        .from("community_members")
        .select("name,image_url")
        .eq("visible", true);
    case "story-flags":
      return supabase
        .from("community_story_flags")
        .select("guid,flagged")
        .eq("flagged", true);
    case "tools":
      return supabase
        .from("community_tools")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true, nullsFirst: false });
    case "webinars":
      return supabase
        .from("hub_webinars")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true, nullsFirst: false });
    case "onboarding":
      return supabase
        .from("hub_onboarding")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true, nullsFirst: false });
    case "whitepaper": {
      let query = supabase.from("whitepaper_sections").select("anchor,content");
      if (anchor) query = query.eq("anchor", anchor);
      return query;
    }
    default:
      return { data: null, error: new Error("Unknown resource") };
  }
}

async function fetchAdminResource(resource: ManagedResource) {
  const config = resourceConfig[resource];
  let query = supabase.from(config.table).select(config.fields.join(","));
  if (resource === "ticker") query = query.order("display_order");
  if (
    resource === "members" ||
    resource === "tools" ||
    resource === "webinars" ||
    resource === "onboarding" ||
    resource === "curations"
  ) {
    query = query.order("display_order", { ascending: true, nullsFirst: false });
  }
  return query;
}

async function fetchParagraphPosts(): Promise<Record<string, unknown>[]> {
  if (paragraphPostsCache && paragraphPostsCache.expiresAt > Date.now()) {
    return paragraphPostsCache.data;
  }
  if (paragraphPostsRequest) return paragraphPostsRequest;

  paragraphPostsRequest = (async () => {
    const apiKey = Deno.env.get("PARAGRAPH_API_KEY")?.trim();
    if (!apiKey) throw new Error("Paragraph API is not configured");

    const posts: Record<string, unknown>[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | null = null;

    for (let pageNumber = 0; pageNumber < PARAGRAPH_MAX_PAGES; pageNumber += 1) {
      const url = new URL(PARAGRAPH_POSTS_URL);
      url.searchParams.set("limit", "50");
      url.searchParams.set("includeContent", "true");
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`Paragraph API returned ${response.status}`);
      }

      const body = await response.json() as Record<string, unknown>;
      const rawPage = Array.isArray(body.posts)
        ? body.posts
        : Array.isArray(body.items)
        ? body.items
        : [];
      const page = rawPage
        .filter((item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item)
        );
      posts.push(...page.map(sanitizeParagraphPost));

      const pagination =
        body.pagination && typeof body.pagination === "object"
          ? body.pagination as Record<string, unknown>
          : {};
      const nextCursorValue = pagination.nextCursor ?? pagination.cursor;
      const nextCursor =
        typeof nextCursorValue === "string" && nextCursorValue
          ? nextCursorValue
          : null;
      const hasMore = pagination.hasMore === true;

      if (!hasMore || page.length === 0 || !nextCursor || seenCursors.has(nextCursor)) {
        break;
      }
      seenCursors.add(nextCursor);
      cursor = nextCursor;
    }

    if (posts.length === 0) throw new Error("Paragraph API returned no posts");
    paragraphPostsCache = {
      data: posts,
      expiresAt: Date.now() + PARAGRAPH_CACHE_MS,
    };
    return posts;
  })();

  try {
    return await paragraphPostsRequest;
  } finally {
    paragraphPostsRequest = null;
  }
}

const app = new Hono();
app.use("*", logger(console.log));

app.use("*", async (c, next) => {
  const origin = c.req.header("Origin") || "";
  const isPublicRoute =
    c.req.path.startsWith(`${ROUTE_PREFIX}/public/`) ||
    c.req.path === `${ROUTE_PREFIX}/health`;
  const allowed = isPublicRoute || (origin && originAllowed(origin));

  if (origin && allowed) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, apikey, X-Guardian-Session",
    );
    c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    c.header("Access-Control-Max-Age", "600");
  }

  if (c.req.method === "OPTIONS") {
    return allowed ? c.body(null, 204) : jsonError(c, 403, "Origin not allowed");
  }

  await next();
});

app.get(`${ROUTE_PREFIX}/health`, (c) => c.json({ status: "ok" }));

app.post(`${ROUTE_PREFIX}/auth/nonce`, async (c) => {
  const origin = c.req.header("Origin") || "";
  if (!originAllowed(origin)) return jsonError(c, 403, "Origin not allowed");

  const body = await c.req.json().catch(() => ({}));
  const walletAddress = body.walletAddress;
  if (!isWalletAddress(walletAddress)) return jsonError(c, 400, "Invalid wallet address");
  if (!(await enforceRateLimit(walletAddress, "auth.nonce", 10))) {
    return jsonError(c, 429, "Too many authorization attempts");
  }

  const now = new Date();
  const expiresAt = addMinutes(now, NONCE_MINUTES);
  const nonce = randomToken(16);
  const domain = new URL(origin).host;
  const message = [
    `${domain} wants you to sign in with your Ethereum account:`,
    walletAddress,
    "",
    "Authorize access to The ALANA Project Guardian Panel.",
    "",
    `URI: ${origin}`,
    "Version: 1",
    `Chain ID: ${optimism.id}`,
    `Nonce: ${nonce}`,
    `Issued At: ${now.toISOString()}`,
    `Expiration Time: ${expiresAt}`,
  ].join("\n");

  const { error } = await supabase.from("guardian_nonces").insert({
    nonce_hash: await sha256(nonce),
    wallet_address: walletAddress.toLowerCase(),
    origin,
    message,
    expires_at: expiresAt,
  });
  if (error) return jsonError(c, 500, "Unable to create authorization request");

  return c.json({ message, expiresAt });
});

app.post(`${ROUTE_PREFIX}/auth/verify`, async (c) => {
  const origin = c.req.header("Origin") || "";
  if (!originAllowed(origin)) return jsonError(c, 403, "Origin not allowed");

  const body = await c.req.json().catch(() => ({}));
  const { walletAddress, message, signature } = body;
  if (
    !isWalletAddress(walletAddress) ||
    typeof message !== "string" ||
    typeof signature !== "string" ||
    !signature.startsWith("0x")
  ) {
    return jsonError(c, 400, "Invalid authorization response");
  }

  const { data: nonceRecord, error: nonceError } = await supabase
    .from("guardian_nonces")
    .select("id,wallet_address,origin,message,expires_at,used_at")
    .eq("wallet_address", walletAddress.toLowerCase())
    .eq("message", message)
    .maybeSingle();

  if (
    nonceError ||
    !nonceRecord ||
    nonceRecord.used_at ||
    nonceRecord.origin !== origin ||
    Date.parse(nonceRecord.expires_at) <= Date.now()
  ) {
    return jsonError(c, 401, "Authorization request is invalid or expired");
  }

  const validSignature = await optimismClient.verifyMessage({
    address: walletAddress,
    message,
    signature: signature as `0x${string}`,
  }).catch(() => false);

  if (!validSignature || !(await hasActiveGuardianKey(walletAddress))) {
    await supabase
      .from("guardian_nonces")
      .update({ used_at: new Date().toISOString() })
      .eq("id", nonceRecord.id);
    return jsonError(c, 403, "An active Nucleus Guardian membership is required");
  }

  const token = randomToken();
  const expiresAt = addMinutes(new Date(), SESSION_MINUTES);
  const { error: sessionError } = await supabase.from("guardian_sessions").insert({
    token_hash: await sha256(token),
    wallet_address: walletAddress.toLowerCase(),
    origin,
    expires_at: expiresAt,
    last_verified_at: new Date().toISOString(),
  });

  await supabase
    .from("guardian_nonces")
    .update({ used_at: new Date().toISOString() })
    .eq("id", nonceRecord.id);

  if (sessionError) return jsonError(c, 500, "Unable to create Guardian session");

  return c.json({ token, walletAddress, expiresAt });
});

app.get(`${ROUTE_PREFIX}/public/blog-posts`, async (c) => {
  try {
    const data = await fetchParagraphPosts();
    c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return c.json({ data });
  } catch (error) {
    console.error("Unable to load Paragraph posts", error);
    return jsonError(c, 503, "Blog feed is temporarily unavailable");
  }
});

app.get(`${ROUTE_PREFIX}/public/:resource`, async (c) => {
  const result = await fetchPublicResource(
    c.req.param("resource"),
    c.req.query("anchor"),
  );
  if (result.error) return jsonError(c, 500, "Unable to load content");
  return c.json({ data: result.data ?? [] });
});

app.get(`${ROUTE_PREFIX}/admin/session`, async (c) => {
  const guardian = await requireGuardian(c);
  if (!guardian) return jsonError(c, 401, "Guardian session is invalid or expired");

  const token = c.req.header("X-Guardian-Session")!;
  const { data: session } = await supabase
    .from("guardian_sessions")
    .select("expires_at")
    .eq("token_hash", await sha256(token))
    .single();

  return c.json({
    walletAddress: guardian.walletAddress,
    expiresAt: session?.expires_at,
  });
});

app.get(`${ROUTE_PREFIX}/admin/:resource`, async (c) => {
  const guardian = await requireGuardian(c);
  if (!guardian) return jsonError(c, 401, "Guardian session is invalid or expired");

  const resource = c.req.param("resource");
  if (!isManagedResource(resource)) return jsonError(c, 404, "Unknown resource");
  if (!(await enforceRateLimit(guardian.walletAddress, `read.${resource}`, 120))) {
    return jsonError(c, 429, "Too many requests");
  }

  const result = await fetchAdminResource(resource);
  if (result.error) return jsonError(c, 500, "Unable to load administrative content");
  return c.json({ data: result.data ?? [] });
});

app.post(`${ROUTE_PREFIX}/admin/mutate`, async (c) => {
  const requestId = crypto.randomUUID();
  const guardian = await requireGuardian(c);
  if (!guardian) return jsonError(c, 401, "Guardian session is invalid or expired");

  const body = await c.req.json().catch(() => ({}));
  const { action, resource, payload } = body;
  if (
    typeof action !== "string" ||
    typeof resource !== "string" ||
    !isManagedResource(resource)
  ) {
    return jsonError(c, 400, "Invalid mutation request");
  }
  if (!(await enforceRateLimit(guardian.walletAddress, `write.${resource}`, 60))) {
    return jsonError(c, 429, "Too many changes");
  }

  const config = resourceConfig[resource];
  let recordId: string | null = null;

  try {
    let data: unknown = null;

    if (action === "upsert") {
      const clean = sanitizePayload(resource, payload);
      recordId = String(clean[config.key] ?? "") || null;
      const result = await supabase
        .from(config.table)
        .upsert(clean)
        .select(config.fields.join(","))
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else if (action === "upsertMany" && resource === "curations") {
      if (!Array.isArray(payload) || payload.length > 250) {
        throw new Error("Invalid curation list");
      }
      const clean = payload.map((item) => sanitizePayload(resource, item));
      const result = await supabase.from(config.table).upsert(clean);
      if (result.error) throw result.error;
      data = null;
    } else if (action === "delete") {
      if (!payload || typeof payload !== "object") throw new Error("Missing record ID");
      const keyValue = (payload as Record<string, unknown>)[config.key] ??
        (payload as Record<string, unknown>).id;
      if (typeof keyValue !== "string" || keyValue.length > 2_048) {
        throw new Error("Invalid record ID");
      }
      recordId = keyValue;
      const result = await supabase.from(config.table).delete().eq(config.key, keyValue);
      if (result.error) throw result.error;
      data = null;
    } else if (action === "setHero" && resource === "curations") {
      const guid = (payload as Record<string, unknown> | undefined)?.guid;
      if (typeof guid !== "string" || guid.length > 2_048) throw new Error("Invalid article ID");
      recordId = guid;
      const result = await supabase.rpc("guardian_set_blog_hero", { target_guid: guid });
      if (result.error) throw result.error;
      data = null;
    } else if (action === "clearHero" && resource === "curations") {
      const result = await supabase
        .from("blog_curations")
        .update({ is_hero: false })
        .eq("is_hero", true);
      if (result.error) throw result.error;
      data = null;
    } else {
      throw new Error("Action is not allowed");
    }

    await audit(
      guardian.walletAddress,
      action,
      resource,
      recordId,
      true,
      requestId,
    );
    return c.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mutation failed";
    await audit(
      guardian.walletAddress,
      action,
      resource,
      recordId,
      false,
      requestId,
      message,
    );
    return jsonError(c, 400, message);
  }
});

app.post(`${ROUTE_PREFIX}/admin/member-image`, async (c) => {
  const requestId = crypto.randomUUID();
  const guardian = await requireGuardian(c);
  if (!guardian) return jsonError(c, 401, "Guardian session is invalid or expired");
  if (!(await enforceRateLimit(guardian.walletAddress, "upload.member-image", 5))) {
    return jsonError(c, 429, "Too many uploads");
  }

  const body = await c.req.parseBody();
  const file = body.file;
  const mimeToExtension: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  if (
    !(file instanceof File) ||
    !mimeToExtension[file.type] ||
    file.size <= 0 ||
    file.size > MAX_IMAGE_BYTES
  ) {
    return jsonError(c, 400, "Upload a JPEG, PNG, or WebP image up to 5 MB");
  }

  const path = `${guardian.walletAddress.toLowerCase()}/${crypto.randomUUID()}.${
    mimeToExtension[file.type]
  }`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await supabase.storage
    .from("community-members")
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (result.error) {
    await audit(
      guardian.walletAddress,
      "upload",
      "member-image",
      path,
      false,
      requestId,
      result.error.message,
    );
    return jsonError(c, 400, "Image upload failed");
  }

  const { data } = supabase.storage.from("community-members").getPublicUrl(path);
  await audit(
    guardian.walletAddress,
    "upload",
    "member-image",
    path,
    true,
    requestId,
  );
  return c.json({ url: data.publicUrl });
});

export default {
  fetch: withSupabase(
    { auth: "none", cors: "disabled" },
    async (request) => app.fetch(request),
  ),
};
