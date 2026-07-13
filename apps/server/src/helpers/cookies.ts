import type { Context } from 'hono'
import * as cookie from 'hono/cookie'

import { env } from '../env'
import { logger } from './log'

const log = logger.withTag('cookie')

type CookieOptions = Parameters<typeof cookie.setCookie>[3]

export async function getSignedCookie(c: Context, name: string) {
  const value = await cookie.getSignedCookie(c, env.SECRET_KEY, name)
  log.debug('read signed cookie', { name, found: Boolean(value) })
  return value
}

export async function setSignedCookie(
  c: Context,
  name: string,
  value: string,
  opt: CookieOptions = {}
) {
  log.debug('set signed cookie', { name, options: opt })
  await cookie.setSignedCookie(c, name, value, env.SECRET_KEY, opt)
}

export function deleteCookie(c: Context, name: string) {
  log.debug('delete cookie', { name })
  return cookie.deleteCookie(c, name)
}
