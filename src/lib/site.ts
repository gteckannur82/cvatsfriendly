export const SITE = {
  name: 'CV ATS Friendly',
  domain: 'cvatsfriendly.com',
  url: 'https://cvatsfriendly.com',
  tagline: 'AI resume builder that gets past applicant tracking systems',
  description:
    'Build a clean, ATS-friendly resume with a guided editor, AI bullet rewriting, job description tailoring and five single-column templates. Export to PDF free.',
  supportEmail: 'support@cvatsfriendly.com',
}

export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE.name}` : `${SITE.name} — AI Resume Builder for ATS-Friendly CVs`
}

export function seo({ title, description, path = '/' }: { title?: string; description?: string; path?: string }) {
  const t = pageTitle(title)
  const d = description ?? SITE.description
  const url = `${SITE.url}${path}`
  return {
    meta: [
      { title: t },
      { name: 'description', content: d },
      { property: 'og:title', content: t },
      { property: 'og:description', content: d },
      { property: 'og:url', content: url },
      { name: 'twitter:title', content: t },
      { name: 'twitter:description', content: d },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
