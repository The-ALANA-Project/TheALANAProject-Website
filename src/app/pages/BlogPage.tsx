import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, RefreshCw } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { BlogBeamReveal } from '../components/BlogBeamReveal';
import { BlogLoadingBar } from '../components/BlogLoadingBar';
import { BlogSubscribePanel, openParagraphSubscription } from '../components/BlogSubscribePanel';
import { Button } from '../components/ui/button';
import {
  fetchAllBlogPosts,
  getAuthorInitials,
  formatPubDate,
  type BlogPost,
} from '../services/blogService';
import { fetchCurations, applyCurations, type BlogCuration } from '../services/blogCurationService';

// ── Author Avatar ──────────────────────────────────────────────────────────
function AuthorAvatar({
  name,
  avatarUrl,
  size = 'sm',
}: {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-9 h-9' : 'w-7 h-7';
  const text = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} ${text} rounded-full bg-accent text-accent-foreground flex items-center justify-center font-mono font-semibold shrink-0`}
    >
      {getAuthorInitials(name)}
    </div>
  );
}

// ── Small Card (grid items) ────────────────────────────────────────────────
function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      className="group border border-foreground rounded-[8px] overflow-hidden cursor-pointer hover:border-accent transition-colors flex flex-col"
    >
      {post.imageUrl && (
        <div className="w-full shrink-0">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto block"
            loading="lazy"
          />
          <div className="w-full h-px bg-foreground" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        <h4 className="leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 pt-1 border-t border-foreground/10">
          <AuthorAvatar name={post.author} avatarUrl={post.authorAvatarUrl} />
          <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{post.author}</span>
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">{formatPubDate(post.pubDate)}</span>
        </div>
      </div>
    </article>
  );
}

// ── Hero Text (rendered below the full-bleed image) ───────────────────────
function HeroText({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div onClick={onClick} className="group cursor-pointer flex flex-col gap-3">
      <div className="max-w-3xl flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {post.categories.length > 0 && (
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {post.categories[0]}
            </span>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {formatPubDate(post.pubDate)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">·</span>
          <span className="font-mono text-xs text-muted-foreground">{post.readingTimeMin} min read</span>
        </div>
        <h2 className="font-sans text-2xl font-medium leading-normal transition-colors group-hover:text-accent">
          {post.title}
        </h2>
      </div>

      <div className="flex items-end justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <AuthorAvatar name={post.author} avatarUrl={post.authorAvatarUrl} size="md" />
          <p className="font-mono text-xs font-medium">{post.author}</p>
        </div>
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openParagraphSubscription();
          }}
          className="h-10 shrink-0 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-5 text-accent-foreground shadow-lg hover:bg-foreground hover:text-accent"
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
}

// ── Search Bar ─────────────────────────────────────────────────────────────
function FilterBar({
  searchQuery,
  onSearch,
  onRefresh,
}: {
  searchQuery: string;
  onSearch: (q: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-2.5 rounded-[4px] border border-foreground px-4">
      <Search size={13} className="shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search articles…"
        className="min-w-0 flex-1 bg-transparent py-3 font-mono text-xs placeholder:text-muted-foreground focus:outline-none"
      />
      <div
        onClick={onRefresh}
        title="Refresh articles"
        className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw size={13} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
const POSTS_PER_PAGE = 10;

export function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [curations, setCurations] = useState<BlogCuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  async function load(force = false) {
    setLoading(true);
    setError(null);
    try {
      const [data, curationData] = await Promise.all([
        fetchAllBlogPosts(),
        fetchCurations(),
      ]);
      setPosts(data);
      setCurations(curationData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const { sorted: sortedPosts, heroGuid } = useMemo(
    () => applyCurations(posts, curations),
    [posts, curations],
  );

  const featured = heroGuid ? sortedPosts.find(p => p.guid === heroGuid) ?? null : null;
  const rest = sortedPosts.filter(p => p.guid !== heroGuid);

  const filteredRest = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rest.filter((post) =>
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q)
    );
  }, [rest, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages = Math.ceil(filteredRest.length / POSTS_PER_PAGE);
  const pagedPosts = filteredRest.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const showHeroImage = !loading && !error && !!featured && !!featured.imageUrl;

  return (
    <>
      <Seo
        title="Blog"
        description="Articles, insights, and updates from The ALANA Project community."
        path="/blog"
      />

      {loading && (
        <div className="flex min-h-[calc(100vh-160px)] w-full max-w-6xl items-center justify-center px-8 pb-20 pt-20 md:px-16 mx-auto">
          <div className="w-full max-w-md">
            <BlogLoadingBar label="Loading the latest stories" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="min-h-[calc(100vh-160px)] w-full px-8 pb-20 pt-20 md:px-16 max-w-6xl mx-auto">
          <div className="border border-foreground/30 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-10 text-center">
            <p className="font-mono text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => load(true)}
              className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-foreground hover:text-background transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <BlogBeamReveal>
          {/* Hero image — constrained to match page content padding */}
          {showHeroImage && (
            <div className="px-8 md:px-16 max-w-6xl mx-auto pt-10">
              <div className="border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] overflow-hidden">
                <img
                  src={featured!.imageUrl}
                  alt={featured!.title}
                  className="w-full block object-cover"
                  loading="eager"
                />
              </div>
            </div>
          )}

          <div className={`min-h-[calc(100vh-160px)] w-full px-8 md:px-16 max-w-6xl mx-auto pb-20 ${showHeroImage ? 'pt-10' : 'pt-20'}`}>
            {posts.length > 0 ? (
              <div className="space-y-10">
                {/* Hero text */}
                {featured && (
                  <HeroText
                    post={featured}
                    onClick={() => navigate(`/blog/${featured.slug}`)}
                  />
                )}

                {/* Divider */}
                {rest.length > 0 && <div className="h-px bg-foreground" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }} />}

                {/* Filter + grid */}
                {rest.length > 0 && (
                  <>
                    <FilterBar
                      searchQuery={searchQuery}
                      onSearch={setSearchQuery}
                      onRefresh={() => load(true)}
                    />

                    {filteredRest.length > 0 ? (
                      <>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {pagedPosts.map((post) => (
                            <BlogCard
                              key={post.guid}
                              post={post}
                              onClick={() => navigate(`/blog/${post.slug}`)}
                            />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4">
                            <button
                              onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              disabled={currentPage === 1}
                              className="inline-flex h-11 w-32 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-[#262424]"
                            >
                              Previous
                            </button>
                            <span className="font-mono text-xs text-muted-foreground">
                              {currentPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              disabled={currentPage === totalPages}
                              className="inline-flex h-11 w-32 items-center justify-center rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-[#262424] shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-[#262424] hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-[#262424]"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="font-mono text-sm text-muted-foreground py-10">
                        No articles match your search.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="font-mono text-sm text-muted-foreground text-center py-20">No articles found.</p>
            )}
          </div>
          <BlogSubscribePanel />
        </BlogBeamReveal>
      )}

      <Footer />
    </>
  );
}
