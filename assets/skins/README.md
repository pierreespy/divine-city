# assets/skins

Les skins des personnages jouables (apparences alternatives).

Voir `assets/models/README.md` pour la convention générale des modèles 3D
(`.glb` uniquement) et `src/entities/gods/roster.ts` pour le catalogue des
dieux. Ce dossier accueillera les variantes visuelles de chaque personnage,
au fur et à mesure qu'elles seront produites.

## Un dossier par catégorie de rareté

Les visuels de skins se rangent par catégorie, la même hiérarchie que les
cadres `assets/ui/Case_*.png` (du plus commun au plus rare) :

- `mortelle/`
- `heroique/`
- `titanesque/`
- `olympienne/`

Chaque image prend le nom de sa parure (ex. `olympienne/zeus_foudre_imperiale.png`).
Pas d'espace ni d'accent dans les noms de fichiers : Metro ne les résout pas.
