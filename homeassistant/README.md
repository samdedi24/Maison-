# Installer Maison+ dans Home Assistant

Maison+ ajoute un **dashboard natif dans la barre latérale de Home Assistant**. Apple Maison reste l’application de pilotage. Le dashboard rassemble l’électricité, la météo extérieure et les thermomètres par pièce.

Cette version comprend une carte personnalisée Lovelace et une configuration de dashboard. **Elle ne nécessite ni serveur Node, ni conteneur supplémentaire, ni jeton Home Assistant à copier.** Les fichiers utilisent la session de l’utilisateur connecté et les entités déjà présentes dans son installation.

L’installation cible est Home Assistant Container sur QNAP. Le code et les tests du dépôt ne constituent pas une validation sur le vrai Home Assistant ou sur le NAS du propriétaire.

## Prérequis

- Accès à la configuration et aux ressources des tableaux de bord de Home Assistant.
- Accès au dossier de configuration monté en `/config` dans le conteneur Home Assistant.
- Entités de température/humidité affectées aux bonnes pièces dans Home Assistant.
- Une intégration météo fournissant une entité `weather`.
- Sources d’énergie configurées dans le tableau de bord Énergie pour afficher la consommation Linky.

HACS n’est pas requis pour cette installation manuelle. Home Assistant Container n’offre pas le magasin d’add-ons de Home Assistant OS ; il n’est pas nécessaire ici.

## 1. Repérer le dossier de configuration sur le QNAP

Dans **Container Station**, ouvrir les paramètres du conteneur Home Assistant et consulter ses volumes/dossiers partagés. Repérer le dossier du NAS monté vers **`/config`**.

Avec un terminal, il est aussi possible d’identifier le conteneur puis son montage :

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}'
```

Remplacer `NOM_DU_CONTENEUR` par le nom affiché :

```bash
docker inspect NOM_DU_CONTENEUR --format '{{range .Mounts}}{{if eq .Destination "/config"}}{{.Source}}{{end}}{{end}}'
```

Le résultat est le chemin **hôte** à utiliser sur le NAS. Ne pas supposer un chemin du type `/share/...` : il dépend de l’installation existante.

## 2. Copier les fichiers

Copier **tout le dossier** `homeassistant/www/maison-plus/` du dépôt dans le dossier `www` de la configuration Home Assistant. Le résultat vu depuis le conteneur doit être :

```text
/config/www/maison-plus/card.js
/config/www/maison-plus/data.js
```

`card.js` importe `data.js` depuis ce même dossier : copier un seul fichier ne suffit pas.

Si `www` n’existait pas, le créer puis **redémarrer Home Assistant** afin que les ressources `/local/` soient servies. Ne pas remplacer le conteneur, ses volumes ou son fichier `configuration.yaml`.

## 3. Déclarer la ressource JavaScript

Dans Home Assistant, ouvrir **Paramètres → Tableaux de bord → menu ⋮ → Ressources**. Le mode avancé du profil utilisateur peut être nécessaire pour voir cette entrée.

Ajouter :

- URL : **`/local/maison-plus/card.js?v=1`**
- Type : **Module JavaScript**

Si les ressources sont déjà gérées par une configuration YAML, ajouter cette ressource à la liste existante selon le mode utilisé ; ne pas remplacer les autres ressources.

Actualiser complètement le navigateur ou l’application Companion après l’ajout. Lors d’une future mise à jour, recopier les fichiers ensemble. Incrémenter la version de la ressource (`card.js?v=2`, par exemple) et celle de l’import de `data.js` dans `card.js` (`./data.js?v=2`) ensemble, puis recharger complètement le navigateur. Modifier uniquement la version de `card.js` ne suffit pas à invalider le module importé.

## 4. Créer le dashboard « Maison+ »

### Option recommandée : éditeur de Home Assistant

1. Ouvrir **Paramètres → Tableaux de bord** et ajouter un dashboard vierge.
2. Nommer ce dashboard **Maison+**, avec le chemin `maison-plus` et l’affichage dans la barre latérale activé.
3. Ouvrir le dashboard créé. Utiliser le menu de modification puis l’**éditeur de configuration brute** ; prendre le contrôle de sa configuration si Home Assistant le demande.
4. Y coller le contenu de **[`dashboard.yaml`](dashboard.yaml)**, puis enregistrer.

Cette opération concerne le nouveau dashboard Maison+ ; conserver les autres dashboards de la maison.

### Autre option : dashboard géré en YAML

Copier `homeassistant/dashboard.yaml` vers **`/config/maison-plus.yaml`**. Ajouter le dashboard au bloc `lovelace` existant de `/config/configuration.yaml`, par exemple :

```yaml
lovelace:
  dashboards:
    maison-plus:
      mode: yaml
      title: Maison+
      icon: mdi:home-analytics
      show_in_sidebar: true
      filename: maison-plus.yaml
```

Ce fragment illustre **l’ajout** du dashboard. S’il existe déjà un bloc `lovelace` ou `dashboards`, fusionner les clés à l’intérieur ; ne pas ajouter un deuxième bloc du même nom et ne pas effacer la configuration existante. Vérifier la configuration puis redémarrer Home Assistant pour appliquer la déclaration.

La ressource JavaScript de l’étape précédente reste nécessaire.

## 5. Relier le Linky TIC au tableau de bord Énergie

Le propriétaire possède un Linky avec module TIC. Le modèle du module et son intégration ne sont pas présumés : commencer par vérifier les entités qu’il expose déjà dans Home Assistant.

Dans le tableau de bord **Énergie** de Home Assistant, configurer la consommation du réseau avec un ou plusieurs **compteurs d’énergie cumulée** adaptés :

- `device_class: energy` ;
- unité d’énergie telle que Wh ou kWh ;
- `state_class: total` ou `total_increasing`, selon le fonctionnement réel de l’entité et les exigences de l’interface Énergie.

Utiliser les index réels pertinents du contrat, par exemple les index séparés si le module les fournit. Ne pas additionner en même temps un total et les sous-index déjà inclus dans ce total. L’intégration native et ses statistiques doivent fournir les données aux cartes Énergie du dashboard Maison+.

### Ne pas confondre les mesures

| Mesure              | Unités courantes | Usage                                                                      |
| ------------------- | ---------------- | -------------------------------------------------------------------------- |
| Énergie cumulée     | Wh, kWh          | Consommation et statistiques Énergie                                       |
| Puissance active    | W, kW            | Puissance électrique instantanée, si disponible et correctement configurée |
| Puissance apparente | VA, kVA          | Mesure distincte ; ne pas l’étiqueter W et ne pas la traiter comme des kWh |

Un module TIC peut exposer une puissance apparente sans fournir la puissance active attendue par un graphe de puissance. Maison+ ne convertit pas arbitrairement VA en W.

Les **coûts** nécessitent le prix du kWh et les éventuelles sources tarifaires réellement configurées dans Home Assistant. Aucun prix, contrat, abonnement, signal Tempo ou EcoWatt n’est inventé. Les cartes peuvent rester vides tant que la configuration Énergie n’est pas terminée ou que ses statistiques n’ont pas été collectées.

## 6. Choisir la météo extérieure

La carte sélectionne automatiquement la météo uniquement lorsqu’**une seule** entité `weather` est disponible. S’il n’y en a aucune, ajouter une intégration météo. S’il y en a plusieurs, utiliser le choix proposé par la carte ou renseigner explicitement celle souhaitée :

```yaml
type: custom:maison-plus-card
section: weather
weather_entity: weather.maison
forecast_type: daily
```

`weather.maison` est un **exemple à remplacer** par l’identifiant réel. `forecast_type` peut être `daily`, `hourly` ou `twice_daily`, si l’intégration météo fournit ce type de prévision. Si le type demandé n’est pas pris en charge, la carte peut utiliser un autre type disponible ; sans prévision compatible, elle conserve les conditions courantes. La météo provient de Home Assistant ; la carte n’impose pas un fournisseur ou une API supplémentaire.

## 7. Thermomètres par pièce

Dans **Paramètres → Appareils et services**, vérifier l’affectation des appareils ou entités aux pièces. Maison+ classe les capteurs selon :

**Pièce de l’entité → pièce de son appareil → Sans pièce.**

Une affectation spécifique de l’entité prime sur celle de son appareil. Les noms des capteurs ne servent pas à deviner leur pièce. Les mises à jour d’états et de registres sont prises en compte par la carte.

Une pièce est affichée lorsqu’elle contient au moins un thermomètre retenu. Plusieurs thermomètres dans une même pièce restent visibles individuellement. Les métriques manquantes et les valeurs indisponibles ne sont pas remplacées par zéro. Les moyennes utilisent les valeurs disponibles, avec conversion des unités de température lorsque nécessaire.

Toucher un thermomètre ouvre le **dialogue natif Home Assistant** de son entité, avec l’historique disponible selon Recorder. Ce dashboard n’ajoute pas son propre stockage de mesures.

Configuration minimale :

```yaml
type: custom:maison-plus-card
section: rooms
```

Options facultatives :

```yaml
type: custom:maison-plus-card
section: rooms
exclude_areas:
  - exterieur
exclude_entities:
  - sensor.exemple_temperature
include_diagnostic: false
temperature_unit: °C
```

Les identifiants ci-dessus sont **des exemples**. `exclude_areas` attend les identifiants stables des pièces, et `exclude_entities` les identifiants d’entités. Les capteurs diagnostiques sont exclus par défaut (`include_diagnostic: false`). L’unité de température suit la configuration Home Assistant si `temperature_unit` n’est pas précisé ; les valeurs acceptées sont `°C` et `°F`.

## Vérifications après installation

- **Maison+** apparaît dans la barre latérale sans modifier les autres dashboards.
- Les cartes ne signalent pas « custom element doesn’t exist » ; sinon vérifier la copie des fichiers, la ressource de type module et le cache.
- Les consommations correspondent aux sources réellement configurées dans Énergie.
- La météo utilise l’entité voulue et ne présente pas de prévisions fictives.
- Les thermomètres sont dans les bonnes pièces ; un changement d’affectation est répercuté.
- Un relevé ouvre bien le dialogue de la bonne entité, même si deux capteurs ont le même nom.

Le dashboard n’envoie pas de commandes d’éclairage, volet, caméra ou chauffage. Apple Maison reste utilisé pour ces contrôles. Aucun vrai plan 3D n’est fourni à ce stade : voir [PLAN_3D.md](../docs/PLAN_3D.md).

## Références officielles

- [Dashboards Home Assistant](https://www.home-assistant.io/dashboards/dashboards/)
- [Cartes personnalisées : objet `hass` et cycle de vie](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [Gestion de l’énergie](https://www.home-assistant.io/docs/energy/)
- [Questions fréquentes Énergie](https://www.home-assistant.io/docs/energy/faq/)
- [Entités météo](https://www.home-assistant.io/integrations/weather/)
