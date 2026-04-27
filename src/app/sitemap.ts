import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';
const GHOST_URL = process.env.NEXT_PUBLIC_GHOST_SITE_URL;
const GHOST_KEY = process.env.NEXT_PUBLIC_GHOST_API_KEY;

async function getBlogPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!GHOST_URL || !GHOST_KEY) return [];
  try {
    const res = await fetch(
      `${GHOST_URL}/ghost/api/content/posts/?key=${GHOST_KEY}&fields=slug,updated_at&limit=all`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      console.error(`sitemap: Ghost API returned ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.posts ?? []).map((p: any) => ({ slug: p.slug, updatedAt: p.updated_at }));
  } catch (err: any) {
    console.error('sitemap: Ghost API fetch failed:', err.message);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                           lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/blog`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/signup`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about-us`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/signin`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const posts = await getBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
