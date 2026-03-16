import type { Context } from 'hono'

import { env } from 'hono/adapter'

export function getDB(c: Context) {
  const { DB } = env(c as Context<{ Bindings: { DB: D1Database } }>)
  return DB
}
