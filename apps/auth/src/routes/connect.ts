import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'

import { ArkErrors, type } from 'arktype'

import { oauthCookieValidator } from '../validators/cookie'
import { setSignedCookie } from '../helpers/cookies'
import { providerValidator } from '../validators/provider'
import { getSessionUser } from '../helpers/user'
import { nanoid } from 'nanoid'
import { getDB } from '../helpers/db'

const TokenResponse = type({
  access_token: 'string',
  refresh_token: 'string',
  expires_in: 'number',
  refresh_expires_in: 'number',
})
// type TokenResponse = typeof TokenResponse.infer

export const connect = new Hono()
  .get(
    '/:provider',
    providerValidator,
    sValidator(
      'query',
      type({
        returnTo: 'string',
      }),
    ),
    async (c) => {
      const { provider } = c.req.valid('param')
      const { returnTo } = c.req.valid('query')

      const { redirectUri, codeVerifier, state } =
        await provider.getRedirectUri()

      const oauthState = {
        codeVerifier,
        returnTo,
        state,
      }

      await setSignedCookie(
        c,
        'teachstack:oauthState',
        JSON.stringify(oauthState),
        {
          httpOnly: true,
          secure: true,
          path: '/connect',
          maxAge: 60 * 15, // 15 minutes
          sameSite: 'lax',
        },
      )

      return c.json({ redirectUri })
    },
  )
  .get(
    '/:provider/callback',
    providerValidator,
    oauthCookieValidator,
    async (c) => {
      const { provider } = c.req.valid('param')

      const { oauthState } = c.req.valid('cookie')

      console.debug('OAuth State:', oauthState)

      try {
        const response = await provider.handleCallback(c.req.url, oauthState)

        const tokens = TokenResponse(response)

        if (tokens instanceof ArkErrors) {
          console.error('Token validation failed:', tokens)
          return c.json({ error: 'Invalid token response' }, 500)
        }

        const existingUser = await getSessionUser(c, provider.key)

        let userId = nanoid()

        if (existingUser) {
          userId = existingUser.id
        }

        const db = getDB(c)

        db.prepare(`INSERT INTO users (id, provider, encoded_token)
          VALUES (?, ?, ?)
          ON CONFLICT(id, provider) DO UPDATE SET encoded_token = excluded.encoded_token
        `)
          .bind(userId, provider.key)
          .run()

        return c.json({ tokens })
      } catch (error) {
        console.error('Error handling OAuth callback:', error)
        return c.json({ error: 'Failed to handle OAuth callback' }, 500)
      }
    },
  )
