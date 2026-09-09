/**
 * store.ts — le catalogue du magasin : prix, parures, paquets d'or et de
 * lauriers.
 *
 * ⚠️ Pourquoi ce fichier n'est PAS dans `entities/characters/roster.ts`.
 *
 * Le roster décrit ce qu'un dieu **est** : sa couleur, sa capacité, ses
 * réglages. Ce qu'il **coûte** n'est pas de la même nature — c'est une
 * décision d'économie, qui se change en soldes un mardi soir sans que le jeu
 * bouge d'un pixel. Les mélanger obligerait à toucher au panthéon pour régler
 * un prix, et le contrat de la M12 (« un dieu = une ligne de données ») se
 * dissoudrait dans des considérations de boutique.
 *
 * Même principe que partout ailleurs : une parure = une ligne. Ajouter une
 * parure ne doit toucher ni le jeu, ni l'écran du magasin.
 */

import { CHARACTER_ORDER, CHARACTERS, type CharacterId } from '../entities/characters/roster';

/**
 * Les illustrations déposées dans `assets/skins/` (voir son README) — du
 * concept art, pas encore le modèle 3D joué en jeu. `require()` doit rester
 * statique ici pour que Metro les bundle.
 */
const POSEIDON_ROI_DES_ABYSSES = require('../../assets/skins/titanesque/poseidon_roi_des_abysses.png');
const ZEUS_FOUDRE_IMPERIALE = require('../../assets/skins/olympienne/zeus_foudre_imperiale.png');
const ARES_RAGE_DU_LION = require('../../assets/skins/olympienne/ares_rage_du_lion.png');
const ATHENA_SAGESSE_CELESTE = require('../../assets/skins/olympienne/athena_sagesse_celeste.png');
const HERMES_MESSAGER_D_OR = require('../../assets/skins/olympienne/hermes_messager_d_or.png');

/**
 * Une parure a quatre raretés, décidées le 2026-09-08 (remplace l'ancien
 * système à deux paliers commune/légendaire) :
 *
 * - **mortel** (gris) — la parure d'origine, fournie avec le dieu.
 * - **héros** (bleu) — un achat d'impulsion.
 * - **titan** (bordeaux) — un palier « sérieux ».
 * - **olympien** (or) — la pièce de prestige : un modèle 3D à part, pas une
 *   simple recoloration.
 *
 * Les noms sont volontairement des noms communs invariables (pas des
 * adjectifs accordés comme « mortelle »/« héroïque ») : ce sont des badges
 * de rareté, affichés seuls, qui doivent se traduire mot pour mot dans
 * d'autres langues sans règle d'accord à refaire à chaque fois — cf. l'anglais
 * Mortal/Hero/Titan/Olympian, l'espagnol Mortal/Héroe/Titán/Olímpico.
 *
 * Toutes les parures payantes se paient désormais en lauriers, y compris
 * celles qui ne sont qu'une recoloration : l'or ne finance plus que les
 * divinités (voir `CHARACTER_PRICES`), pour que la distinction entre les
 * deux monnaies reste nette — l'or est ce qu'on gagne en jouant, le laurier
 * ce qu'on achète ou qu'on mérite.
 *
 * L'union discriminée par `rarity` (plutôt qu'un type unique à champs
 * optionnels) empêche STRUCTURELLEMENT une parure olympienne de porter son
 * propre `accent` : le halo du cortège reste toujours celui du dieu
 * (`CharacterAppearance.accent`, dans le roster), quelle que soit la tenue
 * portée — ce n'est pas une convention à respecter, le type ne laisse pas le
 * champ exister sur `LegendarySkin`.
 */
export type SkinRarity = 'mortel' | 'heros' | 'titan' | 'olympien';

/** Le nom affiché de chaque rareté — un badge, pas une phrase. */
export const RARITY_LABEL: Readonly<Record<SkinRarity, string>> = {
  mortel: 'Mortel',
  heros: 'Héros',
  titan: 'Titan',
  olympien: 'Olympien',
};

/**
 * La rareté telle qu'elle se lit dans une phrase, accordée avec « parure » :
 * « Zeus - Parure Olympienne ».
 *
 * ⚠️ Distinct de `RARITY_LABEL` à dessein. Celui-ci est un BADGE, affiché
 * seul et invariable (voir plus haut) ; celui-là est un ADJECTIF, accordé au
 * féminin de « parure ». Une autre langue peut n'avoir besoin que du
 * premier — l'accord, lui, ne se refait pas d'une table à l'autre.
 */
export const RARITY_ADJECTIVE: Readonly<Record<SkinRarity, string>> = {
  mortel: 'Mortelle',
  heros: 'Héroïque',
  titan: 'Titanesque',
  olympien: 'Olympienne',
};

/** La teinte de badge de chaque rareté — gris, bleu, bordeaux, or. */
export const RARITY_COLOR: Readonly<Record<SkinRarity, number>> = {
  mortel: 0x8b8378,
  heros: 0x2c5fa8,
  titan: 0x7a1f3d,
  olympien: 0xeec24a,
};

interface SkinBase {
  readonly id: string;
  readonly characterId: CharacterId;
  /** Le nom affiché — court, il tient sur une vignette. */
  readonly label: string;
  /**
   * L'illustration de la parure (concept art), résolue par le `require()`
   * statique de son appelant — Metro doit voir le chemin littéral.
   *
   * Optionnel : seules les parures dont l'illustration a été produite en ont
   * une (voir `assets/skins/README.md`) ; les autres retombent sur le rond
   * de couleur. Ce n'est PAS le modèle 3D joué en jeu — pour une olympienne,
   * c'est un aperçu en attendant que `LegendarySkin.modelRef` pointe vers un
   * vrai `.glb`.
   */
  readonly preview?: number;
}

/**
 * Le corps recoloré du dieu — le halo du cortège reste celui du roster.
 * Couvre les raretés mortel, héros et titan : seule la rareté olympienne
 * change de modèle plutôt que de couleur.
 */
export interface RecoloredSkin extends SkinBase {
  readonly rarity: 'mortel' | 'heros' | 'titan';
  /** Le corps du dieu. */
  readonly color: number;
  /** Le halo et la teinte du cortège. */
  readonly accent: number;
  /** En lauriers. 0 = fournie avec le dieu (toujours la rareté mortelle). */
  readonly price: number;
}

/** Une tenue entièrement différente — un modèle 3D à part, pas une teinte. */
export interface LegendarySkin extends SkinBase {
  readonly rarity: 'olympien';
  /**
   * Clé destinée à une table `require()` statique d'`AssetLoader.ts`, une
   * fois qu'un `.glb` existe pour cette tenue — un chemin construit
   * dynamiquement ne serait pas vu par Metro au bundling.
   *
   * ⚠️ Aucun `.glb` n'existe encore pour aucune parure olympienne : le jeu
   * (`Player.ts`) ne sait de toute façon pas encore charger de modèle 3D
   * (voir `appearanceOf()` dans `progression.ts`). `modelRef` reste donc un
   * identifiant en attente — c'est `preview` (l'illustration 2D) qui
   * représente la parure partout où elle est affichée aujourd'hui.
   */
  readonly modelRef: string;
  /** En lauriers. */
  readonly price: number;
}

export type Skin = RecoloredSkin | LegendarySkin;

/**
 * L'identifiant de la parure d'origine d'un dieu.
 *
 * Elle n'est pas écrite dans le catalogue : elle EST le dieu, et ses couleurs
 * vivent déjà dans le roster. La dériver évite de les recopier — donc de les
 * voir diverger le jour où l'on retouchera une teinte.
 */
export function defaultSkinId(characterId: CharacterId): string {
  return `${characterId}-origine`;
}

/** La parure d'origine, fabriquée à partir de la ligne du dieu. Toujours mortelle. */
function originSkin(characterId: CharacterId): RecoloredSkin {
  const character = CHARACTERS[characterId];
  return {
    id: defaultSkinId(characterId),
    characterId,
    rarity: 'mortel',
    label: 'Origine',
    color: character.appearance.color,
    accent: character.appearance.accent,
    price: 0,
  };
}

/**
 * Les parures achetables.
 *
 * ⚠️ Les couleurs suivent la règle posée en M11 et rappelée par le roster :
 * la caméra plonge sur un sol clair (marbre, terre battue), donc une parure
 * pâle rendrait le dieu invisible dans sa propre cité. Toutes sont saturées
 * et plus sombres que la dalle la plus claire ; c'est l'accent, plus clair,
 * qui porte la couleur du cortège.
 *
 * La plupart ci-dessous sont de rareté héros (500 lauriers) : le premier
 * palier payant, celui qu'on achète sur un coup de tête.
 *
 * Les paliers supérieurs suivent le tarif posé par `LAUREL_PACKS` (titan à
 * 800, olympien à 1 200) dès qu'une illustration existe pour les porter
 * (`assets/skins/titanesque/` et `assets/skins/olympienne/`, voir leur
 * README) :
 *
 * - Le titan de Poséidon reste une recoloration (`RecoloredSkin`) — sa
 *   couleur/accent sont repris de son illustration (bleu-turquoise royal,
 *   liséré or), l'illustration elle-même n'étant qu'un `preview`.
 * - Les olympiennes (`LegendarySkin`) n'ont toujours pas de `.glb` — voir
 *   l'avertissement sur `LegendarySkin.modelRef` — mais leur `preview`
 *   suffit à les distinguer dans la boutique et sur la fiche d'un dieu.
 *   `modelRef` porte pour l'instant le nom de fichier de l'illustration,
 *   en attendant le modèle 3D qui portera la même clé.
 */
const PURCHASABLE: readonly Skin[] = [
  { id: 'hermes-nuit', characterId: 'hermes', rarity: 'heros', label: 'Nuit', color: 0x1e3a8a, accent: 0x93c5fd, price: 500 },
  { id: 'hermes-olive', characterId: 'hermes', rarity: 'heros', label: 'Olivier', color: 0x3f6212, accent: 0xbef264, price: 500 },
  { id: 'zeus-orage', characterId: 'zeus', rarity: 'heros', label: 'Orage', color: 0x3f3f46, accent: 0xfef08a, price: 500 },
  { id: 'aphrodite-aurore', characterId: 'aphrodite', rarity: 'heros', label: 'Aurore', color: 0x9d174d, accent: 0xfecdd3, price: 500 },
  { id: 'poseidon-abysse', characterId: 'poseidon', rarity: 'heros', label: 'Abysse', color: 0x134e4a, accent: 0x5eead4, price: 500 },
  { id: 'athena-bronze', characterId: 'athena', rarity: 'heros', label: 'Bronze', color: 0x78350f, accent: 0xfcd34d, price: 500 },
  { id: 'hades-braise', characterId: 'hades', rarity: 'heros', label: 'Braise', color: 0x431407, accent: 0xfb923c, price: 500 },
  { id: 'ares-fer', characterId: 'ares', rarity: 'heros', label: 'Fer', color: 0x44403c, accent: 0xe7e5e4, price: 500 },

  {
    id: 'poseidon-roi-des-abysses',
    characterId: 'poseidon',
    rarity: 'titan',
    label: 'Roi des Abysses',
    color: 0x0e4c5c,
    accent: 0xe0b34a,
    price: 800,
    preview: POSEIDON_ROI_DES_ABYSSES,
  },

  {
    id: 'zeus-foudre-imperiale',
    characterId: 'zeus',
    rarity: 'olympien',
    label: 'Foudre Impériale',
    modelRef: 'zeus_foudre_imperiale',
    price: 1200,
    preview: ZEUS_FOUDRE_IMPERIALE,
  },
  {
    id: 'ares-rage-du-lion',
    characterId: 'ares',
    rarity: 'olympien',
    label: 'Rage du Lion',
    modelRef: 'ares_rage_du_lion',
    price: 1200,
    preview: ARES_RAGE_DU_LION,
  },
  {
    id: 'athena-sagesse-celeste',
    characterId: 'athena',
    rarity: 'olympien',
    label: 'Sagesse Céleste',
    modelRef: 'athena_sagesse_celeste',
    price: 1200,
    preview: ATHENA_SAGESSE_CELESTE,
  },
  {
    id: 'hermes-messager-d-or',
    characterId: 'hermes',
    rarity: 'olympien',
    label: 'Messager d\'Or',
    modelRef: 'hermes_messager_d_or',
    price: 1200,
    preview: HERMES_MESSAGER_D_OR,
  },
];

/** Toutes les parures d'un dieu, l'origine en tête. */
export function skinsOf(characterId: CharacterId): Skin[] {
  return [originSkin(characterId), ...PURCHASABLE.filter((skin) => skin.characterId === characterId)];
}

/** La parure portant cet identifiant, ou `null` si personne ne la connaît. */
export function skinById(id: string): Skin | null {
  for (const characterId of CHARACTER_ORDER) {
    const found = skinsOf(characterId).find((skin) => skin.id === id);
    if (found !== undefined) return found;
  }
  return null;
}

/** Toutes les parures achetables, dans l'ordre d'affichage des dieux. */
export function purchasableSkins(): Skin[] {
  return CHARACTER_ORDER.flatMap((characterId) => PURCHASABLE.filter((skin) => skin.characterId === characterId));
}

/**
 * Le prix d'un dieu, en or.
 *
 * Les deux dieux fournis d'emblée (`unlockedFromStart`) n'y figurent pas :
 * on ne vend pas ce que le joueur possède déjà.
 */
export const CHARACTER_PRICES: Readonly<Record<CharacterId, number>> = {
  hermes: 0,
  zeus: 0,
  aphrodite: 400,
  poseidon: 400,
  athena: 600,
  hades: 600,
  ares: 800,
};

/**
 * Les paquets d'or contre argent réel.
 *
 * ⚠️ Ils sont AFFICHÉS mais INERTES, et c'est délibéré. Un achat intégré
 * demande un compte marchand, des identifiants de produit déclarés chez Apple
 * et Google, et une vérification côté serveur : c'est la M46 (monétisation),
 * pas une case à cocher. Les poser maintenant sert à voir la place qu'ils
 * prennent à l'écran — celle-là ne se découvre pas après coup.
 */
export interface GoldPack {
  readonly id: string;
  readonly gold: number;
  /** Le prix affiché, tel quel. Aucune conversion, aucune promesse. */
  readonly price: string;
  /** Mis en avant sur la rangée. Un seul, sinon plus rien ne ressort. */
  readonly featured: boolean;
}

export const GOLD_PACKS: readonly GoldPack[] = [
  { id: 'bourse', gold: 500, price: '1,99 €', featured: false },
  { id: 'coffre', gold: 1500, price: '4,99 €', featured: true },
  { id: 'tresor', gold: 4000, price: '9,99 €', featured: false },
];

/**
 * Les paquets de lauriers contre argent réel.
 *
 * **État : tarifé le 2026-09-08**, calé sur les paliers de rareté des
 * parures ci-dessus : chaque montant couvre pile une rareté (héros à 500,
 * titan à 800, olympien à 1 200), pour qu'un joueur qui vise une parure
 * précise achète le pack qui la couvre sans reliquat gênant. Comparatif
 * retenu : l'échelle de prix des skins Fortnite (Rare/Epic/Legendary,
 * ~9,50-16 €), réduite d'environ un tiers — Divine City n'a pas la base de
 * joueurs ni le statut social d'un battle royale, ses parures doivent rester
 * accessibles à un public plus casual.
 *
 * Même principe que `GoldPack`, gardé comme un type à part plutôt que
 * généralisé : le laurier est une monnaie plus rare que l'or (moins
 * d'unités, prix plus élevé), pas la même chose sous un autre nom — un
 * champ `gold` partagé pour les deux aurait été trompeur à relire.
 *
 * ⚠️ INERTS, comme `GOLD_PACKS` : même raison (M46), voir plus haut.
 */
export interface LaurelPack {
  readonly id: string;
  readonly laurels: number;
  readonly price: string;
  readonly featured: boolean;
}

export const LAUREL_PACKS: readonly LaurelPack[] = [
  { id: 'petit', laurels: 100, price: '0,99 €', featured: false },
  { id: 'moyen', laurels: 550, price: '4,99 €', featured: false },
  { id: 'grand', laurels: 850, price: '7,99 €', featured: false },
  { id: 'genereux', laurels: 1250, price: '11,99 €', featured: true },
  { id: 'ultime', laurels: 3000, price: '24,99 €', featured: false },
];
