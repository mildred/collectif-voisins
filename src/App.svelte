<script>
  // vim: ft=html
  import {Route, router} from 'tinro';
  router.mode.hash(); // enables hash navigation method

  import Welcome from './Welcome.svelte'
  import City from './City.svelte'

</script>

<style>
  .main {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    min-height: 100vh;
  }
</style>

<div class="main">
<Route firstmatch>
  <Route path="/c/:city/*" let:meta>
    <City code={meta.params.city.split('-')[0]} name={decodeURI(meta.params.city.replace(/^[^-]*-/, ''))}/>
  </Route>
  <Route>
    <Welcome/>
  </Route>
</Route>
</div>
