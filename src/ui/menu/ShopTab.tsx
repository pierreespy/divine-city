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

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CHARACTER_ORDER, characterById, type CharacterId } from '../../entities/characters/roster';
import { characterPrice, ownsCharacter, ownsSkin, type Progression } from '../../meta/progression';
import { GOLD_PACKS, LAUREL_PACKS, purchasableSkins, RARITY_ADJECTIVE, type Skin } from '../../meta/store';
import { Button, Card, Coin, GodBadge, Laurel, SectionTitle } from './parts';
import { SkinCard } from './SkinCard';
import { COLORS, RADIUS, SPACE, TYPE } from './theme';

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
      <View style={styles.packRow}>
        {LAUREL_PACKS.map((pack) => (
          <View key={pack.id} style={[styles.pack, pack.featured && styles.packOn]}>
            <Laurel size={26} />
            <Text style={styles.packAmount}>{pack.laurels.toLocaleString('fr-FR')}</Text>
            <Text style={styles.packLabel}>lauriers</Text>
            <Button label={pack.price} onPress={() => undefined} disabled style={styles.packButton} />
          </View>
        ))}
      </View>

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
              // (`buySkin`) : la carte le dit, plutôt que de rester muette
              // sous le doigt.
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
                  {/* Le cadre ne porte que le dessin et le prix : le dieu et
                      la rareté sur une ligne, le nom de la parure sur la
                      suivante, sous la carte où ils tiennent en entier. */}
                  <Text style={styles.skinGod} numberOfLines={2}>
                    {`${godLabel} - Parure ${RARITY_ADJECTIVE[skin.rarity]}`}
                  </Text>
                  <Text style={styles.skinName} numberOfLines={2}>
                    {skin.label}
                  </Text>
                  {locked && (
                    <Text style={styles.skinLocked} numberOfLines={1}>
                      {`Débloque ${godLabel} pour l'acheter`}
                    </Text>
                  )}
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

  packRow: { flexDirection: 'row', gap: SPACE.sm },
  pack: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.xs,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: COLORS.frame,
    borderBottomColor: COLORS.frameDark,
    backgroundColor: COLORS.panel,
  },
  packOn: { borderColor: COLORS.borderStrong, backgroundColor: COLORS.panelRaised },
  packAmount: { ...TYPE.price, color: COLORS.text, marginTop: SPACE.xs },
  packLabel: { ...TYPE.body, fontSize: 11, color: COLORS.muted },
  packButton: { alignSelf: 'stretch', marginTop: SPACE.sm, minHeight: 36 },

  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { ...TYPE.title, fontSize: 16, color: COLORS.text },
  rowSub: { ...TYPE.body, fontSize: 12, color: COLORS.muted },
  rowButton: { minWidth: 92 },

  // La rangée glisse à l'horizontale : une carte à la fois, en plein cadre,
  // plutôt qu'une grille qui aurait tassé les cadres de rareté au point de
  // ne plus se lire.
  skinRail: { gap: SPACE.md, paddingHorizontal: SPACE.sm },
  skinSlot: { width: SKIN_CARD_WIDTH, alignItems: 'center', gap: SPACE.xs },
  skinGod: { ...TYPE.body, fontSize: 11, color: COLORS.muted, textAlign: 'center' },
  skinName: { ...TYPE.title, fontSize: 15, color: COLORS.text, textAlign: 'center' },
  skinLocked: { ...TYPE.body, fontSize: 10, color: COLORS.locked, textAlign: 'center' },

  empty: { ...TYPE.body, color: COLORS.text, textAlign: 'center', lineHeight: 20 },

  convert: { gap: SPACE.sm },
  convertText: { ...TYPE.body, fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  convertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.lg },
  convertFrom: { flexDirection: 'row', alignItems: 'center', gap: SPACE.xs },
  convertValue: { ...TYPE.price, fontSize: 14, color: COLORS.text },
  convertArrow: { fontSize: 16, color: COLORS.frameDark },

  note: { ...TYPE.body, fontSize: 12, color: COLORS.muted, textAlign: 'center', lineHeight: 17 },
});
