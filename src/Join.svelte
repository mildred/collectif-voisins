<script>
  // vim: ft=html
  import { createEventDispatcher } from 'svelte';
  import Modal from './Modal.svelte'
  import { BarLoader } from 'svelte-loading-spinners';
  import {session} from './stores.js'

  export let show
  export let guid

  let dispatch = createEventDispatcher()
  let busy = false
  let nick

  async function join() {
    busy = true
    console.log("Rejoin %s as %s <%s>", guid, nick.value, $session.email)

    let params = new FormData()
    params.append("self_nickname", nick.value)

    let res = await fetch(`/.well-known/disputatio/g:${guid}/join/`, {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': `bearer ${$session.token}`
      }
    })
    let json = await res.json()

    busy = false
    show = false
    dispatch('join', json)
  }

  function cancel() {
    show = false
  }

  $: if (!show) busy = false

</script>
<style>

</style>

<Modal bind:show={show}>
  <h1>Rejoindre</h1>
  <form on:submit|preventDefault={join}>
    <label class="fill">
      <strong>Nom d'utilisateur</strong>
      <input name="nickname" type="text" bind:this={nick} required pattern=".+" disabled={busy}/>
    </label>
    {#if busy}
      <center><BarLoader/></center>
    {/if}
    <p>
      <button class="primary" type="submit">Rejoindre</button>
      <button class="secondary" on:click|preventDefault={cancel}>Annuler</button>
    </p>
  </form>
</Modal>
