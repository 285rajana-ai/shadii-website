import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/portal/', '/admin-login/', '/_next/', '/delete-account/'],
    },
    sitemap: 'https://www.shadii.pk/sitemap.xml',
  };
}
