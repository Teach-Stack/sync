import { Hono } from 'hono'
import { ProviderKey, providers as providerList } from '../providers'

export const providers = new Hono().get('', (c) => {
  return c.json<Record<ProviderKey, boolean>>({
    google: providerList.google.isConfigured,
    microsoft: providerList.microsoft.isConfigured,
  })
})
