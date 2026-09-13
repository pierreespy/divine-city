/**
 * ShopTab.tsx — la boutique.
 *
 * Quatre rayons, dans cet ordre : l'offre du jour (celle qui rapporte), les
 * lauriers, les divinités et leurs parures, et enfin la conversion de
 * l'or en lauriers — la seule opération que le joueur peut réellement
 * faire aujourd'hui.
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
 * gratuite. L'or, lui, n'achète plus que les divinités — le prix d'une
 * parure porte donc toujours l'icône du laurier, jamais celle de l'or.
 */

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CHARACTER_ORDER, characterById, type CharacterId } from '../../entities/characters/roster';
import { characterPrice, ownsCharacter, ownsSkin, type Progression } from '../../meta/progression';
import {
  GOLD_PACKS,
  LAUREL_PACKS,
  purchasableSkins,
  RARITY_ADJECTIVE,
  type LaurelPack,
  type Skin,
} from '../../meta/store';
import { ART } from './icons';
import { Button, Card, Coin, GodBadge, Laurel, SectionTitle } from './parts';
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
/** Une carte et demie dans le cadre : le paquet d'appel, et qu'il y en a d'autres. */
const PACK_CARD_WIDTH = 158;

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
function LaurelPackCard({ pack, width }: { pack: LaurelPack; width: number }) {
  // Une hauteur EN POINTS, pas `aspectRatio` : les repères ci-dessus sont
  // posés en pourcentages, qui ont besoin d'une hauteur déjà connue.
  const height = width / PACK_ASPECT;
  return (
    <View style={{ width, height }}>
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

/** Les trois paliers montrés en rayon : l'appel, le courant, le mis en avant. */
const SHOP_LAUREL_PACK_IDS = ['petit', 'moyen', 'genereux'] as const;

function shopLaurelPacks(): LaurelPack[] {
  return SHOP_LAUREL_PACK_IDS.map((id) => LAUREL_PACKS.find((pack) => pack.id === id)).filter(
    (pack): pack is LaurelPack => pack !== undefined,
  );
}

interface Props {
  state: Progression;
  onBuyCharacter: (characterId: CharacterId) => void;
  onBuySkin: (skinId: string) => void;
}

export function ShopTab({ state, onBuyCharacter, onBuySkin }: Props) {
  const characters = CHARACTER_ORDER.filter((id) => !ownsCharacter(state, id));
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
      {/* La rangée glisse à l'horizontale : les cadres gravés ne se laissent
          pas tasser à un tiers d'écran sans que leur couronne et leur plaque
          deviennent illisibles. Une carte et demie tient dans le cadre, ce
          qui montre à la fois le paquet d'appel et qu'il y en a d'autres. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={PACK_CARD_WIDTH + SPACE.md}
        decelerationRate="fast"
        contentContainerStyle={styles.packRail}
        nestedScrollEnabled
      >
        {shopLaurelPacks().map((pack) => (
          <LaurelPackCard key={pack.id} pack={pack} width={PACK_CARD_WIDTH} />
        ))}
      </ScrollView>

      {characters.length > 0 && (
        <>
          <SectionTitle>Divinités</SectionTitle>
          {characters.map((id) => {
            const character = characterById(id);
            const price = characterPrice(id);
            return (
              <Card key={id} style={styles.row}>
                <GodBadge color={character.appearance.color} accent={character.appearance.accent} size={44} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {character.label}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {character.domain}
                  </Text>
                </View>
                <Button
                  testID={`buy-${id}`}
                  label={price.toLocaleString('fr-FR')}
                  variant="primary"
                  disabled={state.gold < price}
                  onPress={() => onBuyCharacter(id)}
                  hint={`Acheter ${character.label} pour ${price} or`}
                  style={styles.rowButton}
                />
              </Card>
            );
          })}
        </>
      )}

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

      {characters.length === 0 && skins.length === 0 && (
        <Text style={styles.empty}>
          Tout le panthéon est à toi, et toutes ses parures. Il ne reste qu'à courir.
        </Text>
      )}

      <SectionTitle>Conversion</SectionTitle>
      <Card style={styles.convert}>
        <Text style={styles.convertText}>
          Changer de l'or contre des lauriers ouvrira avec les achats.
        </Text>
        <View style={styles.convertRow}>
          <View style={styles.convertFrom}>
            <Coin size={16} />
            <Text style={styles.convertValue}>1 000</Text>
          </View>
          <Text style={styles.convertArrow}>➜</Text>
          <View style={styles.convertFrom}>
            <Laurel size={16} />
            <Text style={styles.convertValue}>50</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.note}>
        L'or se gagne en jouant : un pour trois fidèles convertis.
      </Text>
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

  packRail: { gap: SPACE.md, paddingHorizontal: SPACE.sm },
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

  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { ...TYPE.title, fontSize: 16, color: COLORS.text },
  rowSub: { ...TYPE.body, fontSize: 12, color: COLORS.muted },
  rowButton: { minWidth: 92 },

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

  convert: { gap: SPACE.sm },
  convertText: { ...TYPE.body, fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  convertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.lg },
  convertFrom: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs },
  convertValue: { ...TYPE.price, fontSize: 14, color: COLORS.text },
  convertArrow: { fontSize: 16, color: COLORS.frameDark },

  note: { ...TYPE.body, fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 17 },
});
