<script>
  // vim: ft=html
  import {session} from './stores.js'
  import {disputatio_query} from './utils.js'

  export let group_guid
  export let ref_guid
  export let reactions = {}
  export let member = null
  export let group = null

  let open
  let filtered_reactions = {}

  $: votes = filter_reactions(reactions, group, member)

  function filter_reactions(reacts, group, member) {
    let pos = 0, neg = 0, self_score = 0
    let vote_id = null
    // console.log(reacts)
    for(let r of reacts) {
      if (r.kind != 'agreement') continue

      if (vote_id == null) vote_id = r.id
      if (r.id != vote_id) continue;

      if (r.score > 0) {
        pos += 1
      } else if (r.score < 0) {
        neg += 1
      }

      if (member?.id == r.member) self_score += r.score
    }

    let abs = (group == null) ? '?' : (group?.m?.length||0) - pos - neg
    return { pos, neg, abs, vote_id, self_score }
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
      WHERE   react.kind = 'agreement' AND react.reply_guid = '${ref_guid}'
    `)

    reactions = JSON.parse(rows[0][0])
  }

  async function vote(args) {
    let { score_set } = args

    let params = new FormData()
    params.append('html', 'agree')
    params.append('kind', 'agreement')
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

  function vote_neg(e) {
    vote({score_set: -1})
  }

  function vote_pos(e) {
    vote({score_set: 1})
  }

  function vote_abs(e) {
    vote({score_set: 0})
  }
</script>

<span class="main">
  <a href="javascript:void(0)"
     on:click={vote_neg}
     class:voted={votes.self_score < 0}
    >contre {votes.neg}</a>
  <a href="javascript:void(0)"
     on:click={vote_abs}
     class:voted={votes.self_score == 0}
     >abstention {votes.abs}</a>
  <a href="javascript:void(0)"
     on:click={vote_pos}
     class:voted={votes.self_score > 0}
    >pour {votes.pos}</a>
</span>

<style>
  span.main {
    display: inline-flex;
    flex-flow: row wrap;
  }
  span.main > *:first-child {
    border-top-left-radius: 1em;
    border-bottom-left-radius: 1em;
  }
  span.main > *:last-child {
    border-top-right-radius: 1em;
    border-bottom-right-radius: 1em;
  }
  span.main > * {
    padding: 0 0.5em;
    border: thin solid #888888;
  }
  span.main > *:not(:first-child) {
    border-left: none;
  }
  .voted {
    background-color: #eeeeee;
  }
  a {
    text-decoration: none;
    color: currentcolor;
  }
</style>
