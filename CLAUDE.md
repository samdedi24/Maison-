# Maison+

Démo web validée, destinée à Home Assistant Container sur QNAP (Hue, Zigbee, volets). **Aucune connexion Home Assistant n’est implémentée.** Appareils, historiques, énergie et caméras sont simulés. Ce n’est pas un dashboard Lovelace/HACS installable.

## Travail courant

- Node ≥22.9 ; `npm start` ; `npm run check` ; `npm test`.
- Interface : `public/`. Serveur statique : `server.mjs`. Scripts classiques : charger `climate.js` avant `app.js` (globaux partagés).
- Préserver les bulles, caméras côte à côte, menu mobile, sept vues et mode démo. Apple TV hors périmètre. Ne pas casser les sauvegardes sans migration.
- Climat : plusieurs thermomètres par pièce ; métriques absentes/indisponibles exclues ; aucune mesure = « — ». Moyenne maison = moyenne des pièces disponibles, à poids égal ; « Sans pièce » exclu.
- Réel : pièce de l’entité → pièce de l’appareil → Sans pièce ; identifiants stables, jamais les noms affichés. Aucun jeton longue durée côté navigateur ; échapper les noms externes.
- Les tests couvrent les comportements, pas le rendu Safari ni le déploiement sur le vrai NAS.

## Contexte à la demande

Ne lire que le document utile à la tâche ; aucun import automatique :

- Raccordement réel : `docs/HOME_ASSISTANT.md`.
- Architecture, sauvegardes et règles détaillées : `docs/DEVELOPMENT.md`.
- Choix produit : `docs/DECISIONS.md`.
- Lancement/Docker : `README.md` ; images : `docs/ASSETS.md`.
