import { Hono } from 'hono'
import { providerValidator } from '../helpers/providers'

export const connect = new Hono().get('/:provider', providerValidator, (c) => {
  const { provider } = c.req.valid('param')

  return c.json({ provider })
})
