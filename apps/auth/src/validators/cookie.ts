import { validator } from 'hono/validator'
import { ArkErrors, type } from 'arktype'

import { getSignedCookie } from '../helpers/cookies'

const OAuthStateCookie = type({
  codeVerifier: 'string',
  returnTo: 'string.url',
  state: 'string',
})

export const oauthCookieValidator = validator('cookie', async (value, c) => {
  const raw = await getSignedCookie(c, 'oauthState')

  const parsed = raw ? JSON.parse(raw) : null

  const oauthState = OAuthStateCookie(parsed)

  if (oauthState instanceof ArkErrors) {
    return c.json({ error: 'Invalid OAuth state cookie' }, 400)
  }

  return { oauthState }
})
