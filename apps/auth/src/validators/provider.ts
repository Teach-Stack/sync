import { ArkErrors } from 'arktype'
import { validator } from 'hono/validator'
import { ProviderKey, providers } from '../providers'

export const providerValidator = validator('param', (value, c) => {
  const raw = value.provider

  const key = ProviderKey(raw)

  if (key instanceof ArkErrors) {
    return c.json({ error: 'Invalid provider key' }, 400)
  }

  const provider = providers[key]

  if (!provider.isConfigured) {
    return c.json({ error: `Provider ${provider.key} is not configured` }, 503)
  }

  return { provider, providerKey: key }
})
