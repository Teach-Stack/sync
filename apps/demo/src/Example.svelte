<script lang="ts">
  import { createClient, type ProviderKey, ProviderKeys } from '@teach-stack/auth'

  const authClient = createClient('http://localhost:8787')

  let isAuthenticated = $state(false)
  let providers = $state<ProviderKey[]>([])

  let enabledProviders = $state<{
    [key in ProviderKey]: boolean
  }>({
    google: false,
    microsoft: true,
  })

  $effect(() => {
    authClient.connect.providers.$get().then(async (r) => {
      if (r.ok) {
        enabledProviders = await r.json()
      } else {
        providers = []
      }
    })
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

  let tokenResult = $state<string>()
  let accessTokens = $state<Partial<Record<ProviderKey, string>>>({})

  async function getToken(provider: ProviderKey) {
    const response = await authClient.auth.token[':provider'].$post({ param: { provider } })
    const body = await response.json()
    if ('access_token' in body) {
      accessTokens[provider] = body.access_token
      tokenResult = `${provider}: ${body.access_token.slice(0, 12)}… (expires in ${body.expires_in}s)`
    } else if (body.error === 'reauth_required') {
      if (confirm(`${provider} access expired. Reconnect?`)) login(provider)
    } else {
      tokenResult = `${provider}: ${body.error}`
    }
  }

  // Drive scope is drive.appdata, so everything lives in the hidden appDataFolder
  const DRIVE = 'https://www.googleapis.com/drive/v3/files'
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'

  let fileName = $state('test.txt')
  let fileContent = $state('hello from teachstack')
  let driveResult = $state<string>()

  async function drive(url: string, init: RequestInit = {}) {
    const response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${accessTokens.google}`, ...init.headers },
    })
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
    return response
  }

  async function findFileId() {
    const q = encodeURIComponent(`name = '${fileName.replaceAll("'", "\\'")}'`)
    const response = await drive(`${DRIVE}?spaces=appDataFolder&fields=files(id)&q=${q}`)
    const { files } = await response.json()
    return files[0]?.id as string | undefined
  }

  async function writeFile() {
    try {
      const id = await findFileId()
      if (id) {
        await drive(`${UPLOAD}/${id}?uploadType=media`, { method: 'PATCH', body: fileContent })
      } else {
        const form = new FormData()
        form.append(
          'metadata',
          new Blob([JSON.stringify({ name: fileName, parents: ['appDataFolder'] })], {
            type: 'application/json',
          })
        )
        form.append('file', new Blob([fileContent], { type: 'text/plain' }))
        await drive(`${UPLOAD}?uploadType=multipart`, { method: 'POST', body: form })
      }
      driveResult = `${id ? 'updated' : 'created'} ${fileName}`
    } catch (e) {
      driveResult = String(e)
    }
  }

  async function readFile() {
    try {
      const id = await findFileId()
      if (!id) {
        driveResult = `${fileName} not found`
        return
      }
      fileContent = await (await drive(`${DRIVE}/${id}?alt=media`)).text()
      driveResult = `read ${fileName}`
    } catch (e) {
      driveResult = String(e)
    }
  }
</script>

<section id="flow">
  <h2>Example Flow</h2>
  <p>Auth Status: {isAuthenticated}</p>
  {#if isAuthenticated}
    {#each providers as provider}
      <button onclick={() => getToken(provider)}>get {provider} access token</button>
    {/each}
    {#if tokenResult}<p>{tokenResult}</p>{/if}
    <p>connected providers: {providers.join(',')}</p>
    {#if accessTokens.google}
      <h3>Google Drive (appDataFolder)</h3>
      <label>File name <input bind:value={fileName} /></label>
      <label>Content <textarea bind:value={fileContent}></textarea></label>
      <button onclick={writeFile}>write file</button>
      <button onclick={readFile}>read file</button>
      {#if driveResult}<p>{driveResult}</p>{/if}
    {/if}
  {:else}
    {#each ProviderKeys as provider}
      <button onclick={() => login(provider)} disabled={!enabledProviders[provider]}
        >{provider}</button
      >
    {/each}
  {/if}
</section>
