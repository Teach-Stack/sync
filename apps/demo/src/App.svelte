<script>
import { createClient } from '@teach-stack/auth'
import TestButton from './TestButton.svelte'

const authClient = createClient('http://localhost:8787')
</script>


<h1>@teach-stack/auth demo site</h1>

<main>
  <section data-title="/ping">
    <TestButton onclick={authClient.ping.$get} />
  </section>
  <section data-title="/providers">

  </section>
  <section data-title="/me">

  </section>

  <section data-title="/connect/:provider">

    <TestButton onclick={() => authClient.connect[':provider'].$get({ param: {provider: 'google'}, query: { returnTo: 'http://localhost:5137'} })} />
  </section>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: repeat( auto-fit, minmax(450px, 1fr) );
    gap: 8px;
    section {
      border: 1px solid black;
      padding: 12px;
      position: relative;
      display: flex;
      flex-direction: column;
      &::before {
        content: attr(data-title);
        font-family: monospace;
        position: absolute;
        top: -8px;
        background-color: white;
        padding-inline: 8px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
</style>