/** Durée minimale pendant laquelle l'écran de chargement reste visible. */
export const MINIMUM_LOADING_DURATION_MS = 2_000;

const ARTWORK_WIDTH = 688;
const ARTWORK_HEIGHT = 1_536;

export interface LoadingArtworkLayout {
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
}

/**
 * En portrait, l'image couvre l'écran avec un très léger recadrage vertical.
 * Sur un écran large, elle reste entière et centrée pour ne pas être écrasée.
 */
export function getLoadingArtworkLayout(
  screenWidth: number,
  screenHeight: number,
): LoadingArtworkLayout {
  const isWideScreen = screenWidth > screenHeight;
  const scale = isWideScreen
    ? Math.min(screenWidth / ARTWORK_WIDTH, screenHeight / ARTWORK_HEIGHT)
    : Math.max(screenWidth / ARTWORK_WIDTH, screenHeight / ARTWORK_HEIGHT);
  const width = ARTWORK_WIDTH * scale;
  const height = ARTWORK_HEIGHT * scale;

  return {
    width,
    height,
    left: (screenWidth - width) / 2,
    top: (screenHeight - height) / 2,
  };
}

/** Renvoie une progression bornée entre 0 et 1. */
export function getLoadingProgress(elapsedMs: number): number {
  const linearProgress = Math.min(1, Math.max(0, elapsedMs / MINIMUM_LOADING_DURATION_MS));
  // Une exponentielle normalisée : départ retenu, accélération franche vers la fin.
  return Math.expm1(3 * linearProgress) / Math.expm1(3);
}

/** Pourcentage entier affiché au joueur pendant l'animation. */
export function getLoadingPercentage(elapsedMs: number): number {
  return Math.floor(getLoadingProgress(elapsedMs) * 100);
}

/** Le menu ne peut apparaître qu'après l'animation et le chargement des polices. */
export function canLeaveLoadingScreen(elapsedMs: number, fontsLoaded: boolean): boolean {
  return elapsedMs >= MINIMUM_LOADING_DURATION_MS && fontsLoaded;
}
