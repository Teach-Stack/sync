<script>
  import { createClient } from '@teach-stack/auth'
  import TestButton from './TestButton.svelte'
  import Example from './Example.svelte'

  const authClient = createClient('http://localhost:8787')
</script>

<h1>@teach-stack/auth demo site</h1>

<main>
  <Example />
  <hr />
  <section id="api">
    <h2>API Kitchen Sink</h2>
    <article data-title="/ping">
      <TestButton onclick={authClient.ping.$get} />
    </article>
    <article data-title="/connect/providers">
      <TestButton onclick={authClient.connect.providers.$get} />
    </article>
    <article data-title="/connect/:provider">
      <TestButton
        onclick={() =>
          authClient.connect[':provider'].$get({
            param: { provider: 'google' },
            query: { returnTo: 'http://localhost:5173' },
          })}
      />
    </article>
    <article data-title="/auth/status">
      <TestButton onclick={authClient.auth.status.$get} />
    </article>
    <article data-title="/auth/token"></article>
  </section>
</main>

<style>
  #api {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 8px;
    > h2 {
      grid-column: 1/-1;
    }
    article {
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
