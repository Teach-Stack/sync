import * as jwt from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

import { env } from '../env'
import { logger } from './log'

const log = logger.withTag('jwt')

export async function verifyJwt(token: string) {
  const payload = await jwt.verify(token, env.SECRET_KEY, 'HS256')
  log.debug('jwt verified')
  return payload
}

export async function signJwt(payload: JWTPayload) {
  log.debug('signing jwt', { sub: payload.sub })
  return await jwt.sign(payload, env.SECRET_KEY, 'HS256')
}
