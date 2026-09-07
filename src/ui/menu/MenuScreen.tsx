/**
 * MenuScreen.tsx — l'écran d'accueil et ses cinq onglets.
 *
 * C'est le seul fichier qui sait combien il y a d'onglets. Chacun d'eux
 * ignore les autres, et aucun ne connaît le jeu : le menu reçoit des
 * fonctions (« jouer », « acheter ») et les appelle. La 3D peut être en train
 * de tourner derrière, ou pas du tout, cela ne le regarde pas.
 *
 * ⚠️ Les onglets sont EN BAS, et il y en a CINQ. Le pouce n'atteint pas le
 * haut d'un téléphone moderne, et une barre d'onglets cesse d'être lisible
 * au-delà de cinq entrées : la barre est donc pleine. Un sixième onglet
 * demanderait d'en fusionner deux, pas d'en serrer un de plus.
 *
 * ⚠️ « Jouer » est au MILIEU, et c'est ce qui décide du reste. Il est ouvert
 * au démarrage, et deux dalles le bordent de chaque côté : aucun onglet n'est
 * à plus de deux glissements de pouce, et la barre est symétrique.
 *
 * ⚠️ La barre d'onglets est DESSINÉE d'un seul tenant (`assets/ui/onglets.jpg`) :
 * les cinq dalles, leur icône et leur libellé sont dans l'image, dans l'ordre
 * du ruban. L'écran ne pose que cinq zones cliquables et la LUEUR de l'onglet
 * actif — d'où la disparition du médaillon « Jouer » : le dessin traite les
 * cinq dalles à égalité, et un médaillon en relief par-dessus en recouvrirait
 * une.
 *
 * ⚠️ Les onglets ne sont pas cinq écrans qui se remplacent : ils sont
 * COUSUS côte à côte dans un même ruban horizontal que le doigt fait
 * glisser. Le contenu suit le doigt image par image, et le trait de la barre
 * d'onglets avance avec lui — d'où le `Animated.ScrollView` et la valeur
 * `scrollX` ci-dessous, plutôt qu'un simple `useState` d'onglet actif.
 *
 * ⚠️ Le décor est posé DANS le ruban (voir `Backdrop`), en tranches d'une
 * page chacune : « Jouer » montre `wallpaper1.png`, les quatre autres
 * onglets partagent `wallpaper2.png`. Le doigt fait glisser ces tranches
 * sans interpolation à la main — le défilement natif s'en charge.
 *
 * ⚠️ Le bandeau du haut et la barre d'onglets, eux, ne bougent JAMAIS : ce
 * sont des habillages de l'écran, pas des morceaux de la scène. Ils sont
 * posés APRÈS le ruban, donc par-dessus l'image qui glisse.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ART } from './icons';
import type { GodId } from '../../entities/gods/roster';
import type { Progression } from '../../meta/progression';
import { OlympeTab } from './OlympeTab';
import { PassTab } from './PassTab';
import { PlayTab } from './PlayTab';
import { QuetesTab } from './QuetesTab';
import { SettingsSheet } from './SettingsSheet';
import { ShopTab } from './ShopTab';
import { TopBar } from './TopBar';
import { COLORS, SPACE, TYPE } from './theme';

export type MenuTab = 'olympe' | 'quetes' | 'play' | 'pass' | 'shop';

/** Le décor de « Jouer », et celui, partagé, de tous les autres onglets. */
const WALLPAPER_PLAY = require('../../../assets/wallpaper1.png');
const WALLPAPER_OTHER = require('../../../assets/wallpaper2.png');

/**
 * Le temple dessiné qui encadre une page — ciel, fronton, colonnes et socle
 * (`ART.maquette`, 941 × 1672) — et où tombent ses trois repères.
 *
 * ⚠️ Tout est en fractions, et de DEUX grandeurs différentes, ce qui n'est pas
 * un caprice :
 *
 *   `top` et `side` se mesurent sur la LARGEUR de l'écran, parce que le cadre
 *   y est étiré d'un bord à l'autre et que le bandeau, qui lui cache le haut,
 *   se mesure lui aussi sur la largeur ;
 *
 *   `plaque` et `content` se mesurent sur la HAUTEUR DU CADRE, parce que ce
 *   sont des morceaux du dessin : la tablette du fronton et l'intérieur du
 *   temple descendent avec lui quand il s'allonge.
 *
 * ⚠️ `top` est NÉGATIF : le haut du dessin passe derrière le bandeau, comme
 * dans la maquette. Sans ce recouvrement, une bande de ciel apparaîtrait entre
 * les deux.
 *
 * ⚠️ Mesurées sur la maquette (`design/`), pas estimées à l'œil. Elles cessent
 * d'être justes dès que le dessin change, et il faut alors les re-mesurer,
 * sinon le contenu passe sous les colonnes.
 */
const FRAME = {
  /** La hauteur du dessin, en largeurs d'écran. */
  ratio: 1672 / 941,
  /** De combien son haut passe derrière le bandeau, en largeurs d'écran. */
  top: 88 / 768 - 306 / 2170,
  /** Les colonnes, en largeurs d'écran. */
  side: 0.125,
  /**
   * La tablette gravée du fronton. Ses bords se mesurent sur la largeur, sa
   * hauteur sur celle du cadre — voir l'avertissement ci-dessus.
   */
  plaque: { top: 171 / 1364, height: 98 / 1364, side: 143 / 768 },
  /** L'intérieur de marbre, en hauteurs de cadre. */
  content: { top: 304 / 1364, height: 855 / 1364 },
} as const;

/**
 * La barre d'onglets dessinée (`ART.onglets`, 4640 × 928) : sa hauteur en
 * largeurs d'écran, soit exactement un cinquième — cinq dalles carrées.
 */
const TAB_BAR_HEIGHT = 928 / 4640;

/**
 * L'ordre à l'écran, de gauche à droite. « Jouer » au milieu, encadré par
 * deux dalles de chaque côté.
 *
 * ⚠️ Il n'y a plus ni icône ni intitulé à poser : le dessin de la barre les
 * porte déjà, dans cet ordre-ci. Ce qui reste est ce qu'une image ne sait pas
 * faire — le nom lu à voix haute, et l'onglet vers lequel on saute.
 */
const TABS: { id: MenuTab; label: string }[] = [
  { id: 'quetes', label: 'Quêtes' },
  { id: 'olympe', label: 'Olympe' },
  { id: 'play', label: 'Jouer' },
  { id: 'pass', label: 'Passe' },
  { id: 'shop', label: 'Boutique' },
];

const indexOf = (id: MenuTab) => TABS.findIndex((t) => t.id === id);

interface Props {
  state: Progression;
  onPlay: () => void;
  onBuyGod: (godId: GodId) => void;
  onBuySkin: (skinId: string) => void;
  onSelectGod: (godId: GodId) => void;
  onEquipSkin: (skinId: string) => void;
  onResetProgression: () => void;
  showStats: boolean;
  onToggleStats: (value: boolean) => void;
}

export function MenuScreen({
  state,
  onPlay,
  onBuyGod,
  onBuySkin,
  onSelectGod,
  onEquipSkin,
  onResetProgression,
  showStats,
  onToggleStats,
}: Props) {
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(1, Math.round(width));
  const insets = useSafeAreaInsets();

  /** L'onglet « arrêté ». Sert à l'accessibilité, pas au dessin du ruban. */
  const [index, setIndex] = useState(indexOf('play'));
  const indexRef = useRef(index);
  indexRef.current = index;

  // La hauteur d'une page, mesurée : le cadre est étiré à la page, et ses
  // marges hautes et basses se comptent donc sur la hauteur, pas la largeur
  // (les pourcentages de Yoga, eux, se mesurent tous sur la largeur).
  const [naveHeight, setNaveHeight] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const pagerRef = useRef<ScrollView | null>(null);

  // ⚠️ `contentOffset` ne place le ruban qu'à l'ouverture, et SEULEMENT sur
  // iOS. Ailleurs (Android, web), on le recadre nous-mêmes dès que le ruban
  // connaît sa taille — sinon le menu s'ouvrirait sur l'Olympe.
  const placed = useRef(false);

  // La position du ruban, en pixels. Elle est pilotée par le pilote natif :
  // le trait de la barre d'onglets suit donc le doigt sans passer par React,
  // même si le fil JavaScript est occupé ailleurs.
  const scrollX = useRef(new Animated.Value(indexOf('play') * pageWidth)).current;

  const goTo = useCallback(
    (id: MenuTab) => {
      const target = indexOf(id);
      setIndex(target);
      pagerRef.current?.scrollTo({ x: target * pageWidth, y: 0, animated: true });
    },
    [pageWidth],
  );

  // Une rotation d'écran change la largeur d'une page : sans ce recadrage, le
  // ruban resterait immobile et montrerait deux onglets à moitié.
  useEffect(() => {
    scrollX.setValue(indexRef.current * pageWidth);
    pagerRef.current?.scrollTo({ x: indexRef.current * pageWidth, y: 0, animated: false });
  }, [pageWidth, scrollX]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
    // Le glissement, lui, est continu : on ne retient que l'onglet le plus
    // proche, et seulement quand il change — inutile de réveiller React à
    // chaque image.
    listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      if (next !== indexRef.current && next >= 0 && next < TABS.length) {
        indexRef.current = next;
        setIndex(next);
      }
    },
  });

  const closeSettings = () => {
    setSettingsOpen(false);
    // La demande de confirmation ne survit pas à la fermeture : rouvrir les
    // paramètres ne doit jamais présenter un bouton « Effacer » armé.
    setConfirmingReset(false);
  };

  return (
    <View style={styles.root}>
      {/* Le décor, et le brouillard clair qui le fait passer derrière le
          parchemin. Les deux sont FIXES : seule l'image du ruban glisse. */}
      {/* ⚠️ Le haut n'est PLUS réservé ici : c'est le bandeau qui porte la
          marge de la barre d'état (voir `TopBar`). Réservée à ce niveau, elle
          laissait une bande de fond clair au-dessus du cadre, et une seconde
          entre son bas et le décor. */}
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <TopBar
          state={state}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenShop={() => goTo('shop')}
        />

        <View style={styles.nave} onLayout={(e) => setNaveHeight(e.nativeEvent.layout.height)}>
          <Animated.ScrollView
            ref={pagerRef as never}
            style={styles.pager}
            horizontal
            pagingEnabled
            directionalLockEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: indexOf('play') * pageWidth, y: 0 }}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onContentSizeChange={() => {
              if (placed.current) return;
              placed.current = true;
              pagerRef.current?.scrollTo({ x: indexOf('play') * pageWidth, y: 0, animated: false });
            }}
          >
            <Backdrop pageWidth={pageWidth} />

            <Page width={pageWidth} height={naveHeight} framed title="Quêtes et défis célestes">
              <QuetesTab state={state} onGo={goTo} />
            </Page>

            <Page width={pageWidth} height={naveHeight} framed title="Olympe">
              <OlympeTab
                state={state}
                onSelectGod={onSelectGod}
                onBuyGod={onBuyGod}
                onBuySkin={onBuySkin}
                onEquipSkin={onEquipSkin}
              />
            </Page>

            <Page width={pageWidth} height={naveHeight}>
              <PlayTab state={state} onPlay={onPlay} />
            </Page>

            <Page width={pageWidth} height={naveHeight} framed title="Passe de combat">
              <PassTab state={state} />
            </Page>

            <Page width={pageWidth} height={naveHeight} framed title="Boutique">
              <ShopTab state={state} onBuyGod={onBuyGod} onBuySkin={onBuySkin} />
            </Page>
          </Animated.ScrollView>
        </View>

        <TabBar index={index} pageWidth={pageWidth} scrollX={scrollX} onGo={goTo} />
      </SafeAreaView>

      {/* Le fondu au noir, dans la marge de sécurité SOUS la barre d'onglets —
          entre son bas et le vrai bord de l'écran, pas sur la barre
          elle-même. `pointerEvents="none"` : un voile, pas un obstacle au
          doigt. Rien à poser si le téléphone n'a pas cette marge. */}
      {insets.bottom > 0 && (
        <LinearGradient
          pointerEvents="none"
          // Part du bois de la barre d'onglets (`COLORS.bar`) juste sous le
          // dessin, pour filer vite vers le noir près du bord de l'écran —
          // pas un flou vers le transparent, un vrai dégradé d'une couleur
          // à l'autre.
          colors={[COLORS.bar, 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)']}
          locations={[0, 0.35, 1]}
          style={[styles.edgeFade, { bottom: 0, height: insets.bottom }]}
        />
      )}

      <SettingsSheet
        visible={settingsOpen}
        onClose={closeSettings}
        showStats={showStats}
        onToggleStats={onToggleStats}
        confirmingReset={confirmingReset}
        onAskReset={() => setConfirmingReset(true)}
        onCancelReset={() => setConfirmingReset(false)}
        onReset={() => {
          onResetProgression();
          closeSettings();
        }}
      />
    </View>
  );
}

/**
 * La barre d'onglets : la frise DESSINÉE des cinq dalles, et la lueur qui
 * marque celle où l'on se trouve.
 *
 * ⚠️ Rien n'est composé ici. L'image porte les cinq dalles, leur icône et leur
 * libellé ; l'écran pose cinq zones cliquables de largeur égale par-dessus,
 * plus la lueur. C'est ce qui garde la barre exactement conforme au dessin,
 * quel que soit le téléphone.
 *
 * ⚠️ La lueur SUIT LE DOIGT, elle ne saute pas d'une dalle à l'autre : elle est
 * pilotée par la position du ruban (`scrollX`) et par le pilote natif, donc
 * elle avance image par image même quand le fil JavaScript est occupé
 * ailleurs. C'est le même geste que l'ancien trait d'or, dans une autre
 * matière.
 *
 * ⚠️ Elle est chaude et DIFFUSE, pas plate : une dalle repeinte en jaune
 * effacerait le dessin qu'elle recouvre, là qu'une lueur le laisse lire.
 * Elle reste doublée par l'état d'accessibilité (`selected`), qui, lui, ne
 * dépend d'aucune couleur.
 */
function TabBar({
  index,
  pageWidth,
  scrollX,
  onGo,
}: {
  index: number;
  pageWidth: number;
  scrollX: Animated.Value;
  onGo: (id: MenuTab) => void;
}) {
  const height = pageWidth * TAB_BAR_HEIGHT;
  const cell = pageWidth / TABS.length;
  const last = TABS.length - 1;

  return (
    <View style={[styles.tabBar, { height }]}>
      <Image
        source={ART.onglets}
        // `stretch` sur une boîte déjà à la proportion du dessin ne déforme
        // rien : la frise est étirée d'un bord à l'autre de l'écran, comme
        // le bandeau du haut.
        resizeMode="stretch"
        accessible={false}
        importantForAccessibility="no"
        style={{ position: 'absolute', left: 0, top: 0, width: pageWidth, height }}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: cell,
            height: height * 1.2,
            // La lueur déborde en bas : son centre tombe aux six dixièmes de
            // la dalle, là où se trouve l'icône du dessin.
            top: height * 0.05,
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, last * pageWidth],
                  outputRange: [0, last * cell],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 215, 130, 0)', 'rgba(255, 225, 150, 0.55)', 'rgba(255, 215, 130, 0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <Pressable
            key={tab.id}
            testID={`tab-${tab.id}`}
            onPress={() => onGo(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === i }}
            accessibilityLabel={tab.label}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.18)' }}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Le décor : DEUX images, une par onglet selon ce qu'il montre — « Jouer »
 * a la sienne (`wallpaper1.png`), les quatre autres partagent la même
 * (`wallpaper2.png`).
 *
 * ⚠️ Il vit DANS le ruban — c'est un enfant de la zone qui défile, pas un
 * calque posé derrière l'écran. C'est ce qui le fait bouger avec le doigt
 * sans une ligne d'animation : chaque tranche est simplement la largeur
 * d'une page, rangée dans le même ordre que les onglets.
 *
 * ⚠️ Il est en position absolue, donc HORS du rang des pages : sans cela
 * il occuperait une sixième place dans le ruban et décalerait les onglets
 * d'un écran. Posé en premier, il est aussi dessiné dessous.
 *
 * Pas de brouillard par-dessus : les images sont montrées telles quelles,
 * sans voile ni opacité.
 */
function Backdrop({ pageWidth }: { pageWidth: number }) {
  return (
    <View pointerEvents="none" style={[styles.backdrop, { width: pageWidth * TABS.length }]}>
      {TABS.map((tab) => (
        <Image
          key={tab.id}
          source={tab.id === 'play' ? WALLPAPER_PLAY : WALLPAPER_OTHER}
          style={{ width: pageWidth, height: '100%' }}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}

/**
 * Une page du ruban : une largeur d'écran, et son propre défilement.
 *
 * ⚠️ Elle est TRANSPARENTE, et c'est ce qui laisse voir le décor commun posé
 * dessous. Lui donner un fond couperait l'image en quatre.
 *
 * ⚠️ `framed` pose le temple dessiné (`ART.maquette`) sur la page : ciel,
 * fronton, colonnes et socle. Toutes les pages le portent SAUF « Jouer », qui
 * montre sa scène en grand.
 *
 * ⚠️ Le cadre porte SON PROPRE décor — le ciel et les nuages sont dans le
 * dessin — et recouvre donc le papier peint des quatre onglets encadrés. Ce
 * n'est pas un doublon : le papier peint reste ce que montre « Jouer », et ce
 * qui glisse sous le doigt entre deux onglets.
 *
 * ⚠️ Il est posé à la LARGEUR de la page et garde sa proportion, plutôt que
 * d'être étiré aux quatre bords : ses colonnes sont des objets, et les
 * allonger sur un écran étroit les rendrait maigres. Il n'est étiré que dans
 * le cas où la page est plus haute que lui — sinon son socle flotterait au
 * milieu du vide.
 *
 * Il est posé en premier, donc sous le contenu, et le contenu se range dans
 * son intérieur de marbre (`FRAME.content`) pour ne pas passer sous les
 * colonnes.
 *
 * ⚠️ Le titre de l'onglet s'écrit DANS la tablette du fronton. C'est pour
 * cela qu'aucun onglet encadré ne pose plus sa propre `Plaque` : la tablette
 * est déjà dessinée dans le cadre, et deux tablettes empilées feraient lire
 * le titre deux fois.
 */
function Page({
  width,
  height,
  framed = false,
  title,
  children,
}: {
  width: number;
  height: number;
  framed?: boolean;
  title?: string;
  children: ReactNode;
}) {
  // Tant que la page n'est pas mesurée, on ne connaît pas sa hauteur : le
  // cadre attend plutôt que de se poser de travers.
  const showFrame = framed && height > 0;

  // Le haut du cadre, au-dessus de la page : il passe derrière le bandeau.
  const frameTop = width * FRAME.top;
  // Sa hauteur : la sienne, sauf sur une page plus haute que lui — là, il
  // s'allonge.
  //
  // ⚠️ Il descend SOUS la page, derrière la barre d'onglets, comme dans la
  // maquette. Sans ce débordement, tout son socle se retrouverait au-dessus
  // de la barre : le temple garderait une terrasse de pierre vide en bas
  // d'écran, et l'intérieur de marbre — la seule surface utile — perdrait
  // d'autant.
  const frameHeight = Math.max(
    width * FRAME.ratio,
    height + width * TAB_BAR_HEIGHT - frameTop,
  );

  const contentTop = frameTop + frameHeight * FRAME.content.top;
  const contentBottom = height - (contentTop + frameHeight * FRAME.content.height);

  return (
    <View
      style={[
        styles.page,
        // ⚠️ La hauteur est IMPOSÉE, pas laissée au contenu. Dans un ruban
        // horizontal, toutes les pages prennent la hauteur de la plus haute :
        // sans cela, un onglet au contenu long étirerait le cadre de tous les
        // autres bien au-delà de l'écran, et le fronton descendrait au milieu
        // de la page.
        { width, height: height > 0 ? height : undefined },
        showFrame
          ? {
              paddingHorizontal: width * FRAME.side,
              paddingTop: contentTop,
              // Sur un écran très court, l'intérieur du temple descendrait
              // sous la barre d'onglets : on le rattrape au bas de la page
              // plutôt que de le laisser passer dessous.
              paddingBottom: Math.max(0, contentBottom),
            }
          : styles.pageBare,
      ]}
    >
      {showFrame && (
        // ⚠️ La taille du cadre est ÉCRITE, pas déduite d'un `absoluteFill` :
        // une image porte sa taille native, et quatre côtés à zéro ne la
        // contraignent pas. Il DÉPASSE la page en haut et, souvent, en bas :
        // le bandeau et la barre d'onglets recouvrent ce qui dépasse.
        <View
          pointerEvents="none"
          style={[styles.frame, { top: frameTop, width, height: frameHeight }]}
        >
          <Image
            source={ART.maquette}
            resizeMode="stretch"
            accessible={false}
            importantForAccessibility="no"
            style={{ width, height: frameHeight }}
          />
        </View>
      )}
      {showFrame && title !== undefined && (
        // ⚠️ Le titre est centré par sa BOÎTE, pas par un `lineHeight` égal à
        // la hauteur de la tablette : iOS ne répartit pas ce surplus de part
        // et d'autre du texte comme le web, et le titre montait sur le toit.
        <View
          pointerEvents="none"
          style={[
            styles.framePlaque,
            {
              top: frameTop + frameHeight * FRAME.plaque.top,
              height: frameHeight * FRAME.plaque.height,
              left: width * FRAME.plaque.side,
              right: width * FRAME.plaque.side,
            },
          ]}
        >
          {/* ⚠️ La taille du titre suit la LARGEUR de l'écran, comme la
              tablette qui le porte : une taille en points déborderait du
              marbre sur un téléphone étroit, et y flotterait sur une
              tablette. `adjustsFontSizeToFit` ne rattrape rien sur le web,
              où il n'existe pas — la taille doit être juste d'avance. */}
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            accessibilityRole="header"
            style={[styles.frameTitle, { fontSize: width * (26 / 768) }]}
          >
            {title.toUpperCase()}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.ground },
  safe: { flex: 1 },

  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, flexDirection: 'row' },

  edgeFade: { position: 'absolute', left: 0, right: 0 },

  // La nef : le ruban et ses pages.
  nave: { flex: 1 },
  pager: { flex: 1 },
  page: {},
  frame: { position: 'absolute', left: 0 },
  // Sans cadre — « Jouer » — les cartes s'écartent quand même des bords. La
  // marge haute n'est pas décorative : le médaillon du dieu et sa plaque de
  // niveau débordent du bandeau, et sans elle la première carte passerait
  // dessous.
  pageBare: { paddingHorizontal: SPACE.md + SPACE.sm, paddingTop: SPACE.md, paddingBottom: SPACE.lg },
  // La tablette du fronton : une boîte posée sur le dessin, qui centre son
  // titre dans les deux sens.
  framePlaque: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE.sm,
  },
  frameTitle: { ...TYPE.banner, color: COLORS.text, textAlign: 'center' },

  // ⚠️ La barre ne peint RIEN : la frise dessinée est opaque et pleine
  // largeur, et un fond derrière elle ne se verrait jamais. Elle coupe, en
  // revanche — la lueur de l'onglet actif déborde du dessin, et sans cela
  // elle passerait sur le décor au-dessus de la barre.
  tabBar: { overflow: 'hidden' },
  glow: { position: 'absolute', left: 0, overflow: 'hidden' },
  tabRow: { flexDirection: 'row', height: '100%' },
  // Une zone cliquable, et rien d'autre : l'icône et l'intitulé sont dans le
  // dessin. Elle ne peint qu'au toucher, pour dire que l'appui a été pris.
  tab: { flex: 1, height: '100%' },
  tabPressed: { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
});
