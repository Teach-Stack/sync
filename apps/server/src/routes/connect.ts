import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'

import { ArkErrors, type } from 'arktype'

import { oauthCookieValidator } from '../validators/cookie'
import { setSignedCookie } from '../helpers/cookies'
import { providerValidator } from '../validators/provider'
import { getSessionUser } from '../helpers/user'
import { nanoid } from 'nanoid'
import { getDB } from '../helpers/db'
import { setCookie } from 'hono/cookie'
import { signJwt } from '../helpers/jwt'

const TokenResponse = type({
  access_token: 'string',
  refresh_token: 'string',
  expires_in: 'number',
  refresh_token_expires_in: 'number',
})
// type TokenResponse = typeof TokenResponse.infer

export const connect = new Hono()
  .get(
    '/:provider',
    providerValidator,
    sValidator(
      'query',
      type({
        returnTo: 'string.url',
      })
    ),
    async (c) => {
      const { provider } = c.req.valid('param')
      const { returnTo } = c.req.valid('query')

      const { redirectUri, codeVerifier, state } = await provider.getRedirectUri()

      const oauthState = {
        codeVerifier,
        returnTo,
        state,
      }

      await setSignedCookie(c, 'teachstack.oauthState', JSON.stringify(oauthState), {
        httpOnly: true,
        secure: true,
        path: '/connect',
        maxAge: 60 * 15, // 15 minutes
        sameSite: 'lax',
      })

      return c.json({ redirectUri })
    }
  )
  .get('/:provider/callback', providerValidator, oauthCookieValidator, async (c) => {
    const { provider } = c.req.valid('param')

    const { oauthState } = c.req.valid('cookie')

    console.debug('OAuth State:', oauthState)

    try {
      const response = await provider.handleCallback(c.req.url, oauthState)

      const tokens = TokenResponse(response)

      if (tokens instanceof ArkErrors) {
        console.error('Token validation failed:', tokens.toJSON())
        return c.json({ error: 'Invalid token response' }, 500)
      }

      const existingUser = await getSessionUser(c, provider.key)

      let userId = nanoid()

      if (existingUser) {
        userId = existingUser.id
      }

      const db = getDB(c)

      await db
        .prepare(`INSERT INTO users (id, provider, refresh_token)
          VALUES (?, ?, ?)
          ON CONFLICT(id, provider)
          DO UPDATE SET 
            refresh_token = excluded.refresh_token,
            updated = unixepoch()
        `)
        .bind(userId, provider.key, tokens.refresh_token)
        .run()

      const jwt = await signJwt({ sub: userId })

      setCookie(c, 'teachstack.session', jwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      })

      return c.redirect(oauthState.returnTo)
    } catch (error) {
      console.error('Error handling OAuth callback:', error)
      return c.json({ error: 'Failed to handle OAuth callback' }, 500)
    }
  })
