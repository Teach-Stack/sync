import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'

import { type } from 'arktype'

import { providerValidator } from '../validator/provider'

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

      return c.json({ redirectUri })
    },
  )
  .get('/:provider/callback', providerValidator, (c) => {
    const { provider } = c.req.valid('param')

    return c.json({ provider })
  })
