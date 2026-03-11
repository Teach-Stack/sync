import { type ClientRequestOptions, hc } from 'hono/client'
import type { AppType } from '../server'

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
