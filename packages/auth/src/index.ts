import type { ClientRequestOptions } from 'hono/client'

import { hcWithType } from '@teach-stack/auth-server'

export function createClient(
  baseUrl: string,
  options: ClientRequestOptions = {},
) {
  return hcWithType(baseUrl, options)
}

export {
  parseResponse,
  type DetailedError,
  type InferRequestType,
  type InferResponseType,
} from 'hono/client'
