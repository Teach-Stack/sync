<script lang="ts">
  import { createClient, type ProviderKey, ProviderKeys } from '@teach-stack/auth'

  const authClient = createClient('http://localhost:8787')

  let isAuthenticated = $state(false)
  let providers = $state<ProviderKey[]>([])

  $effect(() => {
    authClient.auth.status.$get().then(async (r) => {
      if (r.ok) {
        isAuthenticated = true
        providers = (await r.json()).providers
      } else {
        isAuthenticated = false
      }
    })
  })

  async function login(provider: ProviderKey) {
    const response = await authClient.connect[':provider'].$get({
      param: { provider },
      query: { returnTo: 'http://localhost:5173' },
    })
    if (response.ok) {
      const { redirectUri } = await response.json()
      window.location.href = redirectUri
    } else { 
      alert('Failed to initiate login flow')
    }
  }
</script>

<section id="flow">
  <h2>Example Flow</h2>
  <p>Auth Status: {isAuthenticated}</p>
  {#if isAuthenticated}
    <button>refresh token</button>
    <p>connected providers: {providers.join(',')}</p>
  {:else}
    {#each ProviderKeys as provider}
      <button onclick={() => login(provider)}>{provider}</button>
    {/each}
  {/if}
  
</section>
