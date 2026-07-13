import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'

import { ArkErrors, type } from 'arktype'

import { verifyJwt } from './jwt'
import { getDB } from './db'
import { logger } from './log'

import { ProviderKey } from '../providers'

const log = logger.withTag('user')

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

  log.debug('looking up user', { id, provider })

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

  if (user instanceof ArkErrors) {
    log.debug('user lookup miss', { id, provider })
    return null
  }

  log.debug('user lookup hit', { id: user.id, provider: user.provider })

  return user
}

export async function getSessionUser(c: Context, provider?: ProviderKey) {
  const cookie = getCookie(c, 'teachstack.session')

  if (!cookie) {
    log.debug('no session cookie present')
    return null
  }

  const raw = await verifyJwt(cookie)

  const payload = JWTPayload(raw)

  if (payload instanceof ArkErrors) {
    log.debug('session jwt payload invalid')
    return null
  }

  log.debug('session resolved', { sub: payload.sub })

  return getUserById(c, payload.sub, provider)
}
