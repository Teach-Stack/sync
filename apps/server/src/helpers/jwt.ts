import * as jwt from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

import { env } from '../env'

export async function verify(token: string) {
  return await jwt.verify(token, env.SECRET_KEY, 'HS256')
}

export async function sign(payload: JWTPayload) {
  return await jwt.sign(payload, env.SECRET_KEY, 'HS256')
}
