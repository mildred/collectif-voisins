<script>
  // vim: ft=html
  import {Route} from 'tinro';
  import {debounce} from './utils.js'
  import {store} from './utils/store.js'
  import Login from './Login.svelte'
  import Posts from './Posts.svelte'
  import NewTopic from './NewTopic.svelte'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';
  import { BarLoader } from 'svelte-loading-spinners';
  import { guid, city_public_group} from './disputatio.js'


  export let code;
  export let name;

  let refresh = 0

  let group = city_public_group(code, name);
  $: group = city_public_group(code, name)

  let root_guid = store(null).init(async ($root_guid, update) => {
    update.set(await guid(group))
  })

  async function create_group() {
    console.log("Creating group %s...", $root_guid, group)
    let res = await fetch(`/.well-known/disputatio/g/`, {
      method: 'POST',
      body: JSON.stringify(group)
    })
    let json = await res.json()
    console.log("Created group", json)
    refresh = (refresh + 1) % 8
  }

</script>

<style>
  nav.center {
    padding: 1rem;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
  }
  nav.center h1 {
    text-align: center;
    max-width: 60rem;
  }
  .account {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
</style>

<nav class="center">
  <div class="account">
    <Login />
  </div>
  <h1>Commune de {name}</h1>
  <!-- {code} {$root_guid} -->
</nav>

{#if $root_guid == null}
  <center>
    <BarLoader/>
    <p>loading group...</p>
  </center>
{:else}
  <Route firstmatch let:meta>
  
    {@const prefix = meta.match}
    {#key refresh}

    <Route path="/r/new/" let:meta>
      <center>
        <a href="#{prefix}">Revenir aux sujets</a>
      </center>
      <NewTopic root_guid={$root_guid} url_prefix={prefix} />
    </Route>

    <Route path="/r/:reference/*" let:meta>
      <center>
        <a href="#{prefix}">Revenir aux sujets</a>
      </center>
      <Posts root_guid={$root_guid} ref_guid={meta.params.reference}
             url_prefix={prefix} on:group_missing={create_group} />
    </Route>

    <Route>
      <Posts root_guid={$root_guid} url_prefix={prefix} on:group_missing={create_group} />
    </Route>

    {/key}

  </Route>
{/if}

