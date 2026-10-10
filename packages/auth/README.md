# @teach-stack/auth

Client SDK for interfacing with the `apps/server` server.

Built on [Hono](https://hono.dev)'s RPC client, so requests to the auth server are type-safe.

## Example usage

```ts
import { createClient } from '@teach-stack/auth'

const client = createClient('https://auth.teachstack.org')

client.connect[':provider'].$get({ param: { provider: 'google' } }).then((res) => {
  // redirect to the provider's auth page
  window.location.href = res.url
})
```

For the full API reference, see Hono's client documentation: https://hono.dev/docs/guides/rpc#client

A full example is in the monorepo's [`/apps/demo/`](https://github.com/teach-stack/sync/tree/main/apps/demo) directory. It shows how to use the client SDK to authenticate providers and sync with SignalDB.
