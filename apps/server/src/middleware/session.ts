import { createMiddleware } from 'hono/factory'

import { logger } from '../helpers/log'
import { getSessionUser, type User } from '../helpers/user'

const log = logger.withTag('session')

export const userSession = createMiddleware<{ Variables: { user: User } }>(async (c, next) => {
  const user = await getSessionUser(c)

  if (user === null) {
    log.debug('no valid user session found')
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', user)

  await next()
})
