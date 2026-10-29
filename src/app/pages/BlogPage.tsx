import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, RefreshCw } from 'lucide-react';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
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

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonHero() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="w-full bg-muted rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px]" style={{ aspectRatio: '16/7' }} />
      <div className="space-y-3 max-w-2xl">
        <div className="h-3 bg-muted rounded w-1/5" />
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-foreground/20 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] overflow-hidden animate-pulse">
      <div className="bg-muted w-full" style={{ aspectRatio: '16/9' }} />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
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
        <h2 className="font-sans font-semibold text-2xl md:text-3xl leading-snug group-hover:text-accent transition-colors">
          {post.title}
        </h2>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <AuthorAvatar name={post.author} avatarUrl={post.authorAvatarUrl} size="md" />
        <p className="font-mono text-xs font-medium">{post.author}</p>

      </div>
    </div>
  );
}

// ── Search + Filter Bar ────────────────────────────────────────────────────
function FilterBar({
  categories,
  activeCategory,
  searchQuery,
  onCategory,
  onSearch,
  onRefresh,
}: {
  categories: string[];
  activeCategory: string | null;
  searchQuery: string;
  onCategory: (cat: string | null) => void;
  onSearch: (q: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex gap-3 items-stretch">
      {/* Search input */}
      <div className="flex-1 flex items-center gap-2.5 px-4 border border-foreground rounded-[4px]">
        <Search size={13} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search articles…"
          className="flex-1 font-mono text-xs py-3 bg-transparent placeholder:text-muted-foreground focus:outline-none"
        />
        <div
          onClick={onRefresh}
          title="Refresh articles"
          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <RefreshCw size={13} />
        </div>
      </div>

      {/* Category dropdown */}
      <div className="relative flex items-center border border-foreground rounded-[4px]">
        <select
          value={activeCategory ?? ''}
          onChange={(e) => onCategory(e.target.value || null)}
          className="appearance-none font-mono text-xs pl-4 pr-9 py-3 bg-transparent text-foreground focus:outline-none cursor-pointer"
        >
          <option value="">All topics</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground text-[9px]">▾</span>
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const categories = useMemo(
    () => [...new Set(rest.flatMap((p) => p.categories))].sort(),
    [rest],
  );

  const filteredRest = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rest.filter((post) => {
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === null || post.categories.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [rest, searchQuery, activeCategory]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeCategory]);

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

      {/* Constrained content */}
      <div className={`min-h-[calc(100vh-160px)] px-8 md:px-16 max-w-6xl mx-auto pb-20 ${showHeroImage ? 'pt-10' : 'pt-20'}`}>

        {/* Loading */}
        {loading && (
          <div className="space-y-10">
            <SkeletonHero />
            <div className="grid sm:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="border border-foreground/30 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] p-10 text-center">
            <p className="font-mono text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => load(true)}
              className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-foreground hover:text-background transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && posts.length > 0 && (
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
                  categories={categories}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                  onCategory={setActiveCategory}
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
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="font-mono text-sm text-muted-foreground text-center py-20">No articles found.</p>
        )}
      </div>

      <Footer />
    </>
  );
}
