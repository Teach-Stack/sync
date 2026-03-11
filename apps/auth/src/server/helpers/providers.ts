import { ArkErrors, type } from 'arktype'
import { env } from '../env'

import { sValidator } from '@hono/standard-validator'
import { validator } from 'hono/validator'

export const ProviderKey = type(`'google' | 'microsoft'`)
export type ProviderKey = type.infer<typeof ProviderKey>

interface Provider {
  name: string
  clientId?: string
  clientSecret?: string
  authEndpoint: string
  tokenEndpoint: string
  revokeEndpoint?: string
  scopes: string[]
}

const providers: Record<ProviderKey, Provider> = {
  google: {
    name: 'Google',
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: ['email', 'https://www.googleapis.com/auth/drive.appdata'],
  },
  microsoft: {
    name: 'Microsoft',
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    authEndpoint:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['email', 'Files.ReadWrite.AppFolder'],
  },
}

export const providerValidator = validator('param', (value, c) => {
  const raw = value.provider

  const key = ProviderKey(raw)

  if (key instanceof ArkErrors) {
    return c.json({ error: 'Invalid provider key' }, 400)
  }

  const provider = providers[key]

  if (provider.clientId === undefined || provider.clientSecret === undefined) {
    return c.json({ error: `Provider ${provider.name} is not configured` }, 503)
  }

  return { provider }
})
