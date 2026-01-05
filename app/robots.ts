import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',  // 🚫 Don't crawl user dashboards
                '/account/',    // 🚫 Don't crawl settings
                '/api/',        // 🚫 Don't crawl API endpoints
            ],
        },
        sitemap: 'https://usevisible.app/sitemap.xml',
    }
}