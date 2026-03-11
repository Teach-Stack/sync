import { Hono } from 'hono'

import { connect } from './routes/connect'

const app = new Hono().route('/connect', connect)

export type AppType = typeof app

export default app
