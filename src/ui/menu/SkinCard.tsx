/**
 * SkinCard.tsx — la vignette d'une parure : son cadre de rareté, gravé
 * autour de son illustration.
 *
 * ⚠️ Les quatre cadres (`RARITY_FRAMES`) viennent d'un même gabarit dessiné
 * à la main : une plaque à lauriers en bas, un panneau pour l'illustration
 * au-dessus. Les repères ci-dessous (`ART_BOX`, `NAME_BAND`, `PRICE_SPOT`)
 * sont MESURÉS sur ce gabarit, en fractions de la carte — ils ne bougent
 * qu'ensemble avec le dessin des cadres, jamais par rareté : les quatre
 * partagent la même mise en page, seule la teinte et la bordure changent.
 *
 * ⚠️ Le prix se pose À CÔTÉ de la couronne DÉJÀ gravée dans la plaque : n'en
 * ajoute jamais une seconde à côté du nombre, le cadre en porte déjà une.
 */

import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Skin } from '../../meta/store';
import { RARITY_FRAMES } from './icons';
import { COLORS, FONTS, RADIUS } from './theme';

/** Un texte gravé, clair et cerclé de sombre : lisible sur les quatre fonds de cadre, de l'or clair au bordeaux. */
const engraved = {
  color: '#fbf1dc',
  textShadowColor: 'rgba(30, 15, 5, 0.75)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
} as const;

/** Aspect (largeur / hauteur) de chaque cadre — ils ne sont pas tout à fait carrés. */
const FRAME_ASPECT: Readonly<Record<Skin['rarity'], number>> = {
  mortel: 1073 / 1466,
  heros: 1086 / 1448,
  titan: 1080 / 1457,
  olympien: 1080 / 1457,
};

/** Le panneau qui reçoit l'illustration, en fractions de la carte. */
const ART_BOX = { left: '14.4%', right: '14.7%', top: '3%', bottom: '38%' } as const;

/** La bande du nom, entre le bas de l'illustration et la plaque à lauriers. */
const NAME_BAND = { left: '10%', right: '10%', top: '63.5%', height: '13%' } as const;

/**
 * Le prix, posé juste après la couronne déjà gravée dans la plaque.
 *
 * ⚠️ La zone tient jusqu'au rivet droit de la plaque : à 43 % de marge
 * gauche, « 1 200 » ne rentrait plus et se tronquait en « 12… ».
 */
const PRICE_SPOT = { left: '38%', right: '7%', top: '78.5%', height: '17%' } as const;

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

      <View style={[styles.nameBand, NAME_BAND]}>
        <Text style={styles.name} numberOfLines={2} adjustsFontSizeToFit>
          {skin.label}
        </Text>
      </View>

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
        <Text
          style={[styles.price, disabled && styles.priceDisabled]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
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

  nameBand: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  name: {
    fontFamily: FONTS.titleBold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.3,
    textAlign: 'center',
    ...engraved,
  },

  // La plaque à lauriers est TOUJOURS dorée, quelle que soit la rareté du
  // corps de la carte — le prix reste donc en encre sombre sur cet or, sans
  // suivre le texte gravé clair du nom.
  priceSpot: { position: 'absolute', flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.sm },
  pricePressed: { opacity: 0.6 },
  price: { fontFamily: FONTS.titleBold, flex: 1, fontSize: 24, textAlign: 'center', color: COLORS.onGold },
  priceDisabled: { color: COLORS.muted },
});
