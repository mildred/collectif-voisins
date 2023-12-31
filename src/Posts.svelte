<script>
  // vim: ft=html
  import { createEventDispatcher } from 'svelte';
  import { BarLoader } from 'svelte-loading-spinners';
  import Editor from './Editor.svelte'

  export let pts
  import Join from './Join.svelte'
  import ArtPts from './ArtPts.svelte'
  import ArtReaction from './ArtReaction.svelte'
  import ArtVote from './ArtVote.svelte'
  import {async_derived, store} from './utils/store.js'
  import {disputatio_query, parse_julian} from './utils.js'
  import {session} from './stores.js'
  import {to_html} from './art_html.js'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';
  import { guid as disputatio_guid, city_public_group} from './disputatio.js'

  let dispatch = createEventDispatcher()

  export let root_guid
  export let ref_guid
  export let url_prefix

  let join_show_modal = false
  let comment_editor
  let comment_editor_key = 1

  const ref_topic = store(null).init(async ($ref_topic, update) => {
    if (!ref_guid) return update.set({})

    const guid = 0, timestamp = 1, style = 2, text = 3, p_guid = 4, nick = 5,
          score = 6, reactions = 7
    let { rows } = await disputatio_query(`
      SELECT  art.guid, art.timestamp, par.style, par.text, par.guid,
              gm.nickname, s.score,
              json_group_array(json_object(
                'id', react.guid, 'react', rpar.text, 'kind', react.kind,
                'member', rs.member_id, 'score', rs.score - rs.default_score)) reactions
      FROM    paragraph par
              JOIN patch_item pi ON pi.paragraph_id = par.id
              JOIN patch pp ON pp.id = pi.patch_id
              JOIN article art ON art.patch_id = pp.id
              JOIN article_score s ON s.article_id = art.id
              JOIN group_member gm ON (gm.group_item_id, gm.local_id) = (art.group_id, art.group_member_id)
              LEFT OUTER JOIN article react ON react.kind IN ('reaction', 'agreement') AND react.reply_guid = art.guid
              LEFT OUTER JOIN article_member_score rs ON rs.article_id = react.id AND rs.group_guid = '${root_guid}' AND rs.score <> rs.default_score
              LEFT OUTER JOIN patch_item rpi ON rpi.patch_id = react.patch_id AND rpi.rank = 1
              LEFT OUTER JOIN paragraph rpar ON rpi.paragraph_id = rpar.id
      WHERE   s.group_guid = '${root_guid}'
              AND art.guid ${ ref_guid ? `= '${ref_guid}'` : 'IS NULL'}
      GROUP BY par.guid, art.guid
      ORDER BY art.timestamp DESC, pi.rank ASC
    `)

    let art = {
      paragraphs: []
    }

    for(let row of rows) {
      if (!row[guid]) continue

      art.guid = row[guid]
      art.timestamp = row[timestamp]
      art.date = parse_julian(row[timestamp]).date,
      art.nick = row[nick]
      art.score = row[score]
      art.reactions = JSON.parse(row[reactions])
      if (art.title == null) art.title = row[text]
      art.paragraphs.push([row[style], row[text], row[p_guid]])
    }

    update.set(art)
  })

  const topics = store(null).init(async ($topics, update) => {
    const guid = 0, timestamp = 1, style = 2, text = 3, p_guid = 4, nick = 5,
      score = 6, reactions = 7
    let { rows } = await disputatio_query(`
      SELECT  art.guid, art.timestamp, par.style, par.text, par.guid,
              gm.nickname, s.score,
              json_group_array(json_object(
                'id', react.guid, 'react', rpar.text, 'kind', react.kind,
                'member', rs.member_id, 'score', rs.score - rs.default_score)) reactions
      FROM    paragraph par
              JOIN patch_item pi ON pi.paragraph_id = par.id
              JOIN patch pp ON pp.id = pi.patch_id
              JOIN article art ON art.patch_id = pp.id
              JOIN article_score s ON s.article_id = art.id
              JOIN group_member gm ON (gm.group_item_id, gm.local_id) = (art.group_id, art.group_member_id)
              LEFT OUTER JOIN article react ON react.kind IN ('reaction', 'agreement') AND react.reply_guid = art.guid
              LEFT OUTER JOIN article_member_score rs ON rs.article_id = react.id AND rs.group_guid = '${root_guid}' AND rs.score <> rs.default_score
              LEFT OUTER JOIN patch_item rpi ON rpi.patch_id = react.patch_id AND rpi.rank = 1
              LEFT OUTER JOIN paragraph rpar ON rpi.paragraph_id = rpar.id
      WHERE   s.group_guid = '${root_guid}'
              AND art.reply_guid ${ ref_guid ? `= '${ref_guid}'` : 'IS NULL'}
              AND art.kind = 'topic'
      GROUP BY par.guid, art.guid
      ORDER BY art.timestamp DESC, pi.rank ASC
    `)

    let res = []

    // console.log(rows)

    for(let row of rows) {
      if (!row[guid]) continue

      let art = res[res.length-1]
      if (row[guid] != art?.guid) {
        art = {
          guid: row[guid],
          timestamp: row[timestamp],
          date: parse_julian(row[timestamp]).date,
          nick: row[nick],
          score: row[score],
          reactions: JSON.parse(row[reactions]),
          paragraphs: []
        }
        res.push(art)
      }
      if (art.title == null) {
        art.title = row[text]
      }
      art.paragraphs.push([row[style], row[text], row[p_guid]])
    }

    update.set(res)
  })

  const comments = store(null).init(async ($comments, update) => {
    const guid = 0, timestamp = 1, style = 2, text = 3, p_guid = 4, nick = 5, score = 6
    let { rows } = await disputatio_query(`
      SELECT  art.guid, art.timestamp, par.style, par.text, par.guid, gm.nickname, s.score
      FROM    paragraph par
              JOIN patch_item pi ON pi.paragraph_id = par.id
              JOIN patch pp ON pp.id = pi.patch_id
              JOIN article art ON art.patch_id = pp.id
              JOIN article_score s ON s.article_id = art.id
              JOIN group_member gm ON (gm.group_item_id, gm.local_id) = (art.group_id, art.group_member_id)
              -- JOIN patch_item pi1 ON pi1.patch_id = pp.id AND pi1.rank = 1
              -- JOIN paragraph par1 ON par1.id = pi1.paragraph_id
      WHERE   s.group_guid = '${root_guid}'
              AND art.reply_guid ${ ref_guid ? `= '${ref_guid}'` : 'IS NULL'}
              -- AND par1.style <> '+h1'
              AND art.kind = 'comment'
      ORDER BY timestamp DESC, pi.rank ASC
    `)

    let res = []

    // console.log(rows)

    for(let row of rows) {
      let art = res[res.length-1]
      if (row[guid] != art?.guid) {
        art = {
          guid: row[guid],
          timestamp: row[timestamp],
          date: parse_julian(row[timestamp]).date,
          date_str: format_date(row[timestamp]),
          nick: row[nick],
          score: row[score],
          paragraphs: []
        }
        res.push(art)
      }
      art.paragraphs.push([row[style], row[text], row[p_guid]])
    }

    update.set(res.reverse())
  })

  const comments_by_day = store(null).derive(comments, async ($self, $comments, update) => {
    if (!$comments) return

    let last_date_str = null
    let last_nick = null
    let res = []
    for(let comment of $comments) {
      if (comment.date_str != last_date_str) {
        res.push([])
        last_date_str = comment.date_str
        last_nick = null
      }
      if (comment.nick != last_nick) {
        res[res.length-1].push([])
        last_nick = comment.nick
      }
      let res1 = res[res.length-1]
      let res2 = res1[res1.length-1]
      res2.push(comment)
    }
    update.set(res)
  })

  const info = store(null).derive(session, async ($info, $session, update) => {
    let res = await fetch(`/.well-known/disputatio/g:${root_guid}/info/`, {
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

  async function save_comment(e) {
    comment_editor.disabled = true
    let params = new FormData()
    params.append('html', e.detail.html)
    params.append('kind', 'comment')
    params.append('parent_patch', '')
    params.append('reply_guid', ref_guid || '')
    let res = await fetch(`/.well-known/disputatio/g:${root_guid}/posts/`, {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': `bearer ${$session.token}`
      }
    })
    comment_editor.disabled = false
    comment_editor.clear()
    comments.restart()
    comment_editor_key++
  }

  function join(e) {
    e.preventDefault()
    join_show_modal = true
  }

  function join_success(e) {
    console.log("Joined", e.detail)
    info.restart()
  }

  const date_format = Intl.DateTimeFormat(undefined, {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})
  const time_format = Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'})
  const date_time_format = Intl.DateTimeFormat(undefined, {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'})

  function format_date(timestamp) {
    return date_format.format(parse_julian(timestamp).date)
  }

  function format_date_time(timestamp) {
    const { date } = parse_julian(timestamp)
    return date_time_format.format(date)
  }

  function format_time(timestamp) {
    return time_format.format(parse_julian(timestamp).date)
  }

  function open_topic(e) {
    const topic = e.target.closest('article.topic')
    if (e.target.closest('.metadata') || e.target.closest('.metadata-reactions') || !topic) return;

    topic.querySelector('a.open-topic')?.click()
  }
</script>

<Join bind:show={join_show_modal} guid={root_guid} on:join={join_success}/>

<div class="main">
{#if $info?.error == 'not_found' }
  <section class="header">
    <center>
      <p>Création de l'espace communautaire en cours...</p>
      <br/>
      <BarLoader/>
    </center>
  </section>
{:else if $topics == null || $comments == null || $ref_topic == null}
  <center>
    <p>Loading posts from {root_guid}</p>
    <br/>
    <BarLoader/>
  </center>
{:else}
  <section class="header">
    <div class="member-info">
      {#if $info == null}
        <center>
          <p>Loading group info from {root_guid}.</p>
          <br/>
          <BarLoader/>
        </center>
      {:else if $info.member}
        <p>Vous êtes membre de la communauté de {$info.group.n} en tant que
        {$info.member.nick}. Vous participez à la modération collective et vous
        avez une obligation légale de bloquer le contenu inapproprié selon les
        lois que vous impose votre juridiction. Cette modération reste
        vulnérable aux attaques de trolls.</p>

        <p>Vous n'êtes pas membre d'un groupe de modération restreint (protégé
          des attaques de trolls). Faites vous inviter ou créez un groupe pour
          participer à la modération.</p>
      {:else}
        <p>Vous n'avez pas encore rejoint la communauté de {$info.group.n}</p>
        {#if $session.email}
        <button on:click={join}>Rejoindre</button>
        {:else}
          <p>Connectez-vous pour ensuite rejoindre la communauté.</p>
        {/if}
      {/if}
    </div>
    <div>
      <p>Afficher la modération&nbsp;:
        <select>
          <option>🔓 collective</option>
          <!-- 🔒 afficher les autres groupes de modération -->
          <option disabled>🔒 Nouveau groupe de modération...</option>
        </select>
        réactions et votes&nbsp;:
        <select>
          <option>🔓 du public</option>
          <!-- afficher les autres groupes de modération -->
        </select>
      </p>
      <p><em>Attention&nbsp;: si vous choisissez de visualiser le contenu modéré
          collectivement, vous devez éventuellement vous attendre a voir du
          contenu inapproprié le temps que la communauté puisse le modérer. Si
          la comunauté est infiltrée par de trop nombreux trolls, il est
          possible qu'elle ne puisse plus effectuer une modération correcte.
          Vous devriez toujours préférer une communauté de modération restreinte
          qui soit capable d'imposer ses règles en cas d'attaques de trolls.</em></p>
    </div>
  </section>
  <section class="topics">
  {#if ref_guid}
    <article class="head topic">
      {@html to_html($ref_topic.paragraphs)}
      <p class="topic metadata-nick">—&nbsp;{$ref_topic.nick}</p>
      <p class="topic metadata-reactions">
        <ArtVote group_guid={root_guid} ref_guid={$ref_topic.guid} reactions={$ref_topic.reactions} member={$info?.member} group={$info?.group} />
        <ArtReaction group_guid={root_guid} ref_guid={$ref_topic.guid} reactions={$ref_topic.reactions} member={$info?.member} />
      </p>
      <p class="topic metadata">
        {format_date_time($ref_topic.timestamp)} |
        <ArtPts pts={$ref_topic.score} group_guid={root_guid} article_guid={ref_guid} />
      </p>
    </article>
  {/if}
  {#each $topics as topic}
    <article class="topic" on:click={open_topic}>
      {@html to_html(topic.paragraphs)}
      <p><a href="#{url_prefix}/r/{topic.guid}/" class="open-topic"><SvgIcon type='mdi' path={mdi.mdiArrowRightBold} /></a></p>
      <p class="topic metadata-nick">—&nbsp;{topic.nick}</p>
      <p class="topic metadata-reactions">
        <ArtVote group_guid={root_guid} ref_guid={topic.guid} reactions={topic.reactions} member={$info?.member} group={$info?.group} />
        <ArtReaction group_guid={root_guid} ref_guid={topic.guid} reactions={topic.reactions} member={$info?.member} />
      </p>
      <p class="topic metadata">
        {format_date_time(topic.timestamp)} |
        <ArtPts pts={topic.score} group_guid={root_guid} article_guid={topic.guid} />
      </p>
    </article>
  {/each}
    <p class="topic-links">
      {#if $info?.member && !ref_guid}
        <a href="#{url_prefix}/r/new/">Nouveau sujet</a>
      {/if}
    </p>
  </section>
  <section class="comments">
  {#each $comments_by_day as day_comments}
  <p class="comments date-title">{day_comments[0][0].date_str}</p>
    {#each day_comments as nick_comments}
      {#each nick_comments as comment, idx}
        <article class="comment">
          <p class="comment metadata-time">{format_time(comment.timestamp)}</p>
          <div class="comment-body">
            {#if idx == 0}
            <span class="comment metadata-nick"><strong>{comment.nick}</strong>&nbsp;—&nbsp;</span>
            {/if}
            {@html to_html(comment.paragraphs)}
            <p class="comment metadata"> <ArtPts pts={comment.score} group_guid={root_guid} article_guid={comment.guid} /></p>
          </div>
        </article>
      {/each}
    {/each}
  {/each}
  {#if $info?.member}
    {#key comment_editor_key}
    <article class="comment new">
      <p><strong>Ajouter un commentaire&nbsp;:</strong></p>
      <Editor on:save={save_comment} bind:this={comment_editor}/>
    </article>
    {/key}
  {/if}
  </section>
{/if}
</div>

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

  article.topic:not(.head) {
    border: thin solid #888888;
    margin: 0.5rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
  }

  article.head.topic {
    margin: 0;
    padding: 0;
  }

  article.topic:not(.head) {
    cursor: pointer;
    position: relative;
  }

  article.topic a.open-topic {
    position: absolute;
    right: 0;
    top: 0;
  }

  article.topic:not(:hover) a.open-topic {
    visibility: hidden;
  }

  article.comment, .comments.date-title {
    margin: 0 0.5rem;
    padding: 0.25rem;
    font-size: 0.85em;
    color: #666666;
  }

  article.comment:not(.new) {
    border-bottom: thin solid #eeeeee;
    display: flex;
    flex-flow: row nowrap;
    gap: 1em;
  }

  article.comment .comment-body {
    flex: 1 1 auto;
  }

  article.comment:first-child {
    border-top: thin solid #eeeeee;
  }

  article.comment :global(p),
  article.comment :global(ul),
  article.comment :global(ol),
  article.comment :global(li) {
    margin: 0
  }

  article.comment.new :global(.editor-container) {
    margin: 0.5rem 0;
  }

  article.comment.new :global([contenteditable]) {
    background-color: #ffffff;
    padding: 1rem 0.5rem;;
    border-radius: 0.25rem;
  }

  .topic-links {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
    font-size: 0.85em;
  }

  .topic-links a {
    color: #dddddd;
    text-decoration: none;
  }

  .metadata {
    float: right;
    margin: 0;
    font-size: 0.9em;
  }

  .comment.metadata-nick {
    float: left;
  }

  .topic.metadata-nick {
    margin: 0;
    font-size: 0.9em;
    float: left;
  }

  .topic.metadata-reactions {
    margin: 0 0 0 1em;
    font-size: 0.9em;
    float: left;
  }

  .comment.metadata, .comment.metadata-time {
    color: #aaaaaa;
  }

  .topic.metadata, .topic.metadata-nick, .topic.metadata-reactions {
    color: #888888;
  }

  .comments.date-title {
    font-weight: bold;
    text-align: center;
  }

</style>
