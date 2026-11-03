# Périmètre produit actuel — Maison+

## Changement de direction

Le propriétaire conserve **Apple Maison pour le pilotage** : lumières Hue, volets, caméras, chauffage et autres commandes continuent d’y être utilisés. Il ne souhaite plus une application web autonome reproduisant toutes ces commandes.

La cible devient **un dashboard natif Home Assistant, nommé Maison+, dans la barre latérale**. L’installation est Home Assistant Container sur QNAP. Le propriétaire a confirmé un **Linky avec module TIC** ; le modèle et l’intégration du module ne sont pas présumés.

## Fonctions retenues

| Fonction               | Choix                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Électricité            | Utiliser le tableau de bord Énergie et ses cartes natives, à partir des index réels du Linky TIC. |
| Météo extérieure       | Afficher l’entité `weather` choisie et les prévisions effectivement disponibles.                  |
| Thermomètres           | Les regrouper par pièce Home Assistant, en conservant chaque capteur identifiable.                |
| Historique des relevés | Ouvrir le dialogue natif Home Assistant et son historique disponible.                             |
| Plan 3D                | Option ultérieure, conditionnée au plan et à la géométrie réels du logement.                      |

## Règles importantes

- L’affectation d’une entité à une pièce prime sur celle de son appareil. Utiliser les identifiants de registre, jamais une déduction depuis le nom affiché.
- Plusieurs thermomètres d’une même pièce restent distincts. Température et humidité sont traitées séparément ; les données absentes ou indisponibles ne deviennent pas zéro.
- Ne pas inventer d’entités, mesures, tarifs ou prévisions pour remplir l’interface.
- Distinguer énergie Wh/kWh, puissance active W/kW et puissance apparente VA. Les coûts demandent une configuration tarifaire réelle.
- La version native utilise la session Home Assistant et ses données. Aucun serveur web indépendant, secret frontend ou conteneur supplémentaire n’est requis pour cette cible.
- Le travail n’est pas validé sur le Home Assistant réel tant que l’installation et les sources n’ont pas été vérifiées sur le QNAP.

## Hors périmètre actuel

- Refaire l’application de pilotage Apple Maison, les commandes de lumières/volets/chauffage ou une section de contrôle caméra concurrente.
- Apple TV/tvOS.
- Afficher un faux logement ou une simple illustration comme s’il s’agissait du véritable plan 3D.
- Supposer le fournisseur météo, le modèle TIC, un contrat électrique ou l’adresse du volume QNAP.

## Ancienne démo conservée

L’interface de `public/`, le serveur `server.mjs` et les fichiers Docker sont conservés comme **ancienne démo web**. Leurs commandes et données sont simulées. Ce n’est plus la solution à installer pour le besoin actuel.

Voir [WEB_DEMO.md](WEB_DEMO.md) pour cette archive. Les anciennes décisions sur les bulles et palettes peuvent servir de référence visuelle, sans imposer l’ancien périmètre à la version native.
