import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { connect } from './routes/connect'
import { env } from './env'

const app = new Hono()
  .use(
    '*',
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    }),
  )
  .route('/connect', connect)
  .get('/ping', (r) => r.json({ msg: 'pong' }))

export default app
