import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/user/',
        '/api/',
        '/create-new-link',
        '/manage-link',
        '/manage-subscription',
        '/prosignup',
        '/reset-password/',
        '/invalid-link',
        // '/download/' is left crawlable on purpose so Google can see the noindex on
        // already-indexed link pages. Re-add once GSC shows them dropped.
        '/404',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
