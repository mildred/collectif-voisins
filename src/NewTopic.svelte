<script>
  // vim: ft=html
  import {router} from 'tinro';
  import { BarLoader } from 'svelte-loading-spinners';
  import Editor from './Editor.svelte'
  import {async_derived, store} from './utils/store.js'
  import {disputatio_query} from './utils.js'
  import {session} from './stores.js'
  import {to_html} from './art_html.js'

  export let root_guid
  export let ref_guid
  export let url_prefix

  let topic_editor
  async function load_info($session) {
    if (!$session.email) return null

    let res = await fetch(`/.well-known/disputatio/g:${root_guid}/info/`, {
      headers: {
        'Authorization': `bearer ${$session.token}`
      }
    })
    let json = await res.json()
    console.log(json)
    return json
  }

  const ref_topic = store(null)

  async function save_topic(e) {
    topic_editor.disabled = true
    let params = new FormData()
    params.append('html', e.detail.html)
    params.append('kind', 'topic')
    params.append('parent_patch', '')
    params.append('reply_guid', '')
    let res = await fetch(`/.well-known/disputatio/g:${root_guid}/posts/`, {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': `bearer ${$session.token}`
      }
    })
    topic_editor.disabled = false
    topic_editor.clear()
    comments.restart()
    router.goto(`${url_prefix}`)
  }

  const topics = store(null)
  const comments = store(null)
  const info = store(null)
    .derive(session, async ($info, $session, update) => {
      if($session?.email) update.set(await load_info($session))
    })
</script>

<style>
  .main {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    flex-grow: 1;
  }

  .member-info {
    text-align: justify;
    align-self: center;
  }

  section {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 2rem 0;
  }

  section > * {
    width: min(100%, 60rem);
  }

  section.topics {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  section.comments {
    background-color: #f8f8f8;
    flex-grow: 1;
  }

  article.topic {
    border: thin solid #888888;
    margin: 0.5rem;
    padding: 0;
    border-radius: 0.25rem;
  }

  article.topic.new {
    --color-editor-unsaved: #f8f8f8;
  }

  article.topic.new :global([contenteditable]) {
    background-color: #ffffff;
    padding: 1rem 0.5rem;;
    border-radius: 0.25rem;
  }

</style>

<div class="main">
  <section class="topics">
    {#if $info?.member}
      <article class="head topic new">
        <Editor on:save={save_topic} bind:this={topic_editor}
                fullpage={true}
                markup={"<h1></h1><p></p>"}/>
      </article>
    {/if}
  </section>
  <section class="comments">
  </section>
</div>
