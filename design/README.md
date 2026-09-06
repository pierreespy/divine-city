# Maquettes — le menu de Divine City

Les écrans du menu, dessinés avant d'être codés : les cinq onglets
**Quêtes**, **Olympe**, **Jouer** (au milieu), **Passe** et **Boutique**,
plus les paramètres et la fiche d'un dieu.

Canvas publié : <https://claude.ai/code/artifact/db1f90be-13de-4bae-a869-5195698f5cea>

**2026-09-06 — révision** : le menu codé (`src/ui/menu/`) est passé par
plusieurs vagues depuis la dernière relecture de `Main.dc.html` — cinq
onglets au lieu de trois, un bandeau supérieur et une barre d'onglets qui
courent chacun sur toute la largeur de l'appli, et un temple dessiné qui
encadre l'écran entier sur tous les onglets sauf « Jouer ». `Main.dc.html`
a été refait pour suivre :

- le **bandeau du haut** (`TopBar.tsx`) — le cadre gravé (`ligue.png`),
  étiré d'un bord à l'autre de l'écran et collé à son bord supérieur, qui
  porte le portrait, le nom du dieu, les deux bourses et les réglages ;
- la **barre d'onglets du bas** (`TabBar`, dans `MenuScreen.tsx`) — le même
  principe, collée au bord inférieur, avec quatre dalles réparties en deux
  groupes symétriques et le médaillon « Jouer » qui flotte au centre ;
- le **temple dessiné** (`temple_cadre.png`) — posé sur tous les onglets
  sauf « Jouer », étiré à l'écran entier, fronton, colonnes et socle
  compris ; le titre de l'onglet s'écrit dans sa tablette ;
- le **décor en deux images** — `wallpaper1.png` pour « Jouer », partagé
  par les quatre autres onglets sous `wallpaper2.png`.

`Reglages.dc.html` et `FicheDieu.dc.html` n'ont pas été retouchés.

## Les fichiers

| Fichier | Écran |
|---|---|
| `Main.dc.html` | Le menu et ses cinq onglets — **les onglets sont cliquables** |
| `Reglages.dc.html` | Les paramètres, ouverts par l'engrenage de l'onglet Jouer |
| `FicheDieu.dc.html` | La fiche d'un dieu et ses apparences |
| `canvas.json` | La disposition des trois écrans sur le canvas |
| `wallpaper1.jpg` / `wallpaper2.jpg` | Le décor du menu — `assets/wallpaper1.png` / `wallpaper2.png` réduits |
| `temple-cadre.jpg` | Le temple qui encadre chaque onglet sauf « Jouer » — `assets/temple_cadre.png` réduit |
| `ligue.jpg` | Le cadre gravé du bandeau du haut et de la carte de la course — `assets/ui/ligue.png` réduit |

Le fichier assemblé (`menu-divine-city.html`, plusieurs Mo) n'est **pas suivi
par Git** : il est regénéré à partir des sources ci-dessus.

## Ce que les maquettes reprennent du jeu

Rien n'est inventé quand le code a déjà tranché :

- la palette de `src/ui/menu/theme.ts` (marbre, parchemin, or, bois, encre) —
  le menu est en plein jour, pas sur le fond de nuit du jeu ;
- les décors et le cadre exacts de `MenuScreen.tsx` et `TopBar.tsx` ;
- les **sept dieux de `src/entities/gods/roster.ts`** (M12) — couleurs,
  domaines, capacités, et qui est débloqué d'emblée ;
- les prix de `src/meta/store.ts` — `GOD_PRICES`, `LAUREL_PACKS` ;
- la copie exacte de `PlayTab.tsx`, `QuetesTab.tsx`, `OlympeTab.tsx`,
  `PassTab.tsx` et `ShopTab.tsx` (accroche, pitch, notes, libellés).

Titrage en **Cinzel**, texte en **Spectral** — deux polices Google, les
mêmes que `theme.ts` (`FONTS`).

## Ce qui reste à décider

- Les icônes d'onglet du bas et les médaillons de quartier sont posés en
  émoji dans la maquette, là où le code embarque de vraies images
  (`icons.ts`, `ART`, `DISTRICT_ICONS`) : suffisant pour juger la
  disposition, pas le rendu final.
- L'onglet Jouer affiche un solde, un rang et un record d'**exemple**
  (2 480 or, niveau 4, 708 fidèles) : une partie fraîche démarre à 0.
- Rien de tout cela n'est branché : les écrans correspondent au menu déjà
  codé, pas à une nouvelle milestone.
