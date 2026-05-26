import { Helmet } from 'react-helmet-async';
import { SITE } from '@data/seoData';

function toAbsoluteUrl(path) {
  if (!path) return SITE.url;
  if (/^https?:\/\//i.test(path)) return path;
  return path === '/' ? SITE.url : `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

function buildSchema({ title, description, canonicalUrl, imageUrl, schemaType }) {
  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description,
    url: canonicalUrl ?? SITE.url,
    inLanguage: SITE.language,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
    },
    about: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export default function PageSeo({
  title,
  description,
  keywords,
  path = '/',
  image = SITE.defaultImage,
  imageAlt = SITE.defaultImageAlt,
  robots = 'index, follow, max-image-preview:large',
  type = 'website',
  schemaType = 'WebPage',
}) {
  const canonicalUrl = path == null ? null : toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);
  const schema = buildSchema({ title, description, canonicalUrl, imageUrl, schemaType });

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      <meta name="author" content={SITE.name} />

      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
