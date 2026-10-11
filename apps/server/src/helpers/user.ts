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
  providers: ProviderKey.array(),
})

export type User = type.infer<typeof User>

export async function getUserById(c: Context, id: string) {
  const db = getDB(c)

  log.debug('looking up user', { id })

  const result = await db.prepare('SELECT id FROM users WHERE id = ?').bind(id).first()

  if (result === null) {
    log.debug('no user found', { id })
    return null
  }

  log.debug('user found', { result })

  const providers = await db
    .prepare('SELECT provider FROM users WHERE id = ?')
    .bind(id)
    .all()
    .then(({ results }) =>
      results
        .map((result) => {
          const parsedKey = ProviderKey(result.provider)
          return parsedKey instanceof ArkErrors ? undefined : parsedKey
        })
        .filter((key) => key !== undefined)
    )

  log.debug('pulled providers for user', { id, providers })

  return {
    id,
    providers,
  } satisfies User
}

export async function getSessionUser(c: Context) {
  const cookie = getCookie(c, 'teachstack.session')

  if (!cookie) {
    log.debug('no session cookie present')
    return null
  }

  // expired or tampered tokens are treated as logged out, not as a server error
  const raw = await verifyJwt(cookie).catch((error) => {
    log.debug('session jwt rejected', { error: String(error) })
    return null
  })

  const payload = JWTPayload(raw)

  if (payload instanceof ArkErrors) {
    log.debug('session jwt payload invalid')
    return null
  }

  log.debug('session resolved', { sub: payload.sub })

  return getUserById(c, payload.sub)
}
