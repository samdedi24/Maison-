# Maison+

**Cible actuelle : dashboard natif Home Assistant, dans la barre latérale.** Installation utilisateur : Home Assistant Container sur QNAP, Linky avec module TIC. Apple Maison reste utilisé pour commandes, lumières, volets, caméras et climat. Ne pas reconstruire une application de pilotage concurrente.

## Travail courant

- Code cible : `homeassistant/` ; dashboard Lovelace et carte `custom:maison-plus-card` recevant `hass`. Aucun serveur Node, proxy ni jeton nécessaire au fonctionnement natif.
- Périmètre : Électricité via Énergie natif HA, météo extérieure et thermomètres par pièce. Véritable plan 3D ultérieur, uniquement après réception de géométrie réelle.
- Pièce : affectation de l’entité → affectation de l’appareil → Sans pièce ; identifiants stables. Plusieurs thermomètres restent distincts. Normaliser °C/°F ; exclure valeurs absentes/indisponibles des moyennes ; afficher « — », jamais inventer de mesures.
- Linky : distinguer énergie Wh/kWh, puissance active W/kW et puissance apparente VA. Coûts seulement avec tarif réel. Ne pas inventer l’intégration du module TIC.
- Ne pas remplacer les configurations Home Assistant existantes. Installation réelle et rendu sur le vrai HA restent à valider.
- Vérifications locales : Node ≥22.9, `npm run check`, `npm test`. Node n’est pas requis dans Home Assistant.

## À lire à la demande

- Installation/options : `homeassistant/README.md`.
- Architecture/données : `docs/HOME_ASSISTANT.md`.
- Périmètre : `docs/DECISIONS.md` ; 3D : `docs/PLAN_3D.md`.
- `public/`, serveur Node et Docker : ancienne démo, hors cible. Archive : `docs/WEB_DEMO.md`.
