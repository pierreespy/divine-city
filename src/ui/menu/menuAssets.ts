import { Asset } from 'expo-asset';

import { purchasableSkins } from '../../meta/store';
import { ART, DISTRICT_ICONS, ICONS, PLATES, PORTRAITS } from './icons';

/** Les deux décors du ruban, partagés avec `MenuScreen`. */
export const MENU_WALLPAPERS = {
  play: require('../../../assets/wallpaper1.png'),
  other: require('../../../assets/wallpaper2.png'),
} as const;

type AssetModule = Parameters<typeof Asset.fromModule>[0];

/**
 * Toutes les images susceptibles d'apparaître dans le menu.
 *
 * Le menu reste monté sous l'écran de chargement pour préparer sa mise en
 * page. Ce téléchargement explicite complète ce travail : l'illustration ne
 * se retire qu'une fois chaque ressource locale résolue.
 */
const MENU_ASSETS = [
  ...Object.values(ICONS),
  ...Object.values(ART),
  ...Object.values(DISTRICT_ICONS),
  ...Object.values(PORTRAITS),
  ...Object.values(PLATES),
  ...Object.values(MENU_WALLPAPERS),
  ...purchasableSkins().flatMap((skin) => (skin.preview === undefined ? [] : [skin.preview])),
] as AssetModule[];

export async function loadMenuAssets(): Promise<void> {
  await Promise.all(MENU_ASSETS.map((source) => Asset.fromModule(source).downloadAsync()));
}
