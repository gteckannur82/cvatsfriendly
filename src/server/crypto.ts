// Password hashing with PBKDF2-SHA256 via WebCrypto (native in Workers, no WASM needed).
// Iterations are kept moderate so login stays within the Workers free-tier CPU budget.
const ITERATIONS = 60_000
const enc = new TextEncoder()

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const fromHex = (hex: string): Uint8Array<ArrayBuffer> => new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derive(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iter || !saltHex || !hashHex) return false
  const bits = new Uint8Array(await derive(password, fromHex(saltHex), Number(iter)))
  return timingSafeEqual(bits, fromHex(hashHex))
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export function randomToken(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)))
}

export async function sha256Hex(input: string) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(input)))
}

export async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(payload)))
}

export const newId = () => crypto.randomUUID()
