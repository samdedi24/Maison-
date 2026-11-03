# Images, pictogrammes et police

## Photos des caméras fictives

Ces deux photos ont été téléchargées pour illustrer les aperçus de la démo. Elles ne proviennent d’aucune caméra du propriétaire et ne représentent aucun flux en direct.

| Fichier                            | Illustration                 | Source de téléchargement                                                                             |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `public/assets/camera-bedroom.jpg` | Chambre lumineuse            | https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=80&fit=crop&auto=format&fm=jpg |
| `public/assets/camera-living.jpg`  | Salon avec canapé et plantes | https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80&fit=crop&auto=format&fm=jpg |

Source : Unsplash. Les photos restent des contenus tiers soumis aux [conditions d’Unsplash](https://unsplash.com/license) ; aucune licence propre au projet ne remplace ces conditions. Elles sont conservées localement pour que les aperçus ne dépendent pas d’un téléchargement à chaque affichage.

## Pictogrammes et fond

Les pictogrammes SVG du code ont été dessinés pour ce projet. Le fond coloré et les effets de verre sont produits en CSS. Aucun fichier d’icône Apple ni police SF Symbols n’a été intégré au dépôt. L’interface s’inspire des repères d’Apple Maison sans être un produit Apple officiel.

## Police

`public/style.css` importe facultativement **DM Sans** via Google Fonts. La pile typographique utilise d’abord les polices système `-apple-system`, `BlinkMacSystemFont`, puis DM Sans et une police sans empattement générique.

Sans accès à Google Fonts, les polices de repli restent disponibles. Pour un déploiement entièrement local, supprimer l’import externe ou héberger une copie de la police en conservant sa licence. Aucun fichier de police n’est actuellement inclus.
