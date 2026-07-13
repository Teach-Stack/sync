import arkenv from 'arkenv'
import { type } from 'arktype'

import { env as cloudflareEnv } from 'cloudflare:workers'

export const env = arkenv(
  {
    BASE_URL: 'string',
    SECRET_KEY: 'string',
    ALLOWED_ORIGINS: type('string[]').default(() => ['http://localhost:5173']),
    'GOOGLE_CLIENT_ID?': 'string',
    'GOOGLE_CLIENT_SECRET?': 'string',
    'MICROSOFT_CLIENT_ID?': 'string',
    'MICROSOFT_CLIENT_SECRET?': 'string',
  },
  {
    env: cloudflareEnv as unknown as Record<string, string>,
  }
)

export type EnvKey = keyof typeof env
