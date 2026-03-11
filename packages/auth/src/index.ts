import { type ClientRequestOptions, hc } from 'hono/client'

import type { AppType } from '@teach-stack/auth-server'

export function createClient(
  baseUrl: string,
  options: ClientRequestOptions = {},
) {
  return hc<AppType>(baseUrl, options)
}

export {
  parseResponse,
  type DetailedError,
  type InferRequestType,
  type InferResponseType,
} from 'hono/client'

const test = createClient('http://localhost:3000')
