import { Hono } from 'hono'
import { userSession } from '../middleware/session'

export const auth = new Hono().get('/status', userSession, async (c) => {
  const user = c.var.user

  return c.json(user)
})
