import type { ClientRequestOptions } from 'hono/client'

import { hcWithType } from '@teach-stack/auth-server/client'

export function createClient(
  baseUrl: string,
  options: ClientRequestOptions = {},
) {
  return hcWithType(baseUrl, {
    ...options,
    init: { credentials: 'include', ...options.init },
  })
}

export {
  parseResponse,
  type DetailedError,
  type InferRequestType,
  type InferResponseType,
  type ClientResponse,
} from 'hono/client'
