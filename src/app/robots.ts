import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://haziralici.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/profil', '/sifre-sifirla'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
