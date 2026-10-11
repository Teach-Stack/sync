# @teach-stack/auth

Client SDK for interfacing with the `apps/server` server.

Built on [Hono](https://hono.dev)'s RPC client, so requests to the auth server are type-safe.

## Example usage

```ts
import { createClient, type ProviderKey } from '@teach-stack/auth'

const client = createClient('https://auth.teachstack.org')

// 1. Send the user to the provider's consent page.
//    After the callback, the server sets a session cookie and redirects back to `returnTo`.
async function connect(provider: ProviderKey) {
  const res = await client.connect[':provider'].$get({
    param: { provider },
    query: { returnTo: window.location.href },
  })
  const { redirectUri } = await res.json()
  window.location.href = redirectUri
}

// 2. On page load, check the session and see which providers are connected.
const status = await client.auth.status.$get()
if (status.ok) {
  const { providers } = await status.json() // e.g. ['google']
}

// 3. Get a fresh access token for a connected provider.
//    The refresh token stays on the server; only the access token is returned.
async function getAccessToken(provider: ProviderKey) {
  const res = await client.auth.token[':provider'].$post({ param: { provider } })
  const body = await res.json()

  if ('access_token' in body) return body.access_token // valid for body.expires_in seconds

  // The provider revoked or expired the refresh token, so the user has to connect again.
  if (body.error === 'reauth_required') return connect(provider)

  throw new Error(body.error)
}

// 4. Call the provider's API with the token.
const token = await getAccessToken('google')
await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
  headers: { Authorization: `Bearer ${token}` },
})
```

For the full API reference, see Hono's client documentation: https://hono.dev/docs/guides/rpc#client

A full example is in the monorepo's [`/apps/demo/`](https://github.com/teach-stack/sync/tree/main/apps/demo) directory. It shows how to use the client SDK to authenticate providers and sync with SignalDB.
