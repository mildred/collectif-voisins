<script>
  // vim: ft=html
  import { BarLoader } from 'svelte-loading-spinners';
  import Editor from './Editor.svelte'
  import {async_derived, store} from './utils/store.js'
  import {disputatio_query} from './utils.js'
  import {session} from './stores.js'
  import {to_html} from './art_html.js'

  export let root_guid
  export let ref_guid
  export let url_prefix

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

  async function load_topics() {
    const guid = 0, timestamp = 1, style = 2, text = 3, p_guid = 4
    let { rows } = await disputatio_query(`
      SELECT  art.guid, art.timestamp, par.style, par.text, par.guid
      FROM    paragraphs par
              JOIN patch_items pi ON pi.paragraph_id = par.id
              JOIN patches pp ON pp.id = pi.patch_id
              JOIN articles art ON art.patch_id = pp.id
              JOIN group_items gi ON art.group_id = gi.id
              JOIN patch_items pi1 ON pi1.patch_id = pp.id AND pi1.rank = 1
              JOIN paragraphs par1 ON par1.id = pi1.paragraph_id
      WHERE   gi.root_guid = '${root_guid}'
              AND art.reply_guid ${ ref_guid ? `= '${ref_guid}'` : 'IS NULL'}
              AND par1.style = '+h1'
      ORDER BY timestamp DESC, pi.rank ASC
    `)

    let res = []

    console.log(rows)

    for(let row of rows) {
      let art = res[res.length-1]
      if (row[guid] != art?.guid) {
        art = {
          guid: row[guid],
          timestamp: row[timestamp],
          paragraphs: []
        }
        res.push(art)
      }
      if (art.title == null) {
        art.title = row[text]
      }
      art.paragraphs.push([row[style], row[text], row[p_guid]])
    }

    return res
  }

  async function load_comments() {
    const guid = 0, timestamp = 1, style = 2, text = 3, p_guid = 4
    let { rows } = await disputatio_query(`
      SELECT  art.guid, art.timestamp, par.style, par.text, par.guid
      FROM    paragraphs par
              JOIN patch_items pi ON pi.paragraph_id = par.id
              JOIN patches pp ON pp.id = pi.patch_id
              JOIN articles art ON art.patch_id = pp.id
              JOIN group_items gi ON art.group_id = gi.id
              JOIN patch_items pi1 ON pi1.patch_id = pp.id AND pi1.rank = 1
              JOIN paragraphs par1 ON par1.id = pi1.paragraph_id
      WHERE   gi.root_guid = '${root_guid}'
              AND art.reply_guid ${ ref_guid ? `= '${ref_guid}'` : 'IS NULL'}
              AND par1.style <> '+h1'
      ORDER BY timestamp DESC, pi.rank ASC
    `)

    let res = []

    console.log(rows)

    for(let row of rows) {
      let art = res[res.length-1]
      if (row[guid] != art?.guid) {
        art = {
          guid: row[guid],
          timestamp: row[timestamp],
          paragraphs: []
        }
        res.push(art)
      }
      art.paragraphs.push([row[style], row[text], row[p_guid]])
    }

    return res
  }

  const topics = async_derived(null, load_topics)
  const comments = async_derived(null, load_comments)
  const info = store(null)
    .derive(session, async ($info, $session, update) => {
      if($session?.email) update(await load_info($session))
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
    width: min(100%, 60rem);
    text-align: justify;
    align-self: center;
  }

  section {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 2rem 0;
  }

  section.comments {
    background-color: #f8f8f8;
    flex-grow: 1;
  }

  article.topic {
    border: thin solid #888888;
    margin: 0.5rem;
    padding: 0.25rem;
    width: min(100%, 60rem);
    border-radius: 0.25rem;
  }

  article.comment {
    margin: 0 0.5rem;
    padding: 0.25rem;
    width: min(100%, 60rem);
    font-size: 0.8em;
    border-top: thin solid #eeeeee;
    color: #666666;
  }

  article.comment:last-child {
    border-bottom: thin solid #eeeeee;
  }

  article.comment :global(p),
  article.comment :global(ul),
  article.comment :global(ol),
  article.comment :global(li) {
    margin: 0
  }

</style>

<div class="main">
{#if $topics == null || $comments == null}
  <center>
    <p>Loading posts from {root_guid}</p>
    <br/>
    <BarLoader/>
  </center>
{:else}
  <div class="member-info">
    {#if $info == null}
      <center><BarLoader/></center>
    {:else if $info.member}
      <p>Vous êtes membre de la communauté de {$info.group.n} en tant que
      {$info.member.nick}.</p>
    {:else}
      <p>Vous n'avez pas encore rejoint la communauté de {$info.group.n}</p>
    {/if}
  </div>
  <section class="topics">
  {#each $topics as topic}
    <article class="topic">
      {@html to_html(topic.paragraphs)}
      <p><a href="#{url_prefix}/r/{topic.guid}/">Plus...</a></p>
    </article>
  {/each}
  </section>
  <section class="comments">
  {#each $comments as comment}
    <article class="comment">
      {@html to_html(comment.paragraphs)}
    </article>
  {/each}
  {#if $info?.member}
    <Editor/>
  {/if}
  </section>
{/if}
</div>
