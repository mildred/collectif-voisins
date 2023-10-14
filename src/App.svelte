<script>
  // vim: ft=html
  import {Route, router} from 'tinro';
  router.mode.hash(); // enables hash navigation method

  import Welcome from './Welcome.svelte'
  import City from './City.svelte'
  import Group from './Group.svelte'

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
  <Route path="/g/:group_guid/*" let:meta>
    <Group guid={meta.params.group_guid}/>
  </Route>
  <Route>
    <Welcome/>
  </Route>
</Route>
</div>

<details>
  <summary>TODO</summary>
  <ul>
    <li>Gérer le logout.</li>
    <li>Sur la page d'un groupe public, ne pas afficher de contenu mais proposer
    une liste de groupes de modération (collectif = même groupe que le contenu,
    et tous les groupes à accès restreint). Proposer de créer ou rejoindre un
    groupe de modération.</li>
    <li>Le contenu est affiché uniquement lorsque le groupe de modération est
    choisi, le contenu avec un vote &lt;= 0 est caché (sauf si l'utilisateur est
    membre du groupe et qu'il choisit de passer en mode modération). Le contenu
    affiché correspond aux articles postés sur le groupe public avec la
    modération appliquée sur le groupe de modération.</li>
    <li>Les réactions et votes correspondent au groupe public</li>
    <li>Une option disponible à tous (même si pas de login) pour afficher les
      réactions et votes présents sur les groupes de modération. En ce cas, si
      on vote ou réagit, les réactions sont enregistrées sur le groupe de
      modération, si on est membre bien sûr.</li>
    <li>Cacher les topics jusqu'à ce qu'une tierce personne vote pour eux</li>
    <li>Modifier le default score de groupe pour être à 0 (comme ça un
      topic/commentaire commence avec 1pts et non pas 2pts</li>
    <li>trouver un moyen de marquer certains comptes comme étant validés.
      N'afficher les votes que pour ces comptes (??? article de l'autorité de
      certification avec un reply_guid référencant le group_item du compte et
      reply_index le local_member_id du compte)</li>
    <li>Autoriser la modification des articles par leur auteur</li>
    <li>Autoriser la modification des articles (seulement les topics probablement)
      par d'autres personnes. Ces articles seront affichés comme des versions
      alternatives. Les votes permettront de déterminer la version à afficher de
      l'article</li>
    <li>Associer au groupe publique un groupe à accès restreint où seuls les
      comptes validés ont accès. utiliser ce groupe comme groupe de modération
      pour le groupe publique. Le groupe restreint n'est accessible que sur
      invitation du certifiant initial (et pas des autres membres qui peuvent
      cependant participer aux votes de modération)
      <ul>
        <li>Ajouter une colonne group_member.invite_weight: le score maximal que
          le membre peut donner à quelqu'un qu'il invite.</li>
        <li>Lorsqu'on vote une modération, l'interface doit proposer un vote v tel
        que abs(v / weight) = 1 afin qu'il ait par défaut le même poids de
        modération, seulement contrairement aux autres il pourra cliquer à nouveau
        sur le bouton pour augmenter son vote.</li>
      </ul>
    </li>
    <li>Le contenu modéré n'ést pas visible aux aux membres du groupe de
      modération. Il reste accessible par API cependant afin de permettre à des
      groupes de modération concurrents de voir le jour.</li>
    <li>Considérer d'étendre le système pour permettre d'autres groupes de
      modération en plus des habitants certifiés comme par exemple le conseil
      municipal, le préfêt, le maire, ...</li>
    <li>Lors de l'entrée dans le groupe de modération collective, indiquer aux
      futus membres qu'ils seront légalement tenus collectivement responsable de la
      modération du contenu.</li>
    <li>Permettre à un groupe de référencer d'autres groupes (purement
      informatif). Cela permet à l'interface utilisateur de présenter les posts de
      tous ces groupes de références comme contenu à modérer</li>
  </ul>
</details>
