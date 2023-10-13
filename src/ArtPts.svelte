<script>
  // vim: ft=html
  import Popover from 'svelte-popover';
  import {session} from './stores.js'

  export let pts
  export let group_guid
  export let article_guid

  let open = false;

  async function vote(params) {
    let res = await fetch(`/.well-known/disputatio/g:${group_guid}/a:${article_guid}/vote/`, {
      method: 'POST',
      body: new URLSearchParams(params),
      headers: {
        'Authorization': $session.token ? `bearer ${$session.token}` : null
      }
    })
    let json
    try {
      json = await res.json()
    } catch {
      alert(`Erreur: ${res.status} ${res.statusText}`)
      return
    }
    if (json.error) {
      alert(`Erreur: ${json.error}`)
      return
    }
    pts = json.score
    open = false;
  }

  function promote() {
    vote({vote_inc: 1})
  }

  function demote() {
    vote({vote_dec: 1})
  }
</script>

<span class="main">
  <Popover overlayColor='rgba(1,1,1,0)' bind:open={open}>
  <span class="pts" slot="target">{pts} pts</span>
  <div slot="content" class="popover-content">
    <div><a href="#" on:click|preventDefault={promote}>promouvoir</a></div>
    <div><a href="#" on:click|preventDefault={demote}>cacher</a></div>
  </div>
</Popover>
</span>


<style>
  span.main {
    display: inline-block;
  }
  .pts {
    cursor: pointer;
  }
  span.main > :global(.popover) > :global(.overlay) {
    /*display: none;*/
    cursor: default;
  }
  span.main > :global(.popover) > :global(.content) > :global(.arrow) {
    color: #888888;
  }
  .popover-content {
    padding: 0.5em 1em;
    background-color: #ffffff;
    border: thin solid #888888;
    border-radius: 0.25rem;
    position: relative;
    z-index: 1;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
</style>
