import type { AppType } from '../server'
import { type ClientRequestOptions, hc } from 'hono/client'

export function createClient(
  baseUrl: string,
  options: ClientRequestOptions = {},
) {
  return hc<AppType>(baseUrl, options)
}

export {
  parseResponse,
  DetailedError,
  InferRequestType,
  InferResponseType,
} from 'hono/client'
