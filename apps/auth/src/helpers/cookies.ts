import type { Context } from 'hono'
import * as cookie from 'hono/cookie'

import { env } from '../env'

type CookieOptions = Parameters<typeof cookie.setCookie>[3]

export async function getSignedCookie(c: Context, name: string) {
  return await cookie.getSignedCookie(c, env.SECRET_KEY, name)
}

export async function setSignedCookie(
  c: Context,
  name: string,
  value: string,
  opt: CookieOptions = {},
) {
  await cookie.setSignedCookie(c, name, value, env.SECRET_KEY, opt)
}

export function deleteCookie(c: Context, name: string) {
  return cookie.deleteCookie(c, name)
}
