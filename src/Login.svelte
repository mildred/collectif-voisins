<script>
  // vim: ft=html
  import {Route} from 'tinro';
  import {session} from './stores.js'
  import Posts from './Posts.svelte'
  import Modal from './Modal.svelte'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';
  import { BarLoader } from 'svelte-loading-spinners';

  let login_started = false
  let login_ask_code = false
  let login_spinner = false
  let email = null
  let code = null
  let already_have_a_code = false

  function start_login() {
    login_started = true
    login_ask_code = false
    login_spinner = false
  }

  function cancel_login() {
    login_started = false
  }

  async function request_code() {
    let req = new FormData()
    req.set("email", email.value)
    req.set("email_subject_template", "Votre code d'accès: {code}")
    req.set("email_body_template",
      "Votre code de connexion:\n\n" +
      "\t{code}\n\n" +
      "-- \n" +
      "Ne pas répondre à ce message automatique")
    let res = await fetch('/.well-known/disputatio/login', {
      method: 'POST',
      body: req
    })
    let json = await res.json()
    console.log(json)
  }

  async function check_code() {
    let req = new FormData()
    req.set("email", email.value)
    req.set("otp", code.value)
    let res = await fetch('/.well-known/disputatio/login', {
      method: 'POST',
      body: req
    })
    let json = await res.json()
    console.log(json)
    return json
  }

  async function continue_login(e) {
    e.preventDefault()
    if (login_spinner) return
    if (! login_ask_code) {
      if (!already_have_a_code) {
        login_spinner = true
        await request_code()
      }
      login_spinner = false
      login_ask_code = true
    } else {
      login_spinner = true
      let json = await check_code()
      console.log(json)
      session.update(sess => ({
        ...sess,
        email: email.value,
        token: json.token
      }))
      login_spinner = false
      login_started = false
    }
  }
</script>

<style>
  button.login {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 0.5em;
    background-color: #ddd;
    border-radius: 2rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: none;
  }

  button.login:hover {
    background-color: #ccc;
  }
  
  p {
  text-align: justify;
  }
</style>

{#if $session.token}
  <button class="login">
    <SvgIcon type='mdi' path={mdi.mdiAccount} /> {$session.email}
  </button>
{:else}
  <button class="login" on:click={start_login}>
    <SvgIcon type='mdi' path={mdi.mdiAccount} /> Se connecter
  </button>
{/if}

<Modal bind:show={login_started} on:close={cancel_login}>
  <h1>Connexion</h1>
  <p>Si vous avez déjà un compte, merci d'inscrire votre adresse e-mail pour
  vous connecter. Si vous n'avez pas de compte, en inscrivant votre e-mail
  vous recevrez un code d'accès pour créer votre compte et vous connecter.</p>
  <form on:submit={continue_login}>
    <label class="fill">
      <strong>E-mail</strong>
      <input name="email" type="email" bind:this={email} required
      pattern=".*@.*" disabled={login_ask_code} />
    </label>
    {#if !login_ask_code}
      <label class="checkbox fill">
        <input type="checkbox" bind:value={already_have_a_code} />
        <p>J'ai déjà un code d'accès</p>
      </label>
    {:else}
      {#if !already_have_a_code}
        <p>Un code d'accès vous a été envoyé par e-mail, merci de le
        recopier ci-dessous.</p>
      {/if}
      <label class="fill">
        <strong>Code d'accès</strong>
        <input name="otp" type="number" bind:this={code} required
        pattern="[0-9]*" />
      </label>
    {/if}
    {#if login_spinner}
      <center><BarLoader/></center>
    {/if}
    <p>
      <button class="primary" type="submit">Se connecter</button>
      <button class="secondary" on:click={cancel_login}>Annuler</button>
    </p>
  </form>
</Modal>
