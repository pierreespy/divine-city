/**
 * useProgression.ts — la progression, vue par React.
 *
 * Il ne fait que deux choses : garder l'état en mémoire pendant la session,
 * et l'enregistrer à chaque fois qu'il change. Toutes les RÈGLES (peut-on
 * acheter ? que coûte un dieu ?) restent dans `progression.ts`, qui n'a
 * besoin ni de React ni d'un téléphone pour être relu.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CharacterId } from '../entities/characters/roster';
import {
  buyCharacter,
  buySkin,
  equipSkin,
  finishRun,
  initialProgression,
  selectCharacter,
  type Progression,
} from './progression';
import { clearProgression, loadProgression, saveProgression } from './storage';

export interface ProgressionApi {
  state: Progression;
  /** Faux tant que la sauvegarde n'est pas relue : évite d'afficher 0 or puis 340. */
  ready: boolean;
  buyCharacter: (characterId: CharacterId) => void;
  buySkin: (skinId: string) => void;
  selectCharacter: (characterId: CharacterId) => void;
  equipSkin: (skinId: string) => void;
  finishRun: (faithful: number) => void;
  reset: () => void;
}

export function useProgression(): ProgressionApi {
  const [state, setState] = useState<Progression>(initialProgression);
  const [ready, setReady] = useState(false);

  // ⚠️ On n'enregistre PAS le premier état : ce serait écraser la sauvegarde
  // du joueur avec un état neuf avant même de l'avoir lue.
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    void loadProgression().then((saved) => {
      if (!alive) return;
      loaded.current = true;
      setState(saved);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (loaded.current) saveProgression(state);
  }, [state]);

  return {
    state,
    ready,
    buyCharacter: useCallback((characterId: CharacterId) => setState((s) => buyCharacter(s, characterId)), []),
    buySkin: useCallback((skinId: string) => setState((s) => buySkin(s, skinId)), []),
    selectCharacter: useCallback((characterId: CharacterId) => setState((s) => selectCharacter(s, characterId)), []),
    equipSkin: useCallback((skinId: string) => setState((s) => equipSkin(s, skinId)), []),
    finishRun: useCallback((faithful: number) => setState((s) => finishRun(s, faithful)), []),
    reset: useCallback(() => {
      void clearProgression();
      loaded.current = true;
      setState(initialProgression());
    }, []),
  };
}
