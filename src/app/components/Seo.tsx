import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'The ALANA Project';
const SITE_URL = 'https://the-alana-project.xyz';
const DEFAULT_DESCRIPTION =
  'A decentralised community project building the future of collaborative contribution. Join us, earn $ALANA, and help shape what comes next.';
const DEFAULT_IMAGE =
  'https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeic2t2wzdzj7uing33sshx6ygvj76ci77gfbx3txetwgbmuh6civqy?v=2';

interface SeoProps {
  /** Page title — SITE_NAME is appended automatically */
  title?: string;
  description?: string;
  /** Absolute URL to the OG image (1200×630) */
  image?: string;
  /** Canonical page path, e.g. "/blog/my-article" */
  path?: string;
  /** "website" for regular pages, "article" for blog posts */
  type?: 'website' | 'article';
  /** Article-specific: author name */
  author?: string;
  /** Article-specific: ISO 8601 publish date */
  publishedTime?: string;
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = '',
  type = 'website',
  author,
  publishedTime,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${SITE_URL}${path}`;
  const usesDefaultImage = image === DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      {usesDefaultImage && <meta property="og:image:type" content="image/png" />}
      {usesDefaultImage && <meta property="og:image:width" content="1200" />}
      {usesDefaultImage && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt" content={`${fullTitle} social preview`} />
      <meta property="og:url" content={canonical} />

      {/* Article-specific OG */}
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={new Date(publishedTime).toISOString()} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@alana_xyz" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${fullTitle} social preview`} />
    </Helmet>
  );
}
