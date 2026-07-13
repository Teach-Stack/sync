import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'

import { ArkErrors, type } from 'arktype'

import { verifyJwt } from './jwt'
import { getDB } from './db'

import { ProviderKey } from '../providers'

const JWTPayload = type({
  sub: 'string',
})

const User = type({
  id: 'string',
  provider: ProviderKey,
  refresh_token: 'string',
})

export async function getUserById(c: Context, id: string, provider?: ProviderKey) {
  const db = getDB(c)

  let userRaw: Record<string, unknown> | null

  if (provider) {
    userRaw = await db
      .prepare('SELECT * FROM users WHERE id = ? AND provider = ?')
      .bind(id, provider)
      .first()
  } else {
    userRaw = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  }

  const user = User(userRaw)

  if (user instanceof ArkErrors) return null

  return user
}

export async function getSessionUser(c: Context, provider?: ProviderKey) {
  const cookie = getCookie(c, 'teachstack.session')

  if (!cookie) return null

  const raw = await verifyJwt(cookie)

  const payload = JWTPayload(raw)

  if (payload instanceof ArkErrors) return null

  return getUserById(c, payload.sub, provider)
}
