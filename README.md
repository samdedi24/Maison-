# Maison+

Une interface domotique inspirée d’Apple Maison, avec les outils et la liberté souhaités pour Home Assistant.

Ce dépôt contient **la démo interactive validée**, prête à lancer et à reprendre avec Claude Code. Les appareils, mesures, historiques, caméras et consommations sont simulés. **Le raccordement à Home Assistant reste à développer.**

Il s’agit d’une application web indépendante en HTML, CSS et JavaScript. Ce code n’est pas un dashboard Lovelace, une carte HACS ou une intégration Home Assistant à installer telle quelle.

## Lancer la démo

Prérequis : Node.js **22.9 ou plus récent**. Aucun paquet npm n’est nécessaire pour exécuter l’application.

```bash
git clone https://github.com/samdedi24/Maison-.git maison-plus
cd maison-plus
npm start
```

Ouvrir **http://127.0.0.1:3000**. Pour travailler sur le code :

```bash
npm run dev
```

Le mode développement redémarre le serveur lorsque ses fichiers changent ; actualiser le navigateur après une modification de l’interface. Les valeurs par défaut sont `HOST=127.0.0.1` et `PORT=3000`. Pour les adapter, copier `.env.example` vers `.env`, puis modifier cette copie locale. Aucun jeton Home Assistant n’est nécessaire.

Une autre possibilité, avec Python 3 :

```bash
python3 -m http.server 3000 --directory public
```

Le serveur Python sert uniquement les fichiers de démonstration ; il ne remplace pas un futur service Home Assistant.

## Ce que contient la démo

| Vue      | Fonctions disponibles                                                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maison   | Bulles de catégories, appareils regroupés par pièce, scènes et deux aperçus caméra côte à côte. Toucher l’icône d’une lampe la bascule ; toucher son nom ouvre ses réglages. |
| Volets   | Position, ouverture, fermeture, arrêt, commandes individuelles et globales, mouvement simulé.                                                                                |
| Climat   | Plusieurs thermomètres par pièce, relevés individuels, moyennes et graphiques sur 24 h, 7 jours ou 30 jours.                                                                 |
| HomeView | Widgets réorganisables par flèches ou glisser-déposer, raccourcis et vue personnalisable.                                                                                    |
| Conso    | Exemples de puissance, kWh, coûts, répartition par appareil, Tempo et EcoWatt.                                                                                               |
| Sécurité | État des ouvertures et alarme de démonstration.                                                                                                                              |
| Plan     | Plan illustratif du logement et commandes d’éclairage.                                                                                                                       |

Sur mobile, **Plus** donne accès aux caméras, à la sécurité, au plan et aux réglages. Les caméras utilisent des **photos fixes**, agrandissables, sans flux vidéo ni son.

### Climat par pièce

- Le Salon et la Chambre illustrent le cas de plusieurs thermomètres dans une même pièce.
- La moyenne d’une pièce utilise ses capteurs disponibles. Température et humidité sont calculées séparément.
- La moyenne maison donne le même poids à chaque pièce disposant de mesures, quel que soit son nombre de thermomètres.
- Un capteur indisponible reste visible et ne participe pas aux moyennes. Une absence de mesure s’affiche « — ».
- Les capteurs sans pièce sont regroupés dans « Sans pièce » lorsqu’ils existent et sont exclus de la moyenne maison.
- Le choix d’une pièce ou d’un thermomètre change les courbes et les statistiques affichées.

Les valeurs de l’accueil, du Plan et de HomeView utilisent les mêmes calculs. Les consignes de chauffage restent fictives.

### Sauvegardes de la démo

Les états des appareils, les consignes, l’alarme et la disposition des widgets sont enregistrés dans le `localStorage` du navigateur sous `maison-plus-demo`. Les réglages proposent un export et un import JSON validé, ainsi qu’une réinitialisation.

Ces fichiers ne sont **pas des sauvegardes de Home Assistant**. Les relevés climat et les photos de démonstration ne représentent aucune installation réelle.

## Sur un QNAP avec Container Station

Depuis le dossier du projet sur le NAS, avec Docker Compose disponible :

```bash
docker compose up -d --build
```

Ouvrir `http://ADRESSE_DU_QNAP:3000`. Le port hôte peut être adapté dans `compose.yaml` s’il est déjà utilisé.

Maison+ tourne dans **son propre conteneur**. Ne pas remplacer le conteneur Home Assistant existant. Cette installation héberge la démo ; elle ne connecte pas automatiquement les appareils.

La configuration Compose a été vérifiée syntaxiquement. La construction de l’image et le déploiement sur le NAS réel restent à valider.

## Reprendre avec Claude Code

Depuis la copie locale du dépôt :

```bash
claude
```

Instruction de départ suggérée :

> Lis CLAUDE.md et docs/HOME_ASSISTANT.md. Inspecte le dépôt et lance les vérifications. Préserve l’interface validée et le mode démo. Poursuis le raccordement à mon Home Assistant Container sur QNAP, en commençant par les pièces, les entités et les thermomètres. Demande uniquement les informations de connexion manquantes ; n’invente aucun jeton ni identifiant d’entité. Ne place aucun jeton dans le code du navigateur.

Le contexte produit est conservé dans [docs/DECISIONS.md](docs/DECISIONS.md). Le détail des fichiers et des règles de développement se trouve dans [CLAUDE.md](CLAUDE.md).

## Vérifier les modifications

```bash
npm run check
npm test
```

`check` vérifie la syntaxe des scripts. Les tests couvrent les calculs et interactions de la démo ainsi que le serveur HTTP statique. Ils ne remplacent pas une vérification visuelle dans Safari sur iPhone, notamment pour les bulles, les dialogues et le menu flottant. Cette vérification navigateur n’a pas été automatisée ici.

## Organisation

```text
public/             Interface et données de démonstration
  index.html        Page et ordre de chargement des scripts
  app.js            Navigation, appareils, scènes, caméras et réglages
  climate.js        Modèle climat, regroupements, statistiques et graphiques
  *.css             Styles de base, menu, accueil et climat
  assets/           Photos locales utilisées pour les caméras fictives
server.mjs          Serveur des fichiers statiques
tests/              Vérifications automatiques
docs/               Décisions, raccordement Home Assistant et sources des images
CLAUDE.md           Consignes pour reprendre le projet
```

Les sources et remarques sur les images, les pictogrammes et la police sont dans [docs/ASSETS.md](docs/ASSETS.md).
