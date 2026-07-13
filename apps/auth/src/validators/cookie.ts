import { validator } from 'hono/validator'
import { ArkErrors, type } from 'arktype'

import { getSignedCookie } from '../helpers/cookies'

const OAuthStateCookie = type({
  codeVerifier: 'string',
  returnTo: 'string.url',
  state: 'string',
})

export const oauthCookieValidator = validator('cookie', async (_, c) => {
  const raw = await getSignedCookie(c, 'teachstack.oauthState')

  if (raw === undefined) {
    return c.json({ error: 'No OAuth State Cookie Found' }, 400)
  }

  const parsed = raw ? JSON.parse(raw) : null

  const oauthState = OAuthStateCookie(parsed)

  if (oauthState instanceof ArkErrors) {
    console.debug("oauth state is invalid shape", oauthState.toJSON())
    return c.json({ error: 'Invalid OAuth state cookie' }, 400)
  }

  return { oauthState }
})
