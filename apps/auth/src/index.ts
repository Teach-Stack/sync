import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { connect } from './routes/connect'

const app = new Hono()
  .use(
    '*',
    cors({
      origin: 'http://localhost:5173',
      allowMethods: ['POST', 'GET', 'OPTIONS'],
    }),
  )
  .route('/connect', connect)
  .get('/ping', (r) => r.json({ msg: 'pong' }))

export default app
