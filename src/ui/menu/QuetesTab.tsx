/**
 * QuetesTab.tsx — les travaux : ce que le joueur a entrepris, et où il en est.
 *
 * ⚠️ Aucune quête n'est STOCKÉE, et c'est tout le principe. Chacune se déduit
 * de ce que la sauvegarde garde déjà — le meilleur cortège, l'or, les dieux
 * acquis — exactement comme le niveau se déduit du score (voir `rank.ts`). Un
 * joueur qui ouvre cet onglet pour la première fois y trouve donc l'avance
 * qu'il a réellement prise, et non quatre barres à zéro.
 *
 * ⚠️ Les deux titres — « quotidiennes », « hebdomadaires » — viennent de la
 * maquette et ANNONCENT une rotation qui n'existe pas encore : rien ici ne
 * remet un compteur à zéro à minuit ni le lundi, faute d'horloge et de
 * sauvegarde datée. Les deux sections disent donc pour l'instant l'ÉCHÉANCE
 * d'un travail — ce qui se finit en une soirée, ce qui prend une saison — et
 * la note de bas de page le dit au joueur plutôt que de le laisser croire à
 * un compte à rebours. Le jour où la rotation existera, ce sont les données de
 * `questsOf` qui changeront, pas la mise en page.
 *
 * ⚠️ Une quête ne se RÉCLAME pas davantage. Les récompenses sont annoncées —
 * la maquette les montre, et elles sont vraies au sens où elles disent ce qui
 * sera versé — mais le bouton « Récupérer » reste ÉTEINT : il n'existe aucun
 * moyen d'accorder une récompense, et un bouton qui ne donne rien vaut moins
 * qu'un bouton visiblement en attente. Le jour où le système existera, il
 * suffira de rendre `onClaim` au lieu de désactiver. Même règle que l'arène et
 * la voie divine : on affiche ce qui est vrai, on annonce le reste.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Progression } from '../../meta/progression';
import { rankOf } from '../../meta/rank';
import { ICONS } from './icons';
import type { MenuTab } from './MenuScreen';
import { Bar, Button, Card, RewardSlot, SectionTitle, Tile } from './parts';
import { COLORS, SPACE, TYPE } from './theme';

/** Ce qu'une quête rapportera, le jour où les récompenses se verseront. */
interface Reward {
  tone: 'gold' | 'laurel';
  amount: number;
}

/** Une quête : un intitulé, un but, et de quoi lire l'avance dans l'état. */
interface Quest {
  id: string;
  label: string;
  /** Ce que la quête apprend du jeu — lu sous l'intitulé. */
  note: string;
  /** L'avance, et le but. Les deux se comptent dans la même unité. */
  done: number;
  goal: number;
  rewards: Reward[];
  /** L'onglet où l'on avance cette quête — la cible du bouton « Aller ». */
  go: MenuTab;
  /** Ce qu'elle pèse sur la piste hebdomadaire. Nul pour une quête du jour. */
  points?: number;
}

/** Le total de la piste hebdomadaire, en points de quête. */
const WEEKLY_GOAL = 1000;

/**
 * Les paliers de la piste hebdomadaire : ce qu'on décroche en avançant.
 *
 * ⚠️ Les deux derniers sont plus gros que les trois premiers, et c'est ce qui
 * fait tenir une piste : la fin doit valoir le chemin. La maquette les
 * distingue d'ailleurs à l'œil, en les dorant.
 */
const MILESTONES: { at: number; reward: Reward }[] = [
  { at: 200, reward: { tone: 'gold', amount: 150 } },
  { at: 400, reward: { tone: 'gold', amount: 250 } },
  { at: 600, reward: { tone: 'gold', amount: 400 } },
  { at: 800, reward: { tone: 'laurel', amount: 15 } },
  { at: WEEKLY_GOAL, reward: { tone: 'laurel', amount: 40 } },
];

/**
 * Les travaux, du plus proche au plus lointain.
 *
 * ⚠️ Ils sont ordonnés par ce qu'ils demandent, pas par thème : le premier
 * se termine en une course, le dernier en une saison. C'est ce qui donne
 * envie de lire la liste jusqu'en bas plutôt que de s'arrêter à la première.
 */
function questsOf(state: Progression): { daily: Quest[]; weekly: Quest[] } {
  const rank = rankOf(state.bestScore);
  return {
    daily: [
      {
        id: 'first-run',
        label: 'Mener un premier cortège',
        note: 'Convertis cinquante mortels dans une même course.',
        done: Math.min(state.bestScore, 50),
        goal: 50,
        rewards: [
          { tone: 'gold', amount: 100 },
          { tone: 'laurel', amount: 5 },
        ],
        go: 'play',
      },
      {
        id: 'purse',
        label: 'Emplir la bourse',
        note: 'Un fidèle sur trois laisse une pièce derrière lui.',
        done: Math.min(state.gold, 500),
        goal: 500,
        rewards: [
          { tone: 'gold', amount: 150 },
          { tone: 'laurel', amount: 10 },
        ],
        go: 'play',
      },
      {
        id: 'pantheon',
        label: 'Réunir trois divinités',
        note: 'Les autres s’achètent au panthéon, en or.',
        done: Math.min(state.ownedCharacters.length, 3),
        goal: 3,
        rewards: [
          { tone: 'gold', amount: 200 },
          { tone: 'laurel', amount: 10 },
        ],
        go: 'olympe',
      },
    ],
    weekly: [
      {
        id: 'rank',
        label: 'Monter au dixième rang',
        note: `Rang ${rank.level} pour l'instant — il suit le meilleur cortège.`,
        done: Math.min(rank.level, 10),
        goal: 10,
        rewards: [
          { tone: 'gold', amount: 500 },
          { tone: 'laurel', amount: 25 },
        ],
        go: 'play',
        points: 700,
      },
      {
        id: 'laurels',
        label: 'Gagner un premier laurier',
        note: 'La monnaie des dieux ne se ramasse pas dans la rue.',
        done: Math.min(state.laurels, 1),
        goal: 1,
        rewards: [
          { tone: 'gold', amount: 300 },
          { tone: 'laurel', amount: 10 },
        ],
        go: 'shop',
        points: 300,
      },
    ],
  };
}

/**
 * Les points de quête gagnés cette saison : l'avance de chaque quête
 * hebdomadaire, au prorata de ce qu'elle vaut.
 *
 * ⚠️ C'est un COMPTE, pas un compteur : il se recalcule à chaque affichage à
 * partir de la sauvegarde, comme les quêtes elles-mêmes. Rien à remettre à
 * zéro, rien à perdre en changeant de téléphone.
 */
function weeklyPoints(weekly: Quest[]): number {
  return weekly.reduce((total, quest) => {
    const ratio = quest.goal <= 0 ? 0 : Math.min(1, quest.done / quest.goal);
    return total + Math.round((quest.points ?? 0) * ratio);
  }, 0);
}

export function QuetesTab({
  state,
  onGo,
}: {
  state: Progression;
  onGo: (tab: MenuTab) => void;
}) {
  const { daily, weekly } = questsOf(state);
  const points = weeklyPoints(weekly);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <SectionTitle large>Quêtes quotidiennes</SectionTitle>
      {daily.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onGo={onGo} />
      ))}

      {/* Le filet qui sépare les deux sections : il s'éteint à ses deux
          bouts, pour ne pas buter contre les colonnes du temple. */}
      <View style={styles.rule} />
      <SectionTitle large>Quêtes hebdomadaires</SectionTitle>

      <Card style={styles.track}>
        <View style={styles.milestones}>
          {MILESTONES.map((milestone) => (
            <Tile
              key={milestone.at}
              image={milestone.reward.tone === 'gold' ? ICONS.or : ICONS.laurier}
              count={milestone.reward.amount}
              size={42}
              // Trois états, et pas un de plus : décroché, à portée du
              // prochain palier, hors d'atteinte pour l'instant.
              state={
                points >= milestone.at
                  ? 'taken'
                  : milestone.at === nextMilestone(points)
                    ? 'ready'
                    : 'locked'
              }
            />
          ))}
        </View>
        <Bar value={points} max={WEEKLY_GOAL} carved height={34} label="" />
        <Text style={styles.trackCount}>
          Points de quête hebdomadaires : {points.toLocaleString('fr-FR')} /{' '}
          {WEEKLY_GOAL.toLocaleString('fr-FR')}
        </Text>
      </Card>

      {weekly.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onGo={onGo} />
      ))}

      <Text style={styles.footer}>
        Les quêtes se lisent sur ta progression : elles avancent toutes seules,
        au fil des courses, et rien ne les remet encore à zéro d’un jour ni
        d’une semaine à l’autre. Les récompenses annoncées seront versées quand
        le système qui les accorde existera.
      </Text>
    </ScrollView>
  );
}

/** Le premier palier qu'on n'a pas encore franchi — celui qui est « à portée ». */
function nextMilestone(points: number): number | undefined {
  return MILESTONES.find((milestone) => points < milestone.at)?.at;
}

/**
 * Une carte de quête : le but et l'avance à gauche, ce qu'elle rapporte et le
 * bouton à droite.
 *
 * ⚠️ Les deux colonnes ne sont pas décoratives : à gauche ce qu'on LIT une
 * fois — l'intitulé, la consigne, le compte —, à droite ce qu'on cherche du
 * regard en parcourant la liste — le gain, et le geste qui suit. C'est ce qui
 * permet de balayer dix quêtes sans en lire une seule.
 *
 * La jauge porte le compte EN TOUTES LETTRES par-dessus elle : un joueur veut
 * savoir combien il lui reste, pas estimer une longueur à l'œil.
 */
function QuestCard({ quest, onGo }: { quest: Quest; onGo: (tab: MenuTab) => void }) {
  const done = quest.done >= quest.goal;
  return (
    <Card style={styles.quest}>
      <View style={styles.questBody}>
        <View style={styles.questText}>
          <Text style={styles.questLabel} numberOfLines={2}>
            {quest.label}
          </Text>
          <Text style={styles.questNote} numberOfLines={2}>
            {quest.note}
          </Text>
          <Bar
            value={quest.done}
            max={quest.goal}
            carved
            label={`${quest.done.toLocaleString('fr-FR')} / ${quest.goal.toLocaleString('fr-FR')}`}
          />
        </View>

        <View style={styles.questSide}>
          <View style={styles.rewards}>
            {quest.rewards.map((reward) => (
              <RewardSlot key={reward.tone} tone={reward.tone} amount={reward.amount} />
            ))}
          </View>
          {done ? (
            <Button
              label="Récupérer"
              variant="claim"
              size="small"
              disabled
              hint={`${quest.label} : accomplie. La récompense sera versée quand le système qui l’accorde existera.`}
              onPress={() => undefined}
            />
          ) : (
            <Button
              label="Aller"
              variant="go"
              size="small"
              hint={`${quest.label} : aller là où elle s’avance`}
              onPress={() => onGo(quest.go)}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // ⚠️ La marge latérale est petite mais nécessaire : l'intérieur du temple
  // est mesuré sur son liseré d'or, et une ligne de texte qui va d'un bord à
  // l'autre vient mordre sur la moulure des colonnes.
  content: {
    paddingTop: SPACE.xs,
    paddingHorizontal: SPACE.xs,
    gap: SPACE.sm,
    paddingBottom: SPACE.xl,
  },

  rule: {
    height: 1,
    marginTop: SPACE.md,
    backgroundColor: COLORS.border,
  },

  quest: {},
  questBody: { flexDirection: 'row', gap: SPACE.sm, alignItems: 'flex-start' },
  // ⚠️ La jauge est DANS cette colonne, sous la consigne, et non en travers
  // de la carte : c'est ce qui garde une quête à la hauteur de ses deux
  // casiers de récompense. Pleine largeur, elle ajoutait une ligne à chaque
  // carte, et la liste ne montrait plus que deux quêtes par écran.
  questText: { flex: 1, minWidth: 0, gap: SPACE.xs },
  questLabel: { ...TYPE.title, fontSize: 15, color: COLORS.text },
  questNote: { ...TYPE.body, fontSize: 12, color: COLORS.muted, lineHeight: 16 },
  // ⚠️ La colonne de droite est une FRACTION de la carte, pas une largeur en
  // points : elle porte deux casiers et un bouton, et sur un petit écran une
  // largeur fixe mangerait tout l'intitulé de gauche.
  questSide: { width: '34%', gap: SPACE.xs },
  rewards: { flexDirection: 'row', gap: SPACE.xs },

  track: { gap: SPACE.sm },
  milestones: { flexDirection: 'row', justifyContent: 'space-between' },
  trackCount: { ...TYPE.body, fontSize: 13, color: COLORS.text, textAlign: 'center' },

  footer: {
    ...TYPE.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: SPACE.sm,
  },
});
