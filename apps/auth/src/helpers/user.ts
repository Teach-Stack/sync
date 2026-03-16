import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'

import { ArkErrors, type } from 'arktype'

import { verify } from './jwt'
import { getDB } from './db'

import { ProviderKey } from '../providers'

const JWTPayload = type({
  sub: 'string',
})

const User = type({
  id: 'string',
  provider: ProviderKey,
  encodedToken: 'string',
})

export async function getUserById(
  c: Context,
  id: string,
  provider: ProviderKey,
) {
  const db = getDB(c)

  const userRaw = await db
    .prepare('SELECT * FROM users WHERE id = ? AND provider = ?')
    .bind(id, provider)
    .first()

  const user = User(userRaw)

  if (user instanceof ArkErrors) return null

  return user
}

export async function getSessionUser(c: Context, provider: ProviderKey) {
  const cookie = getCookie(c, 'teachstack:user')

  if (!cookie) return null

  const raw = await verify(cookie)

  const payload = JWTPayload(raw)

  if (payload instanceof ArkErrors) return null

  return getUserById(c, payload.sub, provider)
}
