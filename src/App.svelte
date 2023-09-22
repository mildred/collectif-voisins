<script>
  // vim: ft=html
  import {Route, router} from 'tinro';
  router.mode.hash(); // enables hash navigation method

  import Welcome from './Welcome.svelte'
  import City from './City.svelte'

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
  <Route>
    <Welcome/>
  </Route>
</Route>
</div>

<hr/>
<p>TODO</p>
<ul>
  <li>Clic sur les points d'un topic/commentaire avec deux actions : "promouvoir" ou "cacher"
  qui correspond à un vote positif ou négatif.</li>
  <li>Cacher les topics jusqu'à ce qu'une tierce personne vote pour eux</li>
  <li>Modifier le default score de groupe pour être à 0 (comme ça un
    topic/commentaire commence avec 1pts et non pas 2pts</li>
  <li>Ajouter des réactions emoji (article type reaction).</li>
  <li>Prévoir en plus réactions usuelles emoji des réactions "POUR", "CONTRE" et
    "SANS OPINION" permettant de voter sur un sujet. Les présenter différamment
    comme un vote.</li>
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
</ul>
