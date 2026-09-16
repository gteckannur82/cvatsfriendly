import { createFileRoute } from '@tanstack/react-router'
import { SITE } from '~/lib/site'

const PATHS = ['/', '/pricing', '/templates', '/ats-resume-guide', '/signup', '/login', '/privacy', '/terms']

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PATHS.map((p) => `  <url><loc>${SITE.url}${p}</loc><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n')}
</urlset>`
        return new Response(body, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } })
      },
    },
  },
})
