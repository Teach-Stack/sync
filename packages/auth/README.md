# @teach-stack/auth

Client SDK for interfacing with the `apps/auth` server.

Built using [Hono](https://hono.dev)'s RPC client, which provides type safety and a simple API for making requests to the auth server.


## Example usage

```ts 
import { createClient } from '@teach-stack/auth'


const client = createClient('https://auth.teachstack.org')


client.connect[':provider']
.$get({ param: { provider: 'google' } })
.then((res) => {
  // redirect to the provider's auth page
  window.location.href = res.url
})
```

For full reference utilize Hono's client API documentation: https://hono.dev/docs/guides/rpc#client


Full example is available in the [`/apps/demo/`](https://github.com/teach-stack/sync/tree/main/apps/demo) directory of the monorepo, which demonstrates how to use the client SDK to authenticate providers and sync with SignalDB.
