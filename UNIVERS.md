# L'univers de Divine City — mythologie grecque

> Document de référence du **thème**. Le « quoi » et le « pourquoi » du
> contenu ; le « comment » technique reste dans [`README.md`](./README.md),
> et l'historique dans [`UPDATE.md`](./UPDATE.md).
>
> **État : décidé le 2026-09-02.** Les chiffres d'équilibrage ci-dessous sont
> des **points de départ à régler en jouant**, pas des vérités.

---

## Le nom

Le jeu s'appelle **Divine City** (décidé le 2026-09-02, après « Brainrot
City », « Olympus » et « Gods Rush »).

Le nom réunit les deux moitiés du jeu : **Divine** pour le panthéon jouable et
ses capacités, **City** pour la cité que l'on parcourt et qui est le terrain de
jeu. Il garde aussi la structure « … City » du tout premier nom, ce qui n'est
pas anodin : c'est la famille de noms du genre (*Crowd City*).

L'identifiant technique de l'app est **`com.pierreespy.divinecity`**. Il est
**définitif dès la première publication** sur les stores : ne plus y toucher.

> ⚠️ Restent à vérifier avant publication : le nom exact sur l'App Store
> (Apple impose l'unicité du nom d'app) et l'absence de **marque déposée** en
> classes 9 et 41 (INPI, EUIPO). Chercher aussi les **voisins immédiats**
> (« Divine City 3D », « Divinity City »…) : un nom libre mais trop proche
> d'un jeu existant se fait écraser dans les résultats de recherche.

## Le pitch

Tu incarnes une **divinité de l'Olympe** descendue dans une cité grecque. Les
mortels que tu croises te suivent : ton **cortège** grandit à mesure que tu
traverses l'agora, le port et les temples. Chaque dieu joue différemment grâce
à **une capacité qui lui est propre**.

Le genre ne change pas — c'est toujours un *crowd runner*. Le thème remplace le
vocabulaire, l'habillage et le contenu :

| Générique | Dans le jeu |
|---|---|
| Le joueur | Une **divinité** de l'Olympe |
| Les PNJ | Des **mortels** de la cité |
| La foule | Le **cortège** de fidèles |
| Recruter | **Convertir** un mortel |
| La ville | Une **cité grecque** (agora, temples, port) |
| Le pouvoir spécial | La **capacité divine** |

---

## La cité

> **État : bâtie en Milestone 11.** Les six quartiers ci-dessous existent dans
> le jeu. Ce qui suit reste la référence du « pourquoi » ; le « comment » est
> dans [`README.md`](./README.md) et le plan dans `src/world/districts.ts`.

La ville de la Milestone 2 était une grille uniforme de pâtés de maisons. Elle
fonctionnait, mais elle avait un **défaut de jeu identifié** : tous les
carrefours se ressemblaient, donc **on s'y perdait et on ne mesurait pas sa
progression**. Le thème a été l'occasion de le corriger, en découpant la cité
en **quartiers reconnaissables**.

| Quartier | À quoi ça ressemble | Rôle de jeu |
|---|---|---|
| **L'Agora** | Grande place ouverte, dallée, colonnades | Point de départ (le carrefour central actuel), forte densité de mortels |
| **La Céramique** | Pâtés serrés, toits de tuiles, ruelles | Le tissu urbain courant — l'équivalent de la ville actuelle |
| **L'Acropole** | Temple de marbre, péristyle à ciel ouvert | Repère — mais **au sol**, pas à l'horizon : voir l'encadré |
| **Le Port** | Quais, entrepôts, mer sur un bord | Bord de carte naturel : plus besoin d'un mur invisible |
| **Le Théâtre** | Gradins en demi-cercle | Petite arène, gros paquet de mortels d'un coup |
| **Le Bois sacré** | Oliviers, autels, pas de bâti | Respiration visuelle, raccourci |

**Vocabulaire visuel** — marbre clair et ocre à la place des façades grises
actuelles, toits de tuiles, **colonnes**, statues, braseros, oliviers. Le sol
passe de l'asphalte à la **pierre et à la terre battue** ; les bandes blanches
de la route deviennent des **dalles**.

**Ce que ça a coûté techniquement** — à peu près ce qui était prévu. La
génération de `src/world/City.ts` a gardé sa structure : un **quartier par
pâté** choisit la palette, la hauteur et la façon d'occuper le terrain. Les
colonnes, les toits et les oliviers sont des `InstancedMesh` de plus, soit
quelques appels GPU — la technique posée en Milestone 2 a tenu, et le décor ne
pèse que 12 858 triangles sur les 70 000 d'une image chargée.

> ⚠️ **Un repère visible depuis toute la carte n'est pas possible**, et il a
> fallu s'y faire. La caméra est à 40 unités de haut et penchée : le haut de
> l'écran touche le sol à **55 unités**. Rien ne dépasse cet horizon, quelle
> que soit sa hauteur — un temple deux fois plus grand ne se verrait pas de
> plus loin, il masquerait seulement le joueur qui passe devant. L'orientation
> se joue donc **au sol** : chaque quartier a sa couleur de dalle, et son nom
> s'affiche quand on y entre. Si l'on tient un jour à une silhouette à
> l'horizon, c'est la caméra qu'il faudra redresser — et alors relire la
> hauteur des bâtiments, qui en dépend.

---

## Les mortels

Tous les PNJ ne se valent pas : c'est ce qui donne un intérêt à **choisir** où
courir plutôt que de ratisser au hasard.

| Mortel | Valeur | Comportement |
|---|---|---|
| **Citoyen** | 1 fidèle | Déambule tranquillement. Le tout-venant. |
| **Hoplite** | 3 fidèles | Plus lent à convertir (contact plus long) |
| **Prêtresse** | 1 fidèle + recharge la capacité | Rare, immobile près des temples |
| **Philosophe** | 1 fidèle | **Fuit** le cortège : il faut le coincer |

> Départ prudent : la Milestone 4 ne fera **que des citoyens**. Les autres
> types arrivent avec le panthéon (M16-M18), une fois la boucle de base
> jouable.

---

## Le panthéon jouable

> **État : les données existent depuis la Milestone 12.** Les sept dieux
> ci-dessous vivent dans `src/entities/gods/roster.ts`, une ligne chacun.
> Ce qui manque encore : pouvoir en **choisir** un (M13), le **voir** (M14),
> les **débloquer** (M15) et **utiliser** leur capacité (M19 à M27).

Chaque dieu se résume à **trois choses** : une apparence, une capacité, et un
ou deux réglages qui lui sont propres. Techniquement, ce n'est donc **pas une
classe par dieu**, mais une **ligne dans un tableau de données** — ce qui rend
l'ajout d'un dieu quasi gratuit.

| Dieu | Capacité | Ce qu'elle fait | Durée | Recharge |
|---|---|---|---|---|
| **Hermès** ⚡ | **Talaria** | Sprint : +80 % de vitesse, le cortège suit sans se disloquer | 3 s | 12 s |
| **Zeus** 🌩️ | **Foudre** | Convertit d'un coup **tous** les mortels dans un rayon | instantané | 20 s |
| **Aphrodite** 💫 | **Charme** | Le rayon de conversion est multiplié par 2,5 | 6 s | 20 s |
| **Poséidon** 🌊 | **Ressac** | Une vague **pousse vers toi** les mortels devant toi | instantané | 18 s |
| **Athéna** 🛡️ | **Égide** | Ton cortège ne peut **rien perdre** | 5 s | 25 s |
| **Hadès** 💀 | **Retour du Styx** | Récupère la moitié des fidèles perdus récemment | instantané | 30 s |
| **Arès** ⚔️ | **Charge** | Ton cortège **vole** des fidèles aux cortèges rivaux | 4 s | 22 s |

> 🎨 **Pense-bête pour le design visuel des dieux (M14, M40).** Prototyper
> l'apparence des 7 dieux avec **Rodin (Hyper3D)** en premier : génération
> illimitée gratuite, on ne paie qu'au téléchargement du modèle final gardé —
> idéal pour itérer sur 7 styles avant d'en figer un. Meshy (mode Low Poly)
> et Tripo restent les alternatives si besoin d'un contrôle plus fin du
> nombre de triangles. Détails du pipeline complet dans la note plus bas,
> section *"Ce qui n'est PAS décidé" → "Le style des personnages"*.

**Comment les capacités sont conçues.** Chacune répond à un problème de jeu
différent, pour que le choix du dieu soit un vrai choix :

- Hermès résout **la distance** (arriver le premier) ;
- Zeus et Poséidon résolvent **le ramassage** (convertir vite, ou faire venir
  à soi) ;
- Aphrodite résout **la marge d'erreur** (frôler suffit) ;
- Athéna et Hadès résolvent **la perte** (encaisser, ou réparer) ;
- Arès résout **le conflit** (prendre chez l'adversaire).

**Deux dieux de départ, le reste à débloquer.** Hermès (le plus lisible) et
Zeus (le plus spectaculaire) sont disponibles d'emblée ; les autres se
débloquent en jouant. Cela donne une raison de rejouer sans rien demander au
joueur.

**Le contrat technique** sera le même que pour les entrées et les collisions —
une interface, plusieurs implémentations :

```
src/systems/abilities/Ability.ts    Le contrat : activate(), update(), état de recharge
src/entities/gods/roster.ts         Le tableau de données : un dieu = une ligne
src/ui/AbilityButton.tsx            Le bouton + la jauge de recharge
```

Le jeu ne connaîtra donc **jamais** « Zeus » : il connaît « la capacité du dieu
sélectionné ». Ajouter un dieu = ajouter une ligne et une implémentation.

---

## Les rivaux

Des **cortèges adverses** menés par d'autres divinités parcourent la cité et
convertissent les mêmes mortels. Au contact, le plus gros cortège prend au plus
petit. C'est ce qui donne un enjeu à la carte (aller vite là où il y a du
monde) et un sens aux capacités d'Athéna, d'Arès et d'Hadès.

---

## L'or

**État : renommée le 2026-09-04, depuis « la drachme ».** La monnaie de la
cité — celle qu'on gagne en jouant, et celle qui achète les divinités et
leurs parures communes.

Le choix du mot n'est pas un détail d'habillage. « Pièces », « gemmes » ou
« cristaux » sont le vocabulaire de n'importe quel jeu ; l'or est le
vocabulaire de **cette** cité, au même titre que les fidèles, les mortels et
l'Acropole — le métal du trésor profane, celui qu'on amasse en vivant dans
la cité, par opposition à ce qui vient de l'Olympe (voir le laurier,
ci-dessous). Un joueur qui voit « 340 or » sait encore où il est.

**Ce qu'il achète** : **les divinités** — le gros achat, celui qui change la
façon de jouer quand les capacités existeront (M19-M27). Depuis le
2026-09-08, l'or n'achète plus de parure : toutes les parures se paient en
lauriers (voir « Les parures : quatre raretés » ci-dessous).

**Ce qu'il ne doit pas devenir** : un raccourci vers la fin du jeu. Une
partie rapporte le tiers de son cortège. À un rythme d'une conversion par
seconde, cela place la première divinité supplémentaire à quelques parties —
assez proche pour donner envie, assez loin pour rester un but.

---

## Le laurier

**État : ajoutée le 2026-09-03 sous le nom « ambroisie », renommée « laurier »
le 2026-09-04.** La cité a une seconde monnaie, plus rare que l'or — celle
des dieux, pas des mortels.

Le choix suit la même règle que celui de l'or : pas un mot de jeu générique
(« gemmes », « cristaux »), mais un mot **de cet univers-là**. La couronne de
laurier est, dans la mythologie grecque, ce qui distingue le vainqueur et
l'excellence — remise aux champions des Jeux, aux poètes inspirés d'Apollon.
Moins immortelle que l'ambroisie qui l'a précédée dans ce rôle, mais plus
juste pour ce qu'elle récompense désormais : non pas la survie des dieux,
mais ce qui se **mérite**. Le joueur qui voit « 40 lauriers » à côté de
« 340 or » comprend sans légende laquelle des deux est la précieuse : les
mortels comptent en or, les dieux en lauriers.

**Ce qu'il achète** : **toutes les parures** — depuis le 2026-09-08, plus
seulement les légendaires (voir « Les parures : quatre raretés »
ci-dessous). Les paquets de lauriers du magasin restent, eux, affichés mais
**inertes** côté paiement réel (voir plus bas) — l'activation de l'achat
intégré reste une décision de la M46 ; leurs montants et leurs prix, en
revanche, sont désormais tranchés.

---

## Les parures : quatre raretés

**État : décidé le 2026-09-08, remplace le système à deux paliers
(commune/légendaire) du 2026-09-04.**

Une parure a quatre raretés, chacune associée à une couleur de badge — le
même principe de nommage que l'or et le laurier : pas de mot de jeu
générique (« rare », « épique »), mais le vocabulaire de cet univers-là. Ici,
la hiérarchie mortel → héros → titan → olympien, déjà présente dans la
mythologie grecque, sert de règle de lecture : plus une parure est rare,
plus elle rapproche le dieu de son propre rang.

| Rareté | Couleur | Prix (lauriers) | Ce que c'est |
|---|---|---|---|
| **Mortel** | Gris | Gratuit | La parure d'origine, fournie avec le dieu |
| **Héros** | Bleu | 500 | Une recoloration — le premier achat, sur un coup de tête |
| **Titan** | Bordeaux | 800 | Une recoloration — le palier « sérieux » |
| **Olympien** | Or | 1 200 | Un modèle 3D **entièrement différent**, pas une recoloration — la pièce de prestige |

Les noms sont des noms communs invariables, pas des adjectifs accordés
(« mortelle », « héroïque ») : un choix délibéré pour qu'ils se traduisent
mot pour mot dans d'autres langues sans règle d'accord à refaire à chaque
fois (EN : Mortal/Hero/Titan/Olympian).

Toutes les parures payantes se paient en **lauriers**, y compris les
recolorations : l'or, qui les finançait jusqu'ici, n'achète plus que les
divinités (voir « L'or » ci-dessus) — ça clarifie ce que chaque monnaie
fait, et ça évite qu'une parure d'apparence commune se paie dans une monnaie
différente d'une parure d'apparence rare.

Les prix des paquets de lauriers (`LAUREL_PACKS` dans `src/meta/store.ts`)
sont calés dessus : chaque montant couvre pile une rareté, sans reliquat.
Comparatif retenu : l'échelle de prix des skins Fortnite (Rare/Epic/Legendary,
~9,50-16 €), réduite d'environ un tiers — Divine City n'a pas la base de
joueurs ni le statut social d'un battle royale, ses parures doivent rester
accessibles à un public plus casual.

Une règle tient à travers les quatre raretés : le halo et la traînée du
cortège (l'accent) restent **toujours** ceux du dieu, quelle que soit la
parure portée — même une tenue olympienne ne les redéfinit pas. C'est le
corps, pas le sillage, qui change de parure.

Le pipeline de production des modèles olympiens (génération externe, export
`.glb`, intégration dans `src/core/AssetLoader.ts`) suit celui déjà posé pour
l'apparence des dieux — voir la section suivante. Aucun n'existe encore : la
rareté olympienne n'a pas de parure en catalogue tant qu'aucun `.glb` n'est
déposé, pour ne pas référencer un `modelRef` qui pointe vers rien — même
raison que pour l'ancienne rareté légendaire.

---

## Ce qui n'est PAS décidé

- **Le style des personnages** — silhouettes stylisées ou plus détaillées.
  Contrainte technique ferme : des **milliers** de mortels affichés, donc des
  modèles très légers et un seul mesh instancié.
  > **Comment produire ces graphismes (personnages, décors) en haute
  > qualité ?** Claude Code ne fabrique pas lui-même des modèles ou textures
  > 3D détaillés à partir d'une image de référence — seulement du code et de
  > la géométrie procédurale (comme les capsules et cylindres colorés
  > actuels). La bonne combinaison : utiliser un **outil de génération
  > d'images/3D dédié** (Midjourney, Nano Banana, Meshy, etc.) pour produire
  > le concept art ou les modèles à partir de ta référence, puis les
  > intégrer et les simplifier dans le jeu — en respectant la contrainte des
  > milliers d'instances à l'écran (mesh bas-poly, texture unique ou couleurs
  > plates). C'est le sujet de la **M40**.
- **Le mode de jeu** — partie chronométrée, survie, ou objectif de conversion.
- **L'activation des achats réels** — publicité, ou pas. Le magasin affiche
  déjà des paquets d'or et de lauriers contre argent réel, avec des montants
  et des prix désormais fixés (2026-09-08, voir « Les parures : quatre
  raretés »), mais les boutons restent **inertes** : la place à l'écran est
  prise et le prix est choisi, l'achat intégré (compte marchand, identifiants
  de produit Apple/Google, vérification côté serveur) ne l'est pas (M46).
