<script>
  // vim: ft=html
  import { createEventDispatcher } from 'svelte';
  import Portal from "svelte-portal";

  let dispatch = createEventDispatcher()
  let container;

  export let show = false

  function close_modal(e) {
    if (e.target != container) return

    const cont = dispatch('close', {
      originalEvent: e
    }, { cancelable: true })

    if (cont) show = false
  }
</script>

<style>
  .backdrop {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    opacity: 0.25;
  }

  .modal-container {
    position: absolute;
    left: 0;
    top: 0;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
  }

  .modal-dialog {
    margin: 5rem;
    padding: 1rem 2rem;
    background-color: white;
    width: min(90vw, 40rem);
    border: solid thin black;
    border-radius: 0.25rem;
  }
</style>

<Portal target="body">
  <div class="modal">
    {#if show}
      <div class="backdrop" on:click={close_modal}></div>
      <div class="modal-container" on:click={close_modal} bind:this={container}>
        <div class="modal-dialog">
          <slot></slot>
        </div>
      </div>
    {/if}
  </div>
</Portal>
