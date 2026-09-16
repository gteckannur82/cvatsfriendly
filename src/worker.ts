import startEntry, { createServerEntry } from '@tanstack/react-start/server-entry'

/**
 * cvatsfriendly.com is canonical. www and beta are custom domains on this same
 * Worker so their DNS resolves, but they 301 here rather than serving a second
 * copy of the site.
 */
const CANONICAL_HOST = 'cvatsfriendly.com'
const REDIRECTED_HOSTS = new Set(['www.cvatsfriendly.com', 'beta.cvatsfriendly.com'])

export default createServerEntry({
  async fetch(...args) {
    const url = new URL(args[0].url)
    if (REDIRECTED_HOSTS.has(url.hostname)) {
      url.hostname = CANONICAL_HOST
      return Response.redirect(url.toString(), 301)
    }
    return startEntry.fetch(...args)
  },
})
