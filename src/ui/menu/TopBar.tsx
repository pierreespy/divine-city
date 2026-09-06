/**
 * TopBar.tsx — le bandeau qui ne quitte JAMAIS l'écran.
 *
 * Il porte quatre choses, et rien d'autre : qui l'on est (le portrait, son
 * nom et son niveau), ce que l'on possède (les deux monnaies), et l'accès aux
 * réglages.
 *
 * ⚠️ Il est posé HORS du ruban d'onglets, au-dessus de lui. Le décor glisse
 * sous le doigt, les cartes changent, mais la bourse reste à la même place :
 * c'est ce qui permet d'appuyer sur « + » sans se demander sur quel onglet on
 * se trouve.
 *
 * ⚠️ Le bandeau est DESSINÉ, pas composé (`assets/ui/bandeau2.png`) : l'anneau
 * du portrait, la languette du nom, les deux bourses avec leur jeton et leur
 * bouton « + », et la plaque du niveau sont tous dans l'image. L'écran ne pose
 * QUE ce que le dessin ne peut pas savoir — le nom du dieu choisi, les deux
 * montants, le rang, le portrait — plus les zones cliquables par-dessus les
 * deux « + ».
 *
 * ⚠️ Toutes les positions ci-dessous sont donc des FRACTIONS DE LA LARGEUR de
 * l'écran, mesurées sur le dessin, et non des points. Le bandeau est étiré
 * d'un bord à l'autre en gardant ses proportions : ce qui est vrai à 390
 * points de large l'est à 768. Elles cessent de l'être dès que le dessin
 * change, et il faut alors les re-mesurer, sinon les montants sortent de leur
 * bourse.
 */

import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { godById } from '../../entities/gods/roster';
import { flatColorOf, type Progression } from '../../meta/progression';
import { rankOf } from '../../meta/rank';
import { GodBadge } from './parts';
import { ART, PORTRAITS } from './icons';
import { COLORS, RADIUS, SPACE, TEXT_SHADOW, TYPE } from './theme';

/**
 * Les proportions du dessin (2170 × 725 pixels), en fractions de sa LARGEUR.
 *
 * `art`  la hauteur de l'image entière ;
 * `bar`  celle de la barre de pierre OPAQUE — le reste du dessin, sous elle,
 *        n'est que le médaillon du portrait et sa plaque, sur fond
 *        transparent. C'est `bar` qui donne sa hauteur au bandeau : le décor
 *        commence juste dessous, et le médaillon lui passe par-dessus.
 */
const ART_HEIGHT = 725 / 2170;
const BAR_HEIGHT = 306 / 2170;

/**
 * Ce que l'écran pose sur le dessin, en fractions de la largeur de l'écran.
 * Mesuré sur `bandeau2.png`, boîte par boîte — voir l'avertissement du
 * haut de fichier.
 */
const SLOTS = {
  /** La languette gravée du nom du dieu. */
  name: { left: 161 / 768, top: 29 / 768, width: 160 / 768, height: 56 / 768 },
  /** Le champ sombre de la bourse d'or, entre son jeton et son « + ». */
  gold: { left: 412 / 768, top: 20 / 768, width: 97 / 768, height: 59 / 768 },
  /** Le même, pour les lauriers. */
  laurels: { left: 624 / 768, top: 24 / 768, width: 96 / 768, height: 56 / 768 },
  /** Les deux boutons « + », DESSINÉS : on ne pose que la zone cliquable. */
  addGold: { left: 516 / 768, top: 38 / 768, width: 28 / 768, height: 27 / 768 },
  addLaurels: { left: 726 / 768, top: 39 / 768, width: 27 / 768, height: 25 / 768 },
  /** La plaque du niveau, sous le médaillon — elle déborde sur le décor. */
  level: { left: 38 / 768, top: 117 / 768, width: 92 / 768, height: 33 / 768 },
} as const;

/**
 * Le portrait, DANS l'anneau déjà dessiné : le centre de l'anneau, et le
 * diamètre de son intérieur.
 *
 * ⚠️ C'est l'INTÉRIEUR qu'on mesure, pas l'anneau : un portrait au diamètre
 * de l'anneau recouvrirait le cerclage de bois qui fait tout le médaillon.
 */
const PORTRAIT = { x: 0.1076, y: 0.0839, size: 0.12 };

/** Les tailles de texte du bandeau, elles aussi en fractions de la largeur. */
const TEXT = { name: 25 / 768, purse: 24 / 768, level: 16 / 768 };

/** La place du bouton des réglages, que le dessin ne prévoit pas. */
const GEAR = 34;

export function TopBar({
  state,
  onOpenSettings,
  onOpenShop,
}: {
  state: Progression;
  onOpenSettings: () => void;
  onOpenShop: () => void;
}) {
  const god = godById(state.selectedGod);
  const appearance = flatColorOf(state);
  const rank = rankOf(state.bestScore);
  const portrait = PORTRAITS[state.selectedGod];

  const { width } = useWindowDimensions();
  const w = Math.max(1, Math.round(width));
  const barHeight = w * BAR_HEIGHT;

  // La barre d'état ne reçoit PAS le dessin : elle reçoit le bois du bandeau,
  // qui la prolonge. Étirer la pierre sous l'encoche déformerait le fronton
  // du dessin, et la couper laisserait une bande claire au-dessus.
  const insets = useSafeAreaInsets();

  /** Une boîte du dessin, ramenée en points. */
  const box = (slot: { left: number; top: number; width: number; height: number }) => ({
    position: 'absolute' as const,
    left: slot.left * w,
    top: slot.top * w,
    width: slot.width * w,
    height: slot.height * w,
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ⚠️ La hauteur de cette boîte est celle de la BARRE, pas celle du
          dessin : le médaillon et la plaque du niveau en débordent par le
          bas, et c'est ce débordement qui les fait lire comme épinglés sur
          le décor plutôt que rangés dans le bandeau. Rien ne coupe ici —
          `overflow` reste au défaut. */}
      <View style={{ height: barHeight }}>
        {/* ⚠️ L'enveloppe ne sert QU'À laisser passer le doigt : le bas du
            dessin est transparent, il déborde sur le décor, et sans
            `pointerEvents` cette moitié invisible avalerait le glissement du
            ruban sur toute sa hauteur. */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: 0, width: w, height: w * ART_HEIGHT }}
        >
          <Image
            source={ART.bandeau}
            // Le dessin est posé à sa PROPRE proportion (`stretch` sur une
            // boîte déjà juste ne déforme rien) : le déformer tordrait les
            // deux bourses, qui sont des objets, pas un fond.
            resizeMode="stretch"
            accessible={false}
            importantForAccessibility="no"
            style={{ width: w, height: w * ART_HEIGHT }}
          />
        </View>

        <View style={[box(SLOTS.name), styles.slot]} pointerEvents="none">
          <Text style={[styles.name, { fontSize: TEXT.name * w }]} numberOfLines={1}>
            {god.label}
          </Text>
        </View>

        <View style={[box(SLOTS.gold), styles.slot]} pointerEvents="none">
          <Text style={[styles.purse, { fontSize: TEXT.purse * w }]} testID="gold" numberOfLines={1}>
            {state.gold.toLocaleString('fr-FR')}
          </Text>
        </View>

        <View style={[box(SLOTS.laurels), styles.slot]} pointerEvents="none">
          <Text
            style={[styles.purse, { fontSize: TEXT.purse * w }]}
            testID="laurels"
            numberOfLines={1}
          >
            {state.laurels.toLocaleString('fr-FR')}
          </Text>
        </View>

        {/* Les deux « + » sont dessinés : la zone cliquable ne peint rien,
            elle se contente de couvrir le bouton de l'image. `hitSlop` la
            porte à la taille du pouce sans l'agrandir à l'œil — le dessin
            fait moins de vingt points de côté sur un téléphone. */}
        <Pressable
          onPress={onOpenShop}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la boutique, rayon or"
          hitSlop={12}
          style={({ pressed }) => [box(SLOTS.addGold), pressed && styles.hotPressed]}
        />
        <Pressable
          onPress={onOpenShop}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la boutique, rayon lauriers"
          hitSlop={12}
          style={({ pressed }) => [box(SLOTS.addLaurels), pressed && styles.hotPressed]}
        />

        {/* Le portrait, posé dans l'anneau du dessin. Il ne porte pas de
            cadre : l'anneau en est déjà un, et un second se lirait comme une
            bavure. D'où deux habillages selon qu'un dieu a son visage ou
            seulement ses deux couleurs. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (PORTRAIT.x - PORTRAIT.size / 2) * w,
            top: (PORTRAIT.y - PORTRAIT.size / 2) * w,
            width: PORTRAIT.size * w,
            height: PORTRAIT.size * w,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {portrait === undefined ? (
            <GodBadge color={appearance.color} accent={appearance.accent} size={PORTRAIT.size * w} />
          ) : (
            <Image
              source={portrait}
              resizeMode="contain"
              style={{ width: PORTRAIT.size * w, height: PORTRAIT.size * w }}
              accessible={false}
              importantForAccessibility="no"
            />
          )}
        </View>

        <View style={[box(SLOTS.level), styles.slot]} pointerEvents="none">
          <Text style={[styles.level, { fontSize: TEXT.level * w }]} numberOfLines={1}>
            Niv {rank.level}
          </Text>
        </View>

        {/* ⚠️ Les réglages n'ont PAS de place dans le dessin : les deux
            bourses tiennent le bandeau d'un bout à l'autre. On les accroche
            donc au bord inférieur, à droite — le pendant du médaillon, qui
            déborde de la même façon à gauche. */}
        <Pressable
          testID="settings"
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Paramètres"
          hitSlop={8}
          style={({ pressed }) => [
            styles.gear,
            { top: barHeight - GEAR / 2 },
            pressed && styles.gearPressed,
          ]}
        >
          <Text style={styles.gearLines}>≡</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ⚠️ `zIndex` : le médaillon, la plaque de niveau et le bouton des réglages
  // débordent SUR le décor, qui est un frère dessiné APRÈS le bandeau. Sans
  // ce relief, ils passeraient dessous et seraient tout simplement invisibles.
  //
  // ⚠️ Le fond n'est pas décoratif : il prolonge le bois du bandeau sous la
  // barre d'état, là où le dessin ne monte pas.
  root: { position: 'relative', zIndex: 2, backgroundColor: COLORS.bar },

  /** Toute boîte posée sur le dessin centre son contenu, sans rien peindre. */
  slot: { alignItems: 'center', justifyContent: 'center' },

  name: { fontFamily: TYPE.title.fontFamily, color: COLORS.text },
  // Les deux montants se lisent sur le champ SOMBRE des bourses : ils sont
  // clairs, et leur ombre les décolle du bois.
  purse: { fontFamily: TYPE.price.fontFamily, color: COLORS.onDark, ...TEXT_SHADOW },
  level: { fontFamily: TYPE.tiny.fontFamily, letterSpacing: 0.5, color: COLORS.onDark, ...TEXT_SHADOW },

  hotPressed: { opacity: 0.55 },

  gear: {
    position: 'absolute',
    right: SPACE.md,
    width: GEAR,
    height: GEAR,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bar,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  gearPressed: { opacity: 0.8, transform: [{ scale: 0.94 }] },
  gearLines: { ...TYPE.display, fontSize: 20, color: COLORS.onDark, lineHeight: 26 },
});
