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
        '/404',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
