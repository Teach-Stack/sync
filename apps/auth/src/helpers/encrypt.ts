import { env } from '../env'

async function deriveKey(userId: string) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SECRET_KEY),
    { name: 'HKDF' },
    false,
    ['deriveKey'],
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(userId),
      info: new TextEncoder().encode('teachstack'),
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}
