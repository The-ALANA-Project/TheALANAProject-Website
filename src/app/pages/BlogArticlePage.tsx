import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { BlogLoadingBar } from '../components/BlogLoadingBar';
import {
  fetchBlogPosts,
  lookupMemberAvatar,
  getAuthorInitials,
  formatPubDate,
  type BlogPost,
} from '../services/blogService';

// ── Helpers ────────────────────────────────────────────────────────────────

function AuthorAvatar({
  name,
  avatarUrl,
  size = 'md',
}: {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = { sm: 'w-7 h-7 text-[10px]', md: 'w-10 h-10 text-xs', lg: 'w-12 h-12 text-sm' };
  const cls = dims[size];
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-accent text-accent-foreground flex items-center justify-center font-mono font-semibold shrink-0`}>
      {getAuthorInitials(name)}
    </div>
  );
}

// ── Article Page ───────────────────────────────────────────────────────────

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    // RSS feed for full article content, community_members for avatar — two independent sources.
    fetchBlogPosts()
      .then(async (posts) => {
        const found = posts.find((p) => p.slug === slug)
          ?? posts.find((p) => p.slug.toLowerCase() === slug?.toLowerCase())
          ?? posts.find((p) => p.originalUrl.endsWith(`/${slug}`));
        if (!found) throw new Error('Article not found');
        // Show the article immediately, then hydrate avatar in the background.
        setPost(found);
        if (!found.authorAvatarUrl) {
          const avatarUrl = await lookupMemberAvatar(found.author);
          if (avatarUrl) setPost((prev) => prev ? { ...prev, authorAvatarUrl: avatarUrl } : prev);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      {/* Seo updates as soon as post is loaded — loading state falls back to site defaults */}
      {post && (
        <Seo
          title={post.title}
          description={post.excerpt}
          image={post.imageUrl || undefined}
          path={`/blog/${post.slug}`}
          type="article"
          author={post.author}
          publishedTime={post.pubDate}
        />
      )}
      <div className="relative min-h-[calc(100vh-160px)] w-full px-8 md:px-16 max-w-6xl mx-auto py-12">
        {/* Back button */}
        {!loading && (
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium bg-accent text-[#262424] backdrop-blur-sm border border-accent shadow-lg rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent mb-10"
          >
            Back to Blog
          </button>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center px-8 md:px-16">
            <div className="w-full max-w-md">
            <BlogLoadingBar label="Opening article" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate('/blog')}
              className="font-mono text-xs px-4 py-2 border border-foreground rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] hover:bg-foreground hover:text-background transition-colors"
            >
              Back to Blog
            </button>
          </div>
        )}

        {!loading && post && (
          <>
            {/* Hero image — full width, proportional */}
            {post.imageUrl && (
              <div className="overflow-hidden rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] mb-8 border border-foreground">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto block"
                  loading="eager"
                />
              </div>
            )}

            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.slice(0, 5).map((cat) => (
                  <span key={cat} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="blog-article-title font-sans font-bold leading-tight mb-6 text-left">
              {post.title}
            </h1>

            {/* Author / meta strip */}
            <div className="flex items-center gap-3 mb-10 pb-8 border-b border-foreground">
              <AuthorAvatar name={post.author} avatarUrl={post.authorAvatarUrl} size="lg" />
              <div>
                <p className="font-sans font-medium text-sm">{post.author}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatPubDate(post.pubDate)} · {post.readingTimeMin} min read
                </p>
              </div>
            </div>

            {/* Article body */}
            <style>{`
              .blog-article-title {
                font-size: 28px !important;
                line-height: 1.2 !important;
              }
              .article-body h2 {
                font-size: 24px !important;
                line-height: 1.3 !important;
              }
              .article-body h3 {
                font-size: 20px !important;
                line-height: 1.4 !important;
              }
              .article-body h4 {
                font-size: 18px !important;
                line-height: 1.4 !important;
              }
              @media (min-width: 768px) {
                .blog-article-title {
                  font-size: 36px !important;
                }
                .article-body h2 {
                  font-size: 26px !important;
                }
                .article-body h3 {
                  font-size: 22px !important;
                }
              }
              .article-body p:empty { display: none; }
              .article-body figure,
              .article-body figure *,
              .article-body [class*="bookmark"],
              .article-body [class*="embed"],
              .article-body [class*="card"],
              .article-body [class*="kg-"],
              .article-body > div,
              .article-body > iframe,
              .article-body > blockquote { margin-left: 0 !important; margin-right: auto !important; }
              .article-body * { text-align: left; }
              /* Standalone content images (not inside figure, not in p) */
              .article-body > img,
              .article-body div > img {
                display: block;
                max-width: 100%;
                border: 1px solid var(--foreground);
                border-radius: 8px;
                margin-top: 1.5rem;
                margin-bottom: 1.5rem;
              }
              /* Emoji/inline images inside paragraphs — render at text size, no decoration */
              .article-body p img {
                display: inline;
                height: 1em;
                width: auto;
                vertical-align: -0.125em;
                border: none !important;
                border-radius: 0 !important;
                margin: 0 !important;
              }
            `}</style>
            <div
              className="article-body
                font-sans text-base leading-relaxed text-foreground
                [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
                [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-6 [&_h4]:mb-2
                [&_p]:mb-5 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul>li]:mb-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol>li]:mb-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6
                [&_hr]:my-8 [&_hr]:border-foreground
                [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-foreground
                [&_strong]:font-semibold
                [&_em]:italic
                [&_code]:font-mono [&_code]:text-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm
                [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-tl-[4px] [&_pre]:rounded-br-[24px] [&_pre]:overflow-x-auto [&_pre]:mb-5
                [&_figure_img]:max-w-full [&_figure_img]:rounded-[8px] [&_figure_img]:border [&_figure_img]:border-foreground
                [&_figure]:my-6 [&_figure]:ml-0 [&_figure]:mr-auto
                [&_[class*='kg-']]:ml-0
                [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground [&_figcaption]:mt-2 [&_figcaption]:font-mono
              "
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

          </>
        )}
      </div>

      <Footer />
    </>
  );
}
