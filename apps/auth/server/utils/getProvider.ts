import type { H3Event } from 'h3'

import { ArkErrors, type } from 'arktype'
import { env } from '~/env'

const ProviderKey = type(`'google' | 'microsoft'`)
type ProviderKey = type.infer<typeof ProviderKey>

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

export function getProviders() {
  return Object.values(providers).filter(
    (provider) => provider.clientId && provider.clientSecret,
  )
}

export function getProvider(event: H3Event) {
  const raw = getRouterParam(event, 'provider')

  const key = ProviderKey(raw)

  if (key instanceof ArkErrors) {
    throw createError({
      status: 404,
      statusMessage: 'Not Found',
    })
  }

  const provider = providers[key]

  if (provider.clientId === undefined || provider.clientSecret === undefined) {
    throw createError({
      status: 503,
      statusMessage: `${provider.name} provider is not configured`,
    })
  }

  return provider
}
