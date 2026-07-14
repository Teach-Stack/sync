import { type } from 'arktype'
import { env, type EnvKey } from './env'

import * as client from 'openid-client'

import { logger } from './helpers/log'

const log = logger.withTag('provider')

export const ProviderKeys = ['google', 'microsoft'] as const
export const ProviderKey = type.enumerated(...ProviderKeys)
export type ProviderKey = type.infer<typeof ProviderKey>

export class Provider {
  configuration?: client.Configuration

  constructor(
    public key: ProviderKey,
    public clientIdKey: EnvKey,
    public clientSecretKey: EnvKey,
    public scopes: string[],
    public discoveryUrl: URL
  ) {}

  get clientId() {
    const clientId = env[this.clientIdKey]

    if (typeof clientId !== 'string') throw new Error('client id must be a string')

    return clientId
  }

  get clientSecret() {
    const clientSecret = env[this.clientSecretKey]

    if (typeof clientSecret !== 'string') throw new Error('client secret must be a string')

    return clientSecret
  }

  get isConfigured() {
    return this.clientId !== undefined && this.clientSecret !== undefined
  }

  async getConfiguration() {
    if (this.clientId === undefined || this.clientSecret === undefined) {
      throw new Error(`Provider ${this.key} is not configured`)
    }

    log.debug('running oidc discovery', {
      provider: this.key,
      discoveryUrl: this.discoveryUrl.href,
    })

    return await client.discovery(this.discoveryUrl, this.clientId, this.clientSecret)
  }

  async getRedirectUri() {
    if (!this.configuration) {
      this.configuration = await this.getConfiguration()
    }

    const codeVerifier = client.randomPKCECodeVerifier()

    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier)

    const state = client.randomState()

    const redirectUri = client.buildAuthorizationUrl(this.configuration, {
      scope: this.scopes.join(' '),
      redirect_uri: `${env.BASE_URL}/connect/${this.key}/callback`,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      access_type: 'offline',
      prompt: 'consent',
    })

    log.debug('built authorization url', {
      provider: this.key,
      scopes: this.scopes,
      redirectUri: `${env.BASE_URL}/connect/${this.key}/callback`,
    })

    return {
      redirectUri,
      codeVerifier,
      state,
    }
  }

  async handleCallback(url: URL | string, oauthState: { codeVerifier: string; state: string }) {
    if (!this.configuration) {
      this.configuration = await this.getConfiguration()
    }

    if (!(url instanceof URL)) {
      url = new URL(url)
    }

    log.debug('exchanging authorization code for tokens', { provider: this.key })

    const tokens = await client.authorizationCodeGrant(this.configuration, url, {
      pkceCodeVerifier: oauthState.codeVerifier,
      expectedState: oauthState.state,
    })

    log.debug('token exchange complete', { provider: this.key })

    return tokens
  }
}

export const providers: Record<ProviderKey, Provider> = {
  google: new Provider(
    'google',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    ['email', 'https://www.googleapis.com/auth/drive.appdata'],
    new URL('https://accounts.google.com/.well-known/openid-configuration')
  ),
  microsoft: new Provider(
    'microsoft',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    ['email', 'Files.ReadWrite.AppFolder'],
    new URL('https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration')
  ),
}
