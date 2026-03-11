import { Hono } from 'hono'

import { hc } from 'hono/client'
import { connect } from './routes/connect'

const app = new Hono().route('/connect', connect)

export default app

export type Client = ReturnType<typeof hc<typeof app>>

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args)
