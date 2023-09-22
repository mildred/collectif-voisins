<script>
  // vim: ft=html
  import {debounce} from './utils.js'

  let results = []

  async function do_search_commune(e) {
    let q = e.target.value
    let res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${escape(q)}&type=municipality`)
    let json = await res.json()
    console.log(json)
    results = json.features.map(feat => feat.properties)
  }

</script>

<style>
  center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column nowrap;
    height: 100vh;
  }

  .city {
    display: flex;
    flex-flow: column nowrap;
    border: thin solid #888888;
    margin: 0.5rem;
    padding: 0.25rem;
    width: min(100%, 30em);
    color: inherit;
    text-decoration: none;
  }

  .city:hover {
    background-color: #eeeeee
  }
</style>

<center>
  Voir la commune&nbsp;:
  <br/>
  <input type="text" on:input={debounce(600, do_search_commune)} />

  {#if results.length > 0}
    {#each results as res}
      <a href="#/c/{res.citycode}-{res.city}/" class="city">
        <div><strong>{res.city}</strong>, {res.postcode}</div>
        <em>{res.context}</em>
      </a>
    {/each}
  {/if}
</center>

