<script>
  // vim: ft=html
  import {Route} from 'tinro';
  import {debounce} from './utils.js'
  import {session} from './stores.js'
  import {store} from './utils/store.js'
  import Login from './Login.svelte'
  import Posts from './Posts.svelte'
  import NewTopic from './NewTopic.svelte'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';
  import { BarLoader } from 'svelte-loading-spinners';

  export let guid;

  let refresh = 0

  let root_guid = store(guid)
  $: root_guid.set(guid)

  let info = store(null).derive([session, root_guid], async ($info, [$session, $root_guid], update) => {
    let res = await fetch(`/.well-known/disputatio/g:${$root_guid}/info/`, {
      headers: {
        'Authorization': $session.token ? `bearer ${$session.token}` : null
      }
    })
    let json = await res.json()
    update.set(json)

    if(json.error == 'not_found') {
      dispatch('group_missing', {})
    }
  })

  let group = store(null).derive(info, ($group, $info, update) => update.set($info?.group))

  let city = store(null).derive(group, ($city, $group, update) => {
    update.set($group?.ud?.replace(/^collectif-voisins:insee:/, "") + "-" + $group?.n)
  })

  async function create_group() {
    throw Error, "not implemented"
  }

</script>

<nav class="center">
  <div class="account">
    <Login />
  </div>
  <h1><a href="#/c/{$city}/">{$group?.n}</a></h1>
</nav>

<Route firstmatch let:meta>

  {@const prefix = meta.match}
  {#key refresh}

  <Route path="/r/new/" let:meta>
    <center>
      <a href="#{prefix}">Revenir aux sujets</a>
    </center>
    <NewTopic root_guid={guid} url_prefix={prefix} />
  </Route>

  <Route path="/r/:reference/*" let:meta>
    <center>
      <a href="#{prefix}">Revenir aux sujets</a>
    </center>
    <Posts root_guid={guid} ref_guid={meta.params.reference}
           url_prefix={prefix} on:group_missing={create_group} />
  </Route>

  <Route>
    <Posts root_guid={guid} url_prefix={prefix} on:group_missing={create_group} />
  </Route>

  {/key}

</Route>

<style>
  h1 a {
    text-decoration: none;
    color: currentcolor;
  }
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

