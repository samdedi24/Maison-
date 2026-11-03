# Plan 3D — option ultérieure

**Aucun véritable modèle 3D n’est livré actuellement.** Le plan illustratif de l’ancienne démo web n’est pas le plan du logement et ne doit pas être présenté comme tel. Maison+ peut fonctionner pour l’électricité, la météo et les thermomètres sans cette option.

## Informations nécessaires

Pour construire un plan fidèle, il faudra disposer de l’un des éléments suivants :

- Un modèle 3D existant du logement, dans un format exploitable à identifier.
- Un plan coté avec les dimensions et la hauteur des pièces, permettant de reconstruire une géométrie réelle.
- À défaut, les dimensions et l’organisation des pièces, portes, fenêtres et niveaux nécessaires à une première modélisation.

Il faudra ensuite associer les pièces du modèle aux **identifiants de pièces Home Assistant**, puis positionner les relevés à afficher. Un nom ressemblant à celui d’une pièce n’est pas une correspondance fiable.

## Choix à effectuer avant implémentation

1. Choisir le format de modèle et le rendu adapté aux appareils utilisés, notamment Safari et l’application Companion sur iPhone.
2. Définir les niveaux, l’échelle, l’orientation et les points d’ancrage des pièces.
3. Décider quelles informations montrer dans Maison+ : température, humidité, consommation ou autres relevés déjà disponibles. Le pilotage reste dans Apple Maison.
4. Prévoir les états absents et les pièces sans capteur, ainsi qu’une alternative textuelle accessible.
5. Mesurer le poids du modèle et le coût du rendu pour conserver une utilisation fluide sur mobile.

Une image de plan en 2D ou un SVG annoté peut être utile, mais ne doit pas être annoncé comme une véritable vue 3D. Les fichiers de modèle, leur moteur de rendu et leurs réglages ne sont pas encore choisis ni inclus dans le dépôt.

## Critères pour considérer l’option terminée

- La géométrie correspond au logement réel.
- Les associations avec les pièces Home Assistant sont explicites et vérifiables.
- Les valeurs affichées proviennent de l’installation, sans capteurs fictifs.
- Le rendu est vérifié sur les appareils cibles et ne remplace pas les vues textuelles utiles.
