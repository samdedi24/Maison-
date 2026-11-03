> **Référence historique de la démo web.** Ce document décrit `public/` et le serveur Node conservés comme archives. Pour la version native désormais visée, lire [homeassistant/README.md](../homeassistant/README.md) et [HOME_ASSISTANT.md](HOME_ASSISTANT.md). Ne pas poursuivre l’ancien adaptateur web sur cette base.

# Référence de développement — Maison+

Maison+ est la démo web validée d’une interface inspirée d’Apple Maison, destinée à être raccordée à Home Assistant. Le propriétaire utilise **Home Assistant Container sur QNAP**. Son équipement prévu comprend Philips Hue, des volets roulants et des appareils Zigbee. La liste réelle des entités, pièces et capteurs n’a pas encore été fournie.

## État réel du projet

- L’interface et les interactions de démonstration existent.
- Aucun client Home Assistant, service d’authentification ou proxy API Home Assistant n’est implémenté.
- Le serveur Node sert les fichiers statiques. Il n’est pas un backend domotique.
- Les caméras sont des photos fixes ; les consommations, tarifs et signaux Tempo/EcoWatt sont des exemples.
- Le stockage dans `localStorage` et l’export JSON concernent uniquement la démo.

Ne pas annoncer une connexion réelle tant qu’elle n’a pas été implémentée et vérifiée.

## Préserver les choix validés

- Bulles horizontales : icône à gauche, nom et état à droite, pièces clairement identifiées.
- Catégories Climat, Lumières, Sécurité et Volets en haut de l’accueil.
- Section Caméras sous ces catégories, deux aperçus adjacents dans un cadre arrondi, aperçu agrandissable.
- Menu flottant sur mobile avec pictogrammes reconnaissables et sélection visible. Les fonctions supplémentaires restent accessibles via Plus.
- Sept vues : Maison, Volets, Climat, HomeView, Conso, Sécurité et Plan.
- Couleurs adaptables ultérieurement ; ne pas refaire le design pour brancher les données.
- Apple TV/tvOS hors périmètre.

Voir [docs/DECISIONS.md](DECISIONS.md).

## Exécution et vérification

Node.js 22.9+, sans dépendances npm d’exécution :

```bash
npm start
npm run dev
npm run check
npm test
```

La démo se trouve sur `http://127.0.0.1:3000`. Vérifier le rendu mobile après tout changement de disposition. Exécuter `npm run check` et `npm test` après une modification fonctionnelle ; ajouter des tests portant sur les règles métier ou les comportements réellement modifiés. Les tests HTTP et métier passent ; le rendu sur iPhone, la construction de l’image Docker et le déploiement sur le vrai QNAP ne sont pas validés par ces tests.

## Carte du code

`public/index.html` charge **`climate.js` avant `app.js`**. Ce sont actuellement des scripts classiques partageant un contexte global, pas des modules ES. Les fonctions de `climate.js` utilisent certaines fonctions et variables de `app.js` au moment de leur exécution. Conserver cet ordre ou effectuer une migration complète et testée des deux côtés.

`public/app.js` gère l’état simulé, la navigation par fragment d’URL, les commandes, scènes, dialogues, caméras, HomeView et l’import/export. `initial`, `validState()` et la clé `maison-plus-demo` définissent le format de sauvegarde courant. Ne pas casser les sauvegardes sans migration explicite.

`public/climate.js` contient les pièces et thermomètres fictifs, leur disponibilité, les moyennes et les historiques générés. `roomReadingByName()` est un raccourci de démonstration : **ne pas utiliser les noms affichés comme identité des pièces dans le raccordement réel**.

Les styles sont séparés en `style.css`, `menu.css`, `home.css` et `climate.css`. Le fond coloré est appliqué à l’accueil via la classe `home-screen`. Les images caméra sont locales dans `public/assets/`.

## Règles climat à conserver

1. Lier chaque capteur à un identifiant stable de pièce (`areaId`). Plusieurs thermomètres peuvent appartenir à la même pièce ; leurs relevés restent accessibles individuellement.
2. Calculer température et humidité indépendamment. Une humidité absente n’est pas 0 %.
3. Exclure les valeurs non numériques et les capteurs indisponibles des moyennes courantes. Afficher « — » si aucune mesure valide n’existe.
4. Calculer d’abord les moyennes des pièces, puis la moyenne maison avec un poids égal par pièce disponible. « Sans pièce » reste visible mais est exclu de la moyenne maison.
5. Réinitialiser le capteur sélectionné lorsqu’on change de pièce. Statistiques et courbes doivent suivre la sélection et la période.
6. Distinguer valeur actuelle, moyenne sur une période et extrema de la courbe. L’accueil, le Plan et HomeView doivent utiliser les mêmes sources.
7. Ne pas déduire l’indisponibilité d’un simple délai arbitraire depuis `last_updated` : un capteur sur pile peut conserver une valeur stable longtemps. Traiter les états Home Assistant et la politique de fraîcheur séparément.

## Prochaine étape : adaptateur Home Assistant

Lire [docs/HOME_ASSISTANT.md](HOME_ASSISTANT.md). Séparer les données de démonstration du client réel et conserver un mode démo explicite.

- Définir le modèle interne des pièces, appareils, entités, relevés et historiques.
- Charger les registres des pièces, appareils et entités et les états initiaux. Résoudre la pièce selon **affectation de l’entité → affectation de son appareil → Sans pièce**. Utiliser les identifiants des registres ; ne pas analyser les `friendly_name` pour deviner une pièce.
- Suivre les changements d’états et de registres, la reconnexion et les erreurs d’authentification.
- Reconstituer les thermomètres dont les entités température/humidité appartiennent au même appareil ; ne pas fusionner des capteurs indépendants parce qu’ils partagent un nom.
- Utiliser l’historique réellement conservé par Home Assistant ; ne pas réutiliser les séries sinusoïdales de la démo comme mesures réelles.
- Brancher les commandes disponibles selon les capacités déclarées des entités.

Choisir l’authentification et le mode de déploiement avant d’écrire le client réseau : session côté serveur avec proxy de même origine, ou flux d’authentification Home Assistant approprié à une application navigateur. **Ne jamais intégrer de jeton longue durée dans `public/`, un bundle, un fichier versionné, une URL ou une sauvegarde de l’interface.** Un éventuel secret de service reste côté serveur, hors Git et hors journaux.

Les noms provenant de Home Assistant sont des données externes. Le rendu actuel utilise des chaînes HTML avec des constantes de démo : échapper les valeurs externes ou passer par des nœuds texte lors de l’introduction du client réel.
