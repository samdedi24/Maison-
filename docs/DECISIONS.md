# Décisions produit validées

## Objectif

Retrouver les repères visuels d’Apple Maison tout en bénéficiant des appareils et fonctions de Home Assistant. Le propriétaire possède déjà Home Assistant Container sur QNAP ; Philips Hue, volets roulants et appareils Zigbee font partie de l’équipement prévu.

La version du dépôt est une démo autonome destinée à être reprise avec Claude Code. La connexion à l’installation réelle constitue la prochaine étape.

## Interface retenue

- Bulles horizontales avec pictogramme à gauche, nom et état à droite.
- Appareils regroupés par pièce, et catégories Climat, Lumières, Sécurité et Volets en haut de l’accueil.
- Menu mobile flottant, effet de verre, pictogrammes pleins reconnaissables et sélection dorée.
- Section Caméras sous les catégories : deux aperçus côte à côte dans un cadre arrondi, agrandissement au toucher.
- Vues Maison, Volets, Climat, HomeView, Conso, Sécurité et Plan.
- Widgets HomeView réorganisables et export/import des réglages de démonstration.

La forme des bulles et l’organisation comptent davantage que la reproduction exacte des couleurs. Le fond diffus actuel est accepté comme base ; aucune obligation ne lie les futurs thèmes à cette palette.

## Climat par pièce

Le besoin central est de dépasser une vue globale limitée : chaque thermomètre doit être rattaché à la pièce où il se trouve.

- Une pièce peut contenir plusieurs thermomètres, tous consultables individuellement.
- Elle dispose d’une moyenne calculée uniquement avec ses capteurs disponibles.
- La température et l’humidité sont calculées séparément.
- Les filtres pièce/capteur et les périodes 24 h, 7 jours et 30 jours s’appliquent aux graphiques et statistiques.
- Une absence de donnée s’affiche « — » et ne devient pas 0.
- La moyenne maison donne le même poids à chaque pièce disposant de mesures.
- Les valeurs par pièce sur l’accueil ouvrent directement le Climat de cette pièce.

Dans la démo, les pièces sont fictives. Dans la version connectée, le classement doit reprendre les pièces définies dans Home Assistant et leurs identifiants de registre.

## Limites et exclusions

- **Apple TV/tvOS exclu**, à la demande du propriétaire.
- Aucune connexion Home Assistant, Hue, Zigbee, caméra ou fournisseur d’énergie n’est encore implémentée dans ce dépôt.
- Le plan est illustratif et sera remplacé par celui du logement.
- Les caméras sont des photos fixes d’illustration.
- Les sauvegardes proposées ne sont pas des sauvegardes de l’installation Home Assistant.
- Le dépôt n’est pas une extension HACS ni un dashboard Lovelace installable directement.
