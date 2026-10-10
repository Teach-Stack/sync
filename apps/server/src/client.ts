import { hc } from 'hono/client'
import type app from './index'

export type Client = ReturnType<typeof hc<typeof app>>

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<typeof app>(...args)

export type { ProviderKey } from './providers'
export { ProviderKeys } from './providerKeys'
