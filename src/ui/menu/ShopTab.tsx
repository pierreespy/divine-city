/**
 * ShopTab.tsx — la boutique.
 *
 * Trois rayons, dans cet ordre : l'offre du jour (celle qui rapporte), les
 * paquets de lauriers, et les parures.
 *
 * ⚠️ La boutique ne vend PAS de divinité, et ce n'est pas un oubli. Une
 * divinité s'achète sur sa propre fiche, à l'Olympe (`OlympeTab`), là où le
 * joueur voit ce qu'elle sait faire avant d'y mettre son or — une ligne de
 * liste avec un nom et un prix ne le lui disait pas. Le seul chemin d'achat
 * est donc celui qui renseigne.
 *
 * ⚠️ Un rayon n'affiche jamais ce que le joueur possède déjà. Un magasin qui
 * montre des cases barrées ne donne pas envie d'acheter, il donne envie de
 * partir — et le joueur retrouve tout ce qu'il possède à l'Olympe.
 *
 * ⚠️ Tout ce qui se paie en argent réel est INERTE (M46) : un achat intégré
 * demande un compte marchand et une vérification côté serveur. Les cartes
 * sont affichées quand même, pour que la place qu'elles occupent soit
 * décidée maintenant, et le bouton dit franchement qu'il ne marche pas
 * encore plutôt que de rester muet au premier appui.
 *
 * ⚠️ Les parures ont quatre raretés (mortel, héros, titan, olympien), mais
 * une seule monnaie : le laurier. Seule la parure d'origine (mortelle) est
 * gratuite. L'or n'achète que les divinités, et elles sont à l'Olympe : rien
 * ici ne se paie en or, et aucun prix de ce fichier ne porte son icône.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { characterById } from '../../entities/characters/roster';
import { ownsCharacter, ownsSkin, type Progression } from '../../meta/progression';
import {
  GOLD_PACKS,
  LAUREL_PACKS,
  purchasableSkins,
  RARITY_ADJECTIVE,
  type LaurelPack,
  type Skin,
} from '../../meta/store';
import { ART } from './icons';
import { Button, Card, SectionTitle } from './parts';
import { SkinCard } from './SkinCard';
import { COLORS, SPACE, TYPE } from './theme';

/**
 * Le rayon des parures est une VITRINE QUI DÉFILE : une carte en plein
 * cadre, les voisines à portée de pouce de part et d'autre.
 *
 * ⚠️ Seules les parures qui ont une illustration (`preview`) y entrent —
 * une recoloration sans dessin n'afficherait qu'un cadre vide, et une carte
 * vide dans une vitrine coûte plus qu'elle ne rapporte. Les autres restent
 * visibles sur la fiche de leur dieu, à l'Olympe.
 */
function shopSkins(state: Progression): Skin[] {
  return purchasableSkins().filter((skin) => skin.preview !== undefined && !ownsSkin(state, skin.id));
}

const SKIN_CARD_WIDTH = 220;

/**
 * La grille des paquets : DEUX colonnes, donc trois rangées pour les six
 * paliers du catalogue.
 *
 * ⚠️ Deux, pas trois. Le cadre d'un paquet est COUCHÉ (`case-lauriers.png`,
 * plus large que haut) : à trois par rangée, sur un téléphone étroit, il
 * tombe sous les cent points et sa plaque d'or ne porte plus son prix. Deux
 * colonnes laissent chaque carte assez large pour être lue, et la grille
 * s'empile sous le rayon plutôt que de glisser à l'horizontale — un rayon
 * qui défile cache la moitié de ses prix, et un prix caché ne se compare pas.
 */
const PACK_COLUMNS = 2;

/**
 * La gouttière entre deux colonnes, EN POURCENTAGE de la grille.
 *
 * ⚠️ Elle est retirée de la largeur des cases, pas ajoutée autour d'elles.
 * React Native n'a pas de `calc()` : deux cases à « 50 % » PLUS une
 * gouttière font plus de 100 %, et `flexWrap` les renvoie à la ligne l'une
 * après l'autre — la grille retombe alors sur une seule colonne, sans rien
 * signaler. D'où la largeur calculée ci-dessous, et l'écart rendu par
 * `justifyContent: 'space-between'` plutôt que par un `gap` horizontal.
 */
const PACK_GUTTER = 4;
const PACK_CELL_WIDTH = `${(100 - PACK_GUTTER * (PACK_COLUMNS - 1)) / PACK_COLUMNS}%` as const;

/**
 * Le cadre d'un paquet de lauriers, et les deux repères posés dessus.
 *
 * ⚠️ Ils sont MESURÉS sur `case-lauriers.png` (512 × 469), en fractions de
 * la carte, et ne bougent qu'avec le dessin : la couronne est GRAVÉE en haut
 * à gauche, la plaque d'or occupe le bas. Le montant se pose à droite de la
 * couronne — jamais un second `Laurel` à côté de lui, le cadre en porte
 * déjà un — et le prix en euros sur la plaque.
 */
const PACK_ASPECT = 512 / 469;
/** À droite de la couronne gravée, qui s'arrête à 42,8 % de la largeur. */
const PACK_AMOUNT = { left: '45%', right: '6%', top: '30%', height: '22%' } as const;
/** La face de la plaque d'or, mesurée entre ses deux rivets. */
const PACK_PRICE = { left: '11.5%', right: '8.6%', top: '64.2%', bottom: '12.6%' } as const;

/**
 * Un paquet de lauriers : le cadre gravé, son montant et son prix.
 *
 * ⚠️ La plaque d'or EST le bouton d'achat — comme sur la carte d'une parure
 * (`SkinCard`). Un bouton de bois posé sous la carte ferait deux objets
 * pressables pour un seul achat, et le joueur toucherait le mauvais.
 *
 * ⚠️ Elle est INERTE (M46) : un achat en argent réel demande un compte
 * marchand. Le prix reste affiché — c'est lui qui décide de la place que la
 * carte occupera — mais rien ne se passe au toucher.
 */
function LaurelPackCard({ pack }: { pack: LaurelPack }) {
  return (
    // La carte prend la largeur de sa case et se donne sa hauteur par
    // `aspectRatio` : dans une grille, la largeur vient du parent et n'est
    // plus connue d'avance. Les repères posés dessus restent en pourcentages
    // — Yoga résout la hauteur pendant la mise en page, donc les enfants
    // absolus la trouvent déjà faite.
    <View style={styles.packCard}>
      <Image
        source={ART.caseLauriers}
        resizeMode="stretch"
        // `width`/`height` à 100 % EN PLUS des insets : sans elles,
        // react-native-web retombe sur la taille naturelle de l'image.
        style={[StyleSheet.absoluteFill, styles.packFrame]}
        accessible={false}
        importantForAccessibility="no"
      />
      <View style={[styles.packAmountSpot, PACK_AMOUNT]}>
        <Text style={styles.packAmount} numberOfLines={1} adjustsFontSizeToFit>
          {pack.laurels.toLocaleString('fr-FR')}
        </Text>
      </View>
      <Pressable
        onPress={() => undefined}
        disabled
        accessibilityRole="button"
        accessibilityLabel={`${pack.laurels} lauriers pour ${pack.price}`}
        accessibilityState={{ disabled: true }}
        style={[styles.packPriceSpot, PACK_PRICE]}
      >
        {/* Éteint comme le prix d'une parure hors de portée : le prix reste
            LISIBLE — c'est lui qui décide de la place de la carte — mais son
            encre dit qu'il ne se touche pas encore. */}
        <Text style={[styles.packPrice, styles.packPriceOff]} numberOfLines={1} adjustsFontSizeToFit>
          {pack.price}
        </Text>
      </Pressable>
    </View>
  );
}

interface Props {
  state: Progression;
  onBuySkin: (skinId: string) => void;
}

export function ShopTab({ state, onBuySkin }: Props) {
  // ⚠️ La vitrine montre TOUTES ses pièces, même celles d'un dieu que le
  // joueur n'a pas encore : une vitrine à une seule carte n'est plus une
  // vitrine. Seule une parure DÉJÀ possédée disparaît (règle du rayon).
  const skins = shopSkins(state);
  const featured = GOLD_PACKS.find((pack) => pack.featured) ?? GOLD_PACKS[0];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <SectionTitle>Offre du jour</SectionTitle>
      <Card style={styles.offer} selected>
        <View style={styles.offerBody}>
          <Text style={styles.offerIcon}>⚡</Text>
          <View style={styles.offerText}>
            <Text style={styles.offerName}>PACK STARTER OLYMPIEN</Text>
            <Text style={styles.offerDetail}>
              {featured.gold.toLocaleString('fr-FR')} or, une parure au choix et un
              coffre rare.
            </Text>
          </View>
        </View>
        <Button label={featured.price} onPress={() => undefined} disabled variant="primary" />
      </Card>

      <SectionTitle>Acheter des lauriers</SectionTitle>
      {/* ⚠️ TROIS paquets, pas les cinq du catalogue : la rangée les pose
          côte à côte, et au-delà de trois une case n'est plus assez large
          pour porter son montant. Les paliers intermédiaires restent dans
          `LAUREL_PACKS` — ils serviront à une page de paquets à part. */}
      {/* Les SIX paliers du catalogue, du plus petit au plus gros, dans
          l'ordre où `LAUREL_PACKS` les écrit : une échelle se lit de bas en
          haut, et la trier autrement ferait mentir la comparaison des prix. */}
      <View style={styles.packGrid}>
        {LAUREL_PACKS.map((pack) => (
          <View key={pack.id} style={styles.packCell}>
            <LaurelPackCard pack={pack} />
          </View>
        ))}
      </View>

      {skins.length > 0 && (
        <>
          <SectionTitle>Parures</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SKIN_CARD_WIDTH + SPACE.md}
            decelerationRate="fast"
            contentContainerStyle={styles.skinRail}
            nestedScrollEnabled
          >
            {skins.map((skin) => {
              // Une parure ne s'achète que si son dieu est déjà au panthéon
              // (`buySkin`) : sa plaque reste alors inerte, sans l'annoncer
              // en toutes lettres sous la carte.
              const locked = !ownsCharacter(state, skin.characterId);
              const godLabel = characterById(skin.characterId).label;
              return (
                <View key={skin.id} style={styles.skinSlot}>
                  <SkinCard
                    testID={`buy-${skin.id}`}
                    skin={skin}
                    width={SKIN_CARD_WIDTH}
                    onBuy={() => onBuySkin(skin.id)}
                    disabled={locked || state.laurels < skin.price}
                  />
                  {/* Le cadre ne porte que le dessin et le prix. Sous la
                      carte, une ligne par information — le dieu, puis la
                      rareté, puis le nom — et aucun `numberOfLines` : un nom
                      trop long passe à la ligne plutôt que de se couper en
                      points de suspension, qui ne diraient plus ce qu'on
                      achète. */}
                  <Text style={styles.skinGod}>{godLabel}</Text>
                  <Text style={styles.skinGod}>
                    {`Parure ${RARITY_ADJECTIVE[skin.rarity]}`}
                  </Text>
                  <Text style={styles.skinName}>
                    {skin.label}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {skins.length === 0 && (
        <Text style={styles.empty}>
          Toutes les parures sont à toi. Il ne reste qu'à courir.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingVertical: SPACE.sm, paddingBottom: SPACE.xl, gap: SPACE.sm },

  offer: { gap: SPACE.md },
  offerBody: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  offerIcon: { fontSize: 34 },
  offerText: { flex: 1, minWidth: 0 },
  offerName: { ...TYPE.label, fontSize: 11, color: COLORS.text },
  offerDetail: { ...TYPE.body, fontSize: 12, color: COLORS.muted, marginTop: 2, lineHeight: 17 },

  // ⚠️ Les cases sont posées à la LARGEUR, pas en `flex: 1` : une dernière
  // rangée incomplète étirerait sa seule carte sur toute la ligne, et la
  // grille perdrait son alignement. `flexWrap` fait les rangées tout seul,
  // et `space-between` l'écart entre colonnes (voir `PACK_GUTTER`) ; seul
  // l'écart des rangées est un vrai `rowGap`, en points.
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACE.sm,
  },
  packCell: { width: PACK_CELL_WIDTH },
  packCard: { width: '100%', aspectRatio: PACK_ASPECT },
  packFrame: { width: '100%', height: '100%' },
  // Le montant est CALÉ À GAUCHE, au bord droit de la couronne gravée : il
  // part donc du même point qu'il ait trois chiffres ou quatre. Centré,
  // « 100 » et « 2 500 » flottaient chacun à leur façon.
  packAmountSpot: { position: 'absolute', justifyContent: 'center' },
  packAmount: { ...TYPE.price, fontSize: 22, lineHeight: 26, color: COLORS.text },
  // Le prix, lui, est CENTRÉ : la plaque est un objet symétrique, entre deux
  // rivets, et un prix rangé à gauche y laisserait un vide à droite.
  packPriceSpot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  // Encre sombre sur l'or de la plaque, jamais le texte gravé clair.
  packPrice: { ...TYPE.price, fontSize: 18, lineHeight: 22, color: COLORS.onGold },
  packPriceOff: { color: COLORS.muted },


  // La rangée glisse à l'horizontale : une carte à la fois, en plein cadre,
  // plutôt qu'une grille qui aurait tassé les cadres de rareté au point de
  // ne plus se lire.
  skinRail: { gap: SPACE.md, paddingHorizontal: SPACE.sm },
  // Les lignes de légende se suivent SANS écart : elles forment un bloc,
  // pas trois textes posés côte à côte. L'écart les sépare de la carte.
  skinSlot: { width: SKIN_CARD_WIDTH, alignItems: 'center', paddingTop: SPACE.xs },
  // ⚠️ Le Cinzel est une capitale gravée : à taille égale il tient bien
  // moins de signes qu'une lettre de labeur. « Parure Olympienne » règle
  // ces tailles — c'est la plus longue ligne de légende du catalogue.
  // ⚠️ `alignSelf: 'stretch'` n'est pas décoratif. La colonne centre ses
  // enfants (`alignItems: 'center'`), donc un texte y est mesuré sur son
  // contenu, pas sur la largeur de la carte : au-delà, il déborde et se
  // fait rogner au bord droit au lieu de passer à la ligne. Étiré sur la
  // colonne, il connaît sa largeur et se replie tout seul.
  skinGod: {
    ...TYPE.body,
    alignSelf: 'stretch',
    fontSize: 10,
    lineHeight: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  skinName: {
    ...TYPE.title,
    alignSelf: 'stretch',
    fontSize: 14,
    lineHeight: 17,
    color: COLORS.text,
    textAlign: 'center',
  },

  empty: { ...TYPE.body, color: COLORS.text, textAlign: 'center', lineHeight: 20 },

});
