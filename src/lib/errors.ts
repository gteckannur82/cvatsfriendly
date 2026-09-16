/** Errors whose message starts with this prefix should show an "Upgrade to Pro" call to action. */
export const UPGRADE_PREFIX = '[upgrade] '

export function readError(err: unknown): { message: string; upgrade: boolean } {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Something went wrong. Please try again.'
  let message = raw
  // Validation errors from server functions arrive as a JSON array of issues.
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed[0]?.message) message = parsed[0].message
  } catch {}
  const upgrade = message.startsWith(UPGRADE_PREFIX)
  return { message: upgrade ? message.slice(UPGRADE_PREFIX.length) : message, upgrade }
}
