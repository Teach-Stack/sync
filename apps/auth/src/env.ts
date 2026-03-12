import arkenv from 'arkenv'

export const env = arkenv({
  BASE_URL: 'string',
  SECRET_KEY: 'string',
  'GOOGLE_CLIENT_ID?': 'string',
  'GOOGLE_CLIENT_SECRET?': 'string',
  'MICROSOFT_CLIENT_ID?': 'string',
  'MICROSOFT_CLIENT_SECRET?': 'string',
})

export type EnvKey = keyof typeof env
