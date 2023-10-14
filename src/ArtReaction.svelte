<script>
  // vim: ft=html
  import Popover from 'svelte-popover';
  import {session} from './stores.js'
  import {disputatio_query} from './utils.js'

  export let group_guid
  export let ref_guid
  export let reactions = {}
  export let member = null

  let open
  let filtered_reactions = {}

  $: filtered_reactions = filter_reactions(reactions, member)

  function filter_reactions(reacts, member) {
    // console.log(reacts)
    let res = {}
    for(let r of reacts) {
      if (r.kind != 'reaction') continue

      res[r.id] ||= {score: 0, text: r.react, self_score: 0}
      res[r.id].score += r.score
      if (member?.id == r.member) res[r.id].self_score += r.score
      if (res[r.id].score == 0 && res[r.id].self_score == 0) delete res[r.id]
    }
    return res
  }

  async function refresh_reaction(){
    let { rows } = await disputatio_query(`
      SELECT  json_group_array(json_object(
                'id', react.guid, 'react', rpar.text, 'kind', react.kind,
                 'member', rs.member_id, 'score', rs.score - rs.default_score)) reactions
      FROM    article react
              JOIN article_member_score rs ON rs.article_id = react.id AND rs.group_guid = '${group_guid}' AND rs.score <> rs.default_score
              JOIN patch_item rpi ON rpi.patch_id = react.patch_id AND rpi.rank = 1
              JOIN paragraph rpar ON rpi.paragraph_id = rpar.id
      WHERE   react.kind = 'reaction' AND react.reply_guid = '${ref_guid}'
    `)

    reactions = JSON.parse(rows[0][0])
  }

  async function react(args) {
    let { text, score_set } = args

    // TODO: delete reaction if user clicked on their reaction

    let params = new FormData()
    params.append('html', text)
    params.append('kind', 'reaction')
    params.append('score_set', score_set)
    let res = await
      fetch(`/.well-known/disputatio/g:${group_guid}/a:${ref_guid}/react/`, {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': `bearer ${$session.token}`
      }
    })
    open = false;

    refresh_reaction();
  }

  function react_click(e) {
    let self_score = parseFloat(e.target.dataset.selfScore) || 0
    react({
      text: e.target.dataset.reactText || e.target.textContent,
      score_set: self_score == 0 ? 1 : 0
    })
  }
</script>

<span class="main">
  {#each Object.keys(filtered_reactions) as react}
    <a href="#"
       class="react"
       class:voted={filtered_reactions[react].self_score != 0}
       on:click|preventDefault={react_click}
       data-self-score={filtered_reactions[react].self_score}
       data-react-text={filtered_reactions[react].text}
       data-react-guid={react}>
      {filtered_reactions[react].text}
      {filtered_reactions[react].score}
    </a>
  {/each}
  <Popover overlayColor='rgba(1,1,1,0)' bind:open={open}>
  <span class="target" slot="target">🙂</span>
  <div slot="content" class="popover-content">
    <a href="#" on:click|preventDefault={react_click}>😀</a>
    <a href="#" on:click|preventDefault={react_click}>😅</a>
    <a href="#" on:click|preventDefault={react_click}>🤯</a>
    <a href="#" on:click|preventDefault={react_click}>😢</a>
    <a href="#" on:click|preventDefault={react_click}>🤬</a>
    <a href="#" on:click|preventDefault={react_click}>❤️‍🔥</a>
    <a href="#" on:click|preventDefault={react_click}>👍</a>
    <a href="#" on:click|preventDefault={react_click}>👎</a>
  </div>
</Popover>
</span>


<style>
  span.main {
    display: inline-flex;
    flex-flow: row wrap;
    gap: 0.25em;
  }
  .react {
    border: thin solid #888888;
    border-radius: 1em;
    padding: 0 0.5em;
  }
  .react.voted {
    background-color: #eeeeee;
  }
  .target {
    cursor: pointer;
  }
  .target:not(:hover) {
    filter: saturate(0%);
  }
  span.main > :global(.popover) > :global(.overlay) {
    /*display: none;*/
    cursor: default;
  }
  span.main > :global(.popover) > :global(.content) > :global(.arrow) {
    color: #888888;
  }
  .popover-content {
    font-size: 1.5em;
    padding: 0.25em;
    background-color: #ffffff;
    border: thin solid #888888;
    border-radius: 0.25rem;
    position: relative;
    z-index: 1;
    min-width: 7em;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
</style>
