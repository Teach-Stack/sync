<script lang="ts" module>
import { type ClientResponse } from '@teach-stack/auth'
</script>

<script lang="ts" generics="T extends ClientResponse<unknown>">
import type { Snippet } from 'svelte'

interface Props {
  onclick: () => Promise<T>
  // children: Snippet
}

let { onclick }: Props = $props()

let status = $state<string>('pending')

let output = $state<string>()

function handleClick() {
  status = 'loading'
  output = ''
  onclick().then(async v => {
    output = JSON.stringify(await v.json(), null, 2)
    status = v.ok ? 'success' : 'failed'
  }).catch(e => {
    output = e
    status = 'error'
  })
}

</script>


<button onclick={handleClick}>
  Execute
</button>
<p>Status: {status}</p>
<p>Output:</p>
<pre>{output}</pre>


<style>
* {
  margin: 0;
}
button {
  padding: 6px;
  cursor: pointer;
}
  pre {
    color: white;
    background: black;
    padding: 8px;
    height: 128px;
    overflow: scroll;
  }
</style>