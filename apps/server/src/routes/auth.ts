import { Hono } from 'hono'

import * as client from 'openid-client'

import { getDB } from '../helpers/db'
import { logger } from '../helpers/log'

import { userSession } from '../middleware/session'
import { providerValidator } from '../validators/provider'

const log = logger.withTag('auth')

export const auth = new Hono()
  .get('/status', userSession, async (c) => {
    const user = c.var.user

    return c.json(user)
  })
  .post('/token/:provider', userSession, providerValidator, async (c) => {
    const { provider } = c.req.valid('param')
    const user = c.var.user

    if (!user.providers.includes(provider.key)) {
      return c.json({ error: 'Provider not connected' }, 404)
    }

    const db = getDB(c)

    const row = await db
      .prepare('SELECT refresh_token FROM users WHERE id = ? AND provider = ?')
      .bind(user.id, provider.key)
      .first<{ refresh_token: string }>()

    if (row === null) {
      return c.json({ error: 'Provider not connected' }, 404)
    }

    try {
      const tokens = await provider.refresh(row.refresh_token)

      if (tokens.refresh_token) {
        await db
          .prepare(
            'UPDATE users SET refresh_token = ?, updated = unixepoch() WHERE id = ? AND provider = ?'
          )
          .bind(tokens.refresh_token, user.id, provider.key)
          .run()

        log.debug('rotated refresh token saved', { userId: user.id, provider: provider.key })
      }

      return c.json({ access_token: tokens.access_token, expires_in: tokens.expires_in ?? null })
    } catch (error) {
      if (error instanceof client.ResponseBodyError && error.error === 'invalid_grant') {
        log.warn('refresh token rejected', { userId: user.id, provider: provider.key })
        return c.json({ error: 'reauth_required' }, 401)
      }

      log.error('error refreshing access token', error)
      return c.json({ error: 'Failed to refresh access token' }, 500)
    }
  })
