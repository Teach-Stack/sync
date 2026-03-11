import arkenv from 'arkenv'

export const env = arkenv({
  'GOOGLE_CLIENT_ID?': 'string',
  'GOOGLE_CLIENT_SECRET?': 'string',
  'MICROSOFT_CLIENT_ID?': 'string',
  'MICROSOFT_CLIENT_SECRET?': 'string',
})
