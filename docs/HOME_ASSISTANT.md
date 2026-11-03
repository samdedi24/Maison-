# Architecture native Home Assistant

La cible actuelle est le dashboard de [`homeassistant/`](../homeassistant/README.md), intégré à la barre latérale de Home Assistant. **Apple Maison conserve le pilotage.** L’ancien adaptateur réseau pour l’application web autonome n’est plus la direction à poursuivre.

## Fonctionnement

`homeassistant/dashboard.yaml` assemble des cartes Énergie natives et la carte personnalisée `custom:maison-plus-card`. Le module `www/maison-plus/card.js` reçoit l’objet **`hass`** de Home Assistant ; `data.js` contient les fonctions de données et de regroupement.

La version native utilise la session et les entités du Home Assistant dans lequel elle est chargée. Elle ne nécessite ni serveur Node, ni proxy API externe, ni jeton longue durée à saisir. Les droits de la session s’appliquent ; une erreur ou une source absente doit être affichée, pas remplacée par des valeurs de démonstration.

Les dépendances d’exécution sont Home Assistant et les intégrations déjà configurées dans l’installation. Node.js sert aux tests locaux du dépôt seulement. La copie des fichiers et la déclaration du dashboard restent nécessaires avant de l’utiliser sur le vrai système.

## Pièces et capteurs

Le classement utilise les registres Home Assistant :

1. Pièce explicitement affectée à l’entité.
2. Sinon, pièce de l’appareil associé.
3. Sinon, groupe « Sans pièce ».

Conserver les identifiants `area_id`, `device_id` et `entity_id` comme identités. Deux capteurs appelés « Température » ne sont pas le même capteur ; une modification de nom ne doit pas les déplacer. Les modifications de registres doivent actualiser l’affectation, indépendamment des mises à jour de valeurs.

Identifier les relevés par leurs métadonnées et unités. Plusieurs thermomètres d’une pièce restent consultables individuellement. Les valeurs de température doivent être normalisées dans l’unité cible avant une moyenne. L’humidité est calculée séparément : un thermomètre qui ne mesure que la température ne fournit pas implicitement 0 % d’humidité.

Les états `unknown`, `unavailable`, les métriques absentes et les valeurs non numériques ne participent pas aux moyennes courantes. Une absence de données s’affiche « — ». Ne pas déclarer automatiquement un capteur indisponible au seul motif que sa valeur est stable depuis longtemps.

Les options `exclude_areas`, `exclude_entities` et `include_diagnostic` permettent d’adapter la sélection. Toucher un relevé déclenche l’ouverture du dialogue natif de l’entité. L’historique dépend des données réellement conservées par Home Assistant ; aucun historique sinusoïdal ou stockage parallèle n’est ajouté.

## Électricité : Linky et TIC

Le propriétaire dispose d’un Linky avec module TIC. Le dashboard s’appuie sur **la configuration Énergie native** ; il ne choisit pas arbitrairement une intégration du module ou un identifiant de capteur.

- Les compteurs de consommation sont des **énergies cumulées**, avec les métadonnées et unités prises en charge par Énergie, couramment Wh/kWh et `state_class` `total` ou `total_increasing` selon leur comportement.
- Une **puissance active** en W/kW est une autre mesure. Un graphe de puissance ne doit être ajouté que si une source compatible est réellement disponible et configurée.
- La **puissance apparente** en VA/kVA n’est ni une énergie en kWh ni nécessairement une puissance active en W. Aucune conversion implicite ne doit masquer cette différence.
- Un coût dépend d’un tarif réel configuré. Ne pas importer les anciens chiffres fictifs, l’abonnement, Tempo ou EcoWatt de la démo comme des données réelles.
- Les cartes natives peuvent afficher une absence de données pendant la configuration et la collecte initiale des statistiques. Une page vide ne justifie pas la création de valeurs fictives.

Les index détaillés doivent être utilisés sans double comptage entre un total et ses sous-index. Le format exact dépend des entités fournies par le module TIC et de son intégration existante.

## Météo

La section `weather` utilise une entité `weather` de Home Assistant. La sélection automatique n’est faite que si une seule entité correspond. En cas de plusieurs entités, l’utilisateur choisit celle souhaitée ou renseigne `weather_entity`. En cas d’absence, la carte indique qu’une intégration météo doit être configurée.

La carte demande un type de prévision (`daily`, `hourly` ou `twice_daily`) pris en charge par l’intégration ; à défaut du type demandé, elle peut afficher un autre type disponible. Sans prévision prise en charge, elle conserve les conditions courantes. Ne pas fabriquer de prévisions.

## Déploiement

La copie native est dans `/config/www/maison-plus/` depuis le point de vue du conteneur Home Assistant. Le chemin hôte QNAP est celui du volume réellement monté en `/config`, à lire dans Container Station ou `docker inspect`.

Le dashboard est ajouté à l’installation existante, sans remplacer son conteneur, ses volumes ou les autres configurations Lovelace. Les instructions et fragments YAML sont dans [homeassistant/README.md](../homeassistant/README.md).

## Plan 3D

Aucun véritable plan 3D n’est présent dans cette version. La géométrie et les correspondances avec les pièces réelles sont nécessaires avant de produire ce modèle. Voir [PLAN_3D.md](PLAN_3D.md).

## Vérification attendue sur l’installation réelle

- Ressource chargée, dashboard visible, et permissions de registre suffisantes pour la session utilisée.
- Sources Linky réellement configurées et unités correctes.
- Météo choisie explicitement lorsque nécessaire ; prévisions compatibles.
- Plusieurs thermomètres dans une pièce, capteur indisponible, humidité absente et changement de pièce traités correctement.
- Dialogue du bon capteur ouvert au toucher ; données historiques disponibles selon Recorder.
- Aucun service de pilotage envoyé par Maison+.
- Parcours vérifiés dans le navigateur et l’application Companion du propriétaire.
