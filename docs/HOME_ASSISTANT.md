# Raccorder Maison+ à Home Assistant

Ce document décrit la suite à développer. **Aucune connexion Home Assistant n’est présente dans cette version.** L’application actuelle reste utilisable en mode démo sans compte ni accès à la maison.

## Installation cible

L’installation du propriétaire est Home Assistant **Container sur QNAP**. Ce mode ne propose pas le Supervisor ni le magasin d’add-ons de Home Assistant OS. Maison+ peut être hébergé dans un conteneur séparé sur le NAS ; un futur service API pourrait y être ajouté. Les intégrations Hue, Zigbee et volets restent gérées dans Home Assistant.

Le dépôt actuel contient une application web indépendante, pas un dashboard Lovelace. Une intégration dans l’interface Home Assistant nécessitera un choix supplémentaire de présentation et de déploiement. Installer HACS ne branche pas cette application automatiquement.

## Architecture à introduire

Séparer trois responsabilités avant de remplacer les données fictives :

| Couche                    | Responsabilité                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Source de démo            | Conserver les appareils et historiques simulés, accessibles sans Home Assistant.          |
| Adaptateur Home Assistant | Authentification, registres, états, abonnements, historique, services et caméras.         |
| Modèle de présentation    | Pièces, appareils, capteurs, agrégations et erreurs, consommés par l’interface existante. |

Les composants visuels ne doivent pas porter les secrets ni inventer la disponibilité d’un appareil.

## Authentification et réseau

Deux approches sont possibles ; il faut en choisir une avant l’implémentation :

- **Service côté serveur / proxy de même origine** : le navigateur appelle Maison+, le service communique avec Home Assistant. Concevoir une authentification de l’utilisateur et limiter explicitement les routes et services exposés. Un proxy ouvert ou un secret partagé avec tous les visiteurs ne constitue pas une authentification.
- **Application navigateur avec authentification Home Assistant** : utiliser le flux d’authentification adapté et la gestion de session correspondante. Traiter les renouvellements, expirations et déconnexions. Ne pas demander de coller un jeton longue durée dans le code frontend.

Une application hébergée sur une autre origine peut nécessiter une configuration CORS explicite dans Home Assistant. Éviter d’autoriser toutes les origines. Une page HTTPS ne peut pas compter sur des appels HTTP non chiffrés vers Home Assistant : choisir des origines cohérentes ou un proxy local adapté. Pour un accès à distance, réutiliser le mode d’accès sécurisé de l’installation plutôt que supposer le NAS publiquement accessible.

Les éventuelles variables sensibles seront configurées côté serveur, ignorées par Git et absentes des réponses au navigateur. Le serveur statique fourni n’implémente aucun de ces mécanismes.

## Pièces et thermomètres

1. Lire les registres des pièces, appareils et entités ainsi que les états initiaux. Les API WebSocket offrent notamment les commandes de registre `config/area_registry/list`, `config/device_registry/list` et `config/entity_registry/list`, selon les droits du compte.
2. Pour chaque entité, résoudre la pièce dans cet ordre : `entity.area_id`, puis `device.area_id`, puis « Sans pièce ». Une affectation explicite de l’entité prime sur celle de son appareil.
3. Conserver les `area_id`, `device_id` et `entity_id` comme identités. Deux capteurs nommés « Capteur fenêtre » dans deux pièces ne sont pas le même appareil.
4. Rapprocher les entités de température et d’humidité d’un même thermomètre à partir des métadonnées de l’appareil. Une entité d’humidité peut être absente.
5. Identifier les mesures à partir du domaine, de la classe de l’appareil et de l’unité. Normaliser les unités avant une moyenne ; ne pas mélanger °C et °F.
6. Suivre les mises à jour des registres pour qu’un déplacement d’appareil ou une réaffectation de pièce soit reflété dans l’interface.

Les moyennes courantes doivent exclure `unknown`, `unavailable`, les valeurs non numériques et les métriques absentes. Une pièce sans mesure valide affiche « — ». La moyenne maison est une moyenne des pièces disponibles, avec un poids égal par pièce. Les capteurs sans pièce restent visibles et ne participent pas à cette moyenne.

Le délai depuis la dernière modification d’état ne suffit pas à décider qu’un thermomètre est hors ligne. Une valeur stable sur un capteur sur pile peut être ancienne et rester valide ; utiliser les états de disponibilité et une politique de fraîcheur clairement définie si nécessaire.

## États et commandes

Charger les états initiaux, puis suivre leurs changements via WebSocket. Prévoir une reconnexion avec réabonnement et resynchronisation, sans dupliquer les abonnements. Afficher une erreur lorsque la commande échoue ; ne pas présenter systématiquement un état optimiste comme confirmé.

Commencer par les lumières, les volets et les capteurs. Utiliser les services Home Assistant et les capacités des entités pour afficher uniquement les commandes compatibles : la position d’un volet, les couleurs Hue ou une consigne de chauffage ne sont pas universelles.

## Historiques climat et énergie

Les graphiques actuels sont générés pour la démo. Les remplacer par les données conservées par Recorder, les API d’historique et, lorsque pertinent, les statistiques de longue durée. La couverture réelle dépend de la configuration et de la durée de conservation de l’installation.

- Aligner les séries temporelles avant de calculer une moyenne de plusieurs capteurs ; conserver les trous, les unités et les limites de couverture.
- Conserver les mesures historiques valides antérieures à une indisponibilité actuelle, sans inventer de nouveaux relevés.
- Calculer moyenne, minimum et maximum à partir de la série réellement affichée. Définir la pondération temporelle si la fréquence de mesure varie.
- Séparer puissance instantanée, énergie cumulée et coût. Gérer les remises à zéro et les classes de statistiques adaptées.
- Tempo, EcoWatt, abonnement et prix du kWh devront venir d’intégrations et du contrat réel. Les valeurs présentes ne sont pas les signaux réels du jour.

## Caméras

Les fichiers `public/assets/camera-*.jpg` sont des illustrations. Commencer par un aperçu authentifié depuis les entités caméra, puis ajouter le type de flux réellement compatible avec l’installation si souhaité. Le navigateur ne doit pas recevoir un jeton longue durée dans une URL d’image ou de vidéo. Un accès RTSP direct ne peut pas être supposé compatible avec Safari.

Conserver l’agrandissement, le choix de la caméra et les états indisponibles. Distinguer clairement une image fixe, la date de capture et un flux actif.

## Critères de fin du premier raccordement

- Le mode démo reste utilisable et visuellement inchangé.
- Les pièces réelles et leurs thermomètres apparaissent avec leurs identifiants stables.
- Deux thermomètres d’une même pièce restent distinguables, et leurs moyennes sont cohérentes.
- Un changement de pièce, une entité indisponible et une absence d’humidité sont traités correctement.
- Les courbes proviennent de l’historique réel et suivent la sélection.
- Les commandes de lumière et de volet sont confirmées par les états remontés.
- Aucun secret n’est livré dans les fichiers publics, les sauvegardes JSON ou les journaux.
- Les tests passent et les parcours sont vérifiés sur iPhone et ordinateur.
