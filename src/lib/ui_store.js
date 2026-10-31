import { useSyncExternalStore } from 'react';

const initialState = {
  inGame: false,
  isSpectator: false,
  statusText: 'Chờ vào ván cờ...',
  myName: 'Bạn',
  oppName: 'Đối thủ',
  myColor: 0,
  oppColor: 1,
  deadMyPieces: [],
  deadOppPieces: [],
  keyPiecesSelf: '-',
  keyPiecesOpp: '-',
  material: null,
  threats: [],
  coUpStats: null,
  tactical: {
    piece: null,
    targets: [],
    defended: []
  },
  moveHistory: [],
  themeMode: 'dark',
  settingsVersion: 0
};

let currentState = { ...initialState };
const listeners = new Set();

export const uiStore = {
  getState() {
    return currentState;
  },
  setState(partial) {
    const next = typeof partial === 'function' ? partial(currentState) : partial;
    currentState = { ...currentState, ...next };
    listeners.forEach((l) => l());
  },
  resetGameState() {
    currentState = {
      ...initialState,
      themeMode: currentState.themeMode,
      settingsVersion: currentState.settingsVersion + 1
    };
    listeners.forEach((l) => l());
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useUiStore(selector = (s) => s) {
  return useSyncExternalStore(
    uiStore.subscribe,
    () => selector(uiStore.getState()),
    () => selector(initialState)
  );
}
