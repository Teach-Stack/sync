import { type } from 'arktype'
import { env, type EnvKey } from './env'

import * as client from 'openid-client'

export const ProviderKey = type(`'google' | 'microsoft'`)
export type ProviderKey = type.infer<typeof ProviderKey>

class Provider {
  configuration?: client.Configuration

  constructor(
    public key: ProviderKey,
    public clientIdKey: EnvKey,
    public clientSecretKey: EnvKey,
    public scopes: string[],
    public discoveryUrl: URL,
  ) {}

  get clientId() {
    return env[this.clientIdKey]
  }

  get clientSecret() {
    return env[this.clientSecretKey]
  }

  get isConfigured() {
    return this.clientId !== undefined && this.clientSecret !== undefined
  }

  async getConfiguration() {
    if (this.clientId === undefined || this.clientSecret === undefined) {
      throw new Error(`Provider ${this.key} is not configured`)
    }

    return await client.discovery(
      this.discoveryUrl,
      this.clientId,
      this.clientSecret,
    )
  }

  async getRedirectUri() {
    if (!this.configuration) {
      this.configuration = await this.getConfiguration()
    }

    const codeVerifier = client.randomPKCECodeVerifier()

    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier)

    let state = ''

    if (!this.configuration.serverMetadata().supportsPKCE()) {
      state = client.randomState()
    }

    const redirectUri = client.buildAuthorizationUrl(this.configuration, {
      scope: this.scopes.join(' '),
      redirect_uri: `${env.BASE_URL}/connect/${this.key}/callback`,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    })

    return {
      redirectUri,
      codeVerifier,
      state,
    }
  }
}

export const providers: Record<ProviderKey, Provider> = {
  google: new Provider(
    'google',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    ['email', 'https://www.googleapis.com/auth/drive.appdata'],
    new URL('https://accounts.google.com/.well-known/openid-configuration'),
  ),
  microsoft: new Provider(
    'microsoft',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    ['email', 'Files.ReadWrite.AppFolder'],
    new URL(
      'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    ),
  ),
}
