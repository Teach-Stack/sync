import { Hono } from 'hono'

import { connect } from './routes/connect'

const app = new Hono().route('/connect', connect)

export default app
