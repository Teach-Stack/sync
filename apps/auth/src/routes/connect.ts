import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'

import { type } from 'arktype'
import { providerValidator } from '../helpers/providers'

export const connect = new Hono()
  .get(
    '/:provider',
    providerValidator,
    sValidator(
      'query',
      type({
        redirect_uri: 'string',
      }),
    ),
    (c) => {
      const { provider } = c.req.valid('param')
      const { redirect_uri } = c.req.valid('query')

      return c.json({ provider, redirect_uri })
    },
  )
  .get('/:provider/callback', providerValidator, (c) => {
    const { provider } = c.req.valid('param')

    return c.json({ provider })
  })
