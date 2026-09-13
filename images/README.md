# images

Les images **de travail** : maquettes, captures d'écran, références visuelles.

⚠️ Ce dossier ne part PAS dans l'application. Rien de ce qu'il contient n'est
chargé par le code : une image que le jeu doit afficher vit dans `assets/`
(voir `assets/README.md`), et elle seule y est empaquetée. Ici, on dépose ce
qui sert à discuter d'un écran, pas à le dessiner.

Ce qui y a sa place :

- les **maquettes** d'un écran, avant de l'écrire ;
- les **captures** d'un écran tel qu'il rend vraiment, pour comparer ;
- les **références** — une palette, un fronton, une barre d'onglets vue
  ailleurs et dont on veut s'inspirer.

Deux habitudes qui évitent un dossier illisible au bout de dix fichiers :

- **Nomme par l'écran, pas par la date** : `menu-barre-onglets.png` se
  retrouve, `IMG_4821.png` non.
- **Préfère le PNG** pour une capture d'interface — le JPEG salit les
  aplats de parchemin et les lettres gravées.

## Les sources détourées

Une bonne part de ce dossier ne sert pas à discuter d'un écran mais à en
FABRIQUER une image : ce sont les sources brutes des PNG d'`assets/ui/`, telles
que l'outil de dessin les a rendues — sujet posé sur un damier gris, ou sur un
aplat. Elles restent ici, hors de l'application ; c'est `tools/detourer.py` qui
en tire le fichier empaqueté, et `assets/ui/README.md` qui donne la commande
exacte de chacune.

Trois sont arrivées en dernier, et elles sont en PNG plutôt qu'en JPEG :

| Source | Devient | Ce que c'est |
| --- | --- | --- |
| `case lauriers.png` | `assets/ui/case-lauriers.png` | Le cadre d'un paquet de lauriers |
| `case skins.png` | `assets/ui/case-skins.png` | Le même cadre, debout — pas encore posé |
| `bouton simple.png` | `assets/ui/bouton-simple.png` | La plaque d'or NUE, face du bouton d'appel |

⚠️ `bouton simple.png` n'a **pas de damier** : son fond est un aplat brun. Le
détourage par alternance ne peut rien en faire, d'où le mode `--fond` du script,
qui retire la couleur du fond lue sur les bords.
