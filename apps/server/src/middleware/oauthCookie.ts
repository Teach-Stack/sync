import { createMiddleware } from 'hono/factory'
import { ArkErrors, type } from 'arktype'

import { getSignedCookie } from '../helpers/cookies'
import { logger } from '../helpers/log'

const log = logger.withTag('cookie')

const OAuthStateCookie = type({
  codeVerifier: 'string',
  returnTo: 'string.url',
  state: 'string',
})

type OAuthStateCookie = type.infer<typeof OAuthStateCookie>

export const oauthCookie = createMiddleware<{ Variables: { oauthState: OAuthStateCookie } }>(
  async (c, next) => {
    const raw = await getSignedCookie(c, 'teachstack.oauthState')

    if (raw === undefined) {
      log.debug('no oauth state cookie found')
      return c.json({ error: 'No OAuth State Cookie Found' }, 400)
    }

    const parsed = JSON.parse(raw)

    const oauthState = OAuthStateCookie(parsed)

    if (oauthState instanceof ArkErrors) {
      log.debug('oauth state is invalid shape', oauthState.toJSON())
      return c.json({ error: 'Invalid OAuth state cookie' }, 400)
    }

    c.set('oauthState', oauthState)

    await next()
  }
)
