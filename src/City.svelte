<script>
  // vim: ft=html
  import {Route} from 'tinro';
  import {debounce, disputatio_guid} from './utils.js'
  import {async_derived} from './utils/store.js'
  import Login from './Login.svelte'
  import Posts from './Posts.svelte'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';
  import { BarLoader } from 'svelte-loading-spinners';


  export let code;
  export let name;

  let root_guid = async_derived(null, async () => await disputatio_guid({
    t: 'group-item',
    n: name,
    gt: 3,
    ud: `collectif-voisins:insee:${code}`,
    ow: 1,
    s: 1,
    m: []
  }))

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

    <Route path="/r/:reference/*" let:meta>
      <center>
        <a href="#{prefix}">Revenir aux sujets</a>
      </center>
      <Posts root_guid={$root_guid} ref_guid={meta.params.reference}
             url_prefix={prefix} />
    </Route>

    <Route>
      <Posts root_guid={$root_guid} url_prefix={prefix} />
    </Route>
  </Route>
{/if}

