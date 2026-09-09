/**
 * SkinCard.tsx — la vignette d'une parure : son cadre de rareté, gravé
 * autour de son illustration.
 *
 * ⚠️ Les quatre cadres (`RARITY_FRAMES`) viennent d'un même gabarit dessiné
 * à la main : une plaque à lauriers en bas, un panneau pour l'illustration
 * au-dessus. Le cadre ne porte QUE le dessin et le prix — le nom de la
 * parure s'écrit sous la carte, avec celui du dieu.
 *
 * ⚠️ Les repères ci-dessous (`ART_BOX`, `PRICE_SPOT`) sont MESURÉS sur ce gabarit, en fractions de la carte — ils ne bougent
 * qu'ensemble avec le dessin des cadres, jamais par rareté : les quatre
 * partagent la même mise en page, seule la teinte et la bordure changent.
 *
 * ⚠️ Le prix se pose À CÔTÉ de la couronne DÉJÀ gravée dans la plaque : n'en
 * ajoute jamais une seconde à côté du nombre, le cadre en porte déjà une.
 */

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Skin } from '../../meta/store';
import { RARITY_FRAMES } from './icons';
import { COLORS, RADIUS, TYPE } from './theme';

/** Aspect (largeur / hauteur) de chaque cadre — ils ne sont pas tout à fait carrés. */
const FRAME_ASPECT: Readonly<Record<Skin['rarity'], number>> = {
  mortel: 1073 / 1466,
  heros: 1086 / 1448,
  titan: 1080 / 1457,
  olympien: 1080 / 1457,
};

/**
 * Le panneau qui reçoit l'illustration, en fractions de la carte.
 *
 * ⚠️ Il descend jusqu'à la plaque à lauriers : le nom de la parure ne
 * s'écrit plus DANS le cadre mais sous lui (voir `ShopTab`), et toute la
 * hauteur libérée revient au dessin — c'est lui qu'on achète.
 */
const ART_BOX = { left: '13%', right: '13%', top: '3.5%', bottom: '25%' } as const;

/**
 * Le prix, posé juste après la couronne déjà gravée dans la plaque.
 *
 * ⚠️ Le nombre est CALÉ À GAUCHE sur ce repère, qui tombe au bord droit de
 * la couronne : il commence donc toujours au même endroit, quel qu'en soit
 * le nombre de chiffres. Centré, « 500 » et « 1 200 » ne partaient pas du
 * même point et le prix semblait flotter sur la plaque. La zone court
 * jusqu'au rivet droit pour que « 1 200 » y tienne en entier.
 */
const PRICE_SPOT = { left: '45%', right: '25.5%', top: '82.8%', height: '8.8%' } as const;

export function SkinCard({
  skin,
  width,
  onBuy,
  disabled,
  testID,
}: {
  skin: Skin;
  width: number;
  testID?: string;
  /** Appelé quand le joueur touche le prix, sur la plaque du cadre. */
  onBuy?: () => void;
  disabled?: boolean;
}) {
  // Une hauteur EN POINTS, pas `aspectRatio` : les enfants ci-dessous sont
  // posés en `position: absolute` avec des pourcentages, qui ont besoin
  // d'une hauteur déjà connue du conteneur pour se résoudre.
  const height = width / FRAME_ASPECT[skin.rarity];

  return (
    <View style={{ width, height }}>
      <Image
        source={RARITY_FRAMES[skin.rarity]}
        resizeMode="stretch"
        // ⚠️ `StyleSheet.absoluteFill` seul (juste les quatre insets) laisse
        // react-native-web retomber sur la taille NATURELLE de l'image tant
        // que sa propre taille n'est pas posée — d'où `width`/`height` à
        // 100 % en plus des insets, sur le web comme sur mobile.
        style={[StyleSheet.absoluteFill, styles.frame]}
        accessible={false}
        importantForAccessibility="no"
      />

      {skin.preview !== undefined && (
        <View style={[styles.artBox, ART_BOX]}>
          <Image source={skin.preview} resizeMode="contain" style={styles.art} />
        </View>
      )}

      {/* La plaque à lauriers EST le bouton d'achat : toucher le prix achète
          la parure, pas seulement le bouton séparé sous la carte. */}
      <Pressable
        onPress={onBuy}
        disabled={disabled || onBuy === undefined}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Acheter la parure ${skin.label}`}
        accessibilityState={{ disabled: disabled ?? false }}
        hitSlop={6}
        style={({ pressed }) => [styles.priceSpot, PRICE_SPOT, pressed && styles.pricePressed]}
      >
        <Text style={[styles.price, disabled && styles.priceDisabled]} numberOfLines={1}>
          {skin.price.toLocaleString('fr-FR')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', height: '100%' },

  artBox: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' },
  art: { width: '100%', height: '100%' },

  // La plaque à lauriers est TOUJOURS dorée, quelle que soit la rareté du
  // corps de la carte — le prix reste donc en encre sombre sur cet or, sans
  // suivre le texte gravé clair du nom.
  priceSpot: { position: 'absolute', flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.sm },
  pricePressed: { opacity: 0.6 },
  // Taille FIXE, calée sur le plus long prix du catalogue (« 1 200 »).
  price: { ...TYPE.price, flex: 1, fontSize: 22, lineHeight: 26, textAlign: 'left', color: COLORS.onGold },
  priceDisabled: { color: COLORS.muted },
});
