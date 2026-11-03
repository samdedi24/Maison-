# Maison+

**Maison+ est désormais un dashboard natif de Home Assistant, affiché dans sa barre latérale.** Apple Maison reste l’application utilisée pour les lumières, volets, caméras et autres commandes. Maison+ ajoute les informations souhaitées : électricité Linky, météo extérieure et thermomètres regroupés par pièce.

La version native se trouve dans **[`homeassistant/`](homeassistant/README.md)**. Elle utilise la session Home Assistant existante, sans serveur Node à héberger ni jeton à copier. Il faut installer les fichiers et disposer des intégrations et mesures réelles dans Home Assistant. Cette installation n’a pas encore été vérifiée sur le Home Assistant du propriétaire.

## Ce qui est fourni

| Partie      | Fonction                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Électricité | Cartes natives du tableau de bord Énergie de Home Assistant, alimentées par sa configuration existante. Le propriétaire dispose d’un Linky avec un module TIC. |
| Météo       | Carte Maison+ utilisant une entité `weather` et ses prévisions disponibles.                                                                                    |
| Pièces      | Détection des capteurs de température/humidité et classement par pièce Home Assistant, avec accès au dialogue et à l’historique natifs au toucher.             |
| Plan 3D     | Préparation documentée uniquement. Aucun véritable modèle 3D n’est fourni sans le plan et la géométrie du logement.                                            |

Les entités de l’installation ne sont pas inventées. Les cartes montrent les données disponibles ou expliquent ce qui manque ; elles ne remplacent pas ces données par des valeurs fictives.

## Installer dans Home Assistant

L’installation cible est Home Assistant **Container sur QNAP** :

1. Copier le dossier `homeassistant/www/maison-plus/` dans le volume de configuration Home Assistant, pour obtenir `/config/www/maison-plus/` dans le conteneur.
2. Ajouter la ressource JavaScript **module** `/local/maison-plus/card.js?v=1` dans les ressources des tableaux de bord.
3. Créer un dashboard vide nommé **Maison+**, visible dans la barre latérale, puis y coller le contenu de `homeassistant/dashboard.yaml` dans l’éditeur de configuration brute.
4. Configurer les sources Linky dans le tableau de bord Énergie de Home Assistant et vérifier les intégrations météo et capteurs.

Si le dossier `www` vient d’être créé, redémarrer Home Assistant. Le chemin réel du dossier QNAP dépend du montage existant : ne pas supposer un chemin hôte.

Les étapes détaillées, l’option de dashboard YAML et les réglages des cartes sont dans **[homeassistant/README.md](homeassistant/README.md)**. HACS n’est pas nécessaire pour cette installation manuelle.

## Reprendre avec Claude Code

```bash
git clone https://github.com/samdedi24/Maison-.git maison-plus
cd maison-plus
claude
```

Instruction suggérée :

> Lis CLAUDE.md puis homeassistant/README.md. Le projet cible le dashboard natif Home Assistant ; conserve Apple Maison pour les commandes. Inspecte le code et les tests, puis aide-moi à installer Maison+ sur Home Assistant Container sur QNAP, avec mon Linky TIC, ma météo et mes thermomètres par pièce. Demande uniquement les identifiants ou chemins réellement manquants, sans inventer d’entités ni de mesures.

`CLAUDE.md` est court et renvoie aux documents utiles à la demande pour limiter le contexte chargé automatiquement.

## Développer et vérifier

Node.js 22.9+ sert uniquement aux vérifications locales du dépôt, **pas à l’exécution dans Home Assistant** :

```bash
npm run check
npm test
```

Les tests ne remplacent pas l’installation sur le vrai Home Assistant, la vérification des sources Linky et les essais sur iPhone.

## Organisation

```text
homeassistant/
  dashboard.yaml         Dashboard natif à importer
  www/maison-plus/       Carte personnalisée et fonctions de données
  tests/                 Vérifications de la version native
  README.md              Installation et configuration
CLAUDE.md                Contexte court pour Claude Code
docs/HOME_ASSISTANT.md   Architecture et règles de données natives
docs/DECISIONS.md        Périmètre produit actuel
docs/PLAN_3D.md          Conditions pour un véritable plan 3D
public/                  Ancienne démo web, conservée comme référence
server.mjs, Dockerfile,
compose.yaml             Hébergement de l’ancienne démo, pas du dashboard natif
```

L’ancienne démo n’est plus la cible à installer. Sa documentation est archivée dans [docs/WEB_DEMO.md](docs/WEB_DEMO.md), avec ses [sources d’images](docs/ASSETS.md).
