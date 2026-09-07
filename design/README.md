# Maquettes — le menu de Divine City

Les écrans du menu, dessinés avant d'être codés : les cinq onglets
**Quêtes**, **Olympe**, **Jouer** (au milieu), **Passe** et **Boutique**,
plus les paramètres et la fiche d'un dieu.

Canvas publié : <https://claude.ai/code/artifact/db1f90be-13de-4bae-a869-5195698f5cea>

**2026-09-06 — révision** : trois nouveaux dessins (`assets/ui/bandeau2.png`,
`assets/ui/maquette.png`, `assets/ui/onglets.png`) remplacent l'ancien menu à
trois onglets de `Main.dc.html` :

- **`bandeau2.png`** — le bandeau du haut, étiré d'un bord à l'autre de
  l'écran et collé à son bord supérieur. Il porte déjà l'anneau du
  portrait, la languette du nom et les deux bourses (or, lauriers) ; la
  maquette ne pose que les valeurs et le bouton des réglages par-dessus ;
- **`onglets.png`** — pareil, mais pour la barre du bas : une frise des
  cinq onglets DÉJÀ DESSINÉE, icône et libellé compris, étirée sur toute
  la largeur de l'appli. La maquette pose juste les cinq zones cliquables
  et le liseré d'or de l'onglet actif ;
- **`maquette.png`** — posée sur tous les onglets sauf « Jouer », étirée à
  l'écran entier : fronton, colonnes et socle compris. Le titre de
  l'onglet s'écrit dans sa tablette.

`Reglages.dc.html` et `FicheDieu.dc.html` n'ont pas été retouchés.

**2026-09-06 — mise en place** : les trois dessins ci-dessus sont désormais
DANS l'app, et l'onglet des quêtes suit la planche « Quêtes et défis
célestes » :

- `bandeau2.png` remplace le cadre de ligue dans `TopBar.tsx`. Le dessin
  porte l'anneau du portrait, la languette du nom, les deux bourses et
  leurs boutons « + » ; l'écran ne pose que les valeurs, le portrait, le
  rang et les zones cliquables, en fractions de la largeur mesurées sur
  l'image ;
- `onglets.png` remplace la barre composée de `MenuScreen.tsx`. Le
  médaillon « Jouer » en relief a DISPARU : le dessin traite les cinq
  dalles à égalité, et l'onglet actif se marque par une lueur chaude qui
  suit le doigt ;
- `maquette.png` remplace `temple_cadre.png` sur les quatre onglets
  encadrés. Il porte son propre ciel, et recouvre donc `wallpaper2.png`,
  qui reste le décor de « Jouer » et ce qui glisse entre deux onglets.

Ce que la planche des quêtes montre et que le jeu ne sait pas encore
faire — la rotation quotidienne et hebdomadaire, le versement des
récompenses — est annoncé plutôt qu'inventé : les compteurs se déduisent
toujours de la sauvegarde, et le bouton « Récupérer » reste éteint tant
qu'aucun système ne peut accorder quoi que ce soit (voir l'en-tête de
`QuetesTab.tsx`).

## Les fichiers

| Fichier | Écran |
|---|---|
| `Main.dc.html` | Le menu et ses cinq onglets — **les onglets sont cliquables** |
| `Reglages.dc.html` | Les paramètres, ouverts par l'engrenage de l'onglet Jouer |
| `FicheDieu.dc.html` | La fiche d'un dieu et ses apparences |
| `canvas.json` | La disposition des trois écrans sur le canvas |
| `wallpaper1.jpg` / `wallpaper2.jpg` | Le décor du menu — `assets/wallpaper1.png` / `wallpaper2.png` réduits |
| `bandeau2.jpg` | Le bandeau du haut — `assets/ui/bandeau2.png` réduit, recadré sur sa zone visible |
| `onglets.png` | La barre d'onglets du bas — `assets/ui/onglets.png` |
| `maquette.jpg` | Le cadre qui encadre chaque onglet sauf « Jouer » — `assets/ui/maquette.png` réduit |
| `ligue.jpg` | Le cadre gravé de la carte « course sacrée », sur l'onglet Jouer — `assets/ui/ligue.png` réduit |

Le fichier assemblé (`menu-divine-city.html`, plusieurs Mo) n'est **pas suivi
par Git** : il est regénéré à partir des sources ci-dessus.

## Ce que les maquettes reprennent du jeu

Rien n'est inventé quand le code a déjà tranché :

- la palette de `src/ui/menu/theme.ts` (marbre, parchemin, or, bois, encre) —
  le menu est en plein jour, pas sur le fond de nuit du jeu ;
- les décors de `MenuScreen.tsx` (`wallpaper1.png` / `wallpaper2.png`) et le
  cadre de la carte de la course sacrée (`ART.ligue`, dans `PlayTab.tsx`) ;
- les **sept dieux de `src/entities/gods/roster.ts`** (M12) — couleurs,
  domaines, capacités, et qui est débloqué d'emblée ;
- les prix de `src/meta/store.ts` — `GOD_PRICES`, `LAUREL_PACKS` ;
- la copie exacte de `PlayTab.tsx`, `QuetesTab.tsx`, `OlympeTab.tsx`,
  `PassTab.tsx` et `ShopTab.tsx` (accroche, pitch, notes, libellés).

Titrage en **Cinzel**, texte en **Spectral** — deux polices Google, les
mêmes que `theme.ts` (`FONTS`).

## Ce qui reste à décider

- Les icônes d'onglet et les médaillons de quartier sont posés en émoji
  dans l'onglet Jouer, là où le code embarque de vraies images
  (`icons.ts`, `DISTRICT_ICONS`) : suffisant pour juger la disposition,
  pas le rendu final.
- L'onglet Jouer affiche un solde, un rang et un record d'**exemple**
  (2 480 or, niveau 4, 708 fidèles) : une partie fraîche démarre à 0.
