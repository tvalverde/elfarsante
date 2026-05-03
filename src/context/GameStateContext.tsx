import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

export type Phase = 'HOME' | 'REPARTO' | 'DEBATE' | 'VOTACION' | 'RESULTADO' | 'PUNTUACIONES' | 'RESTORE_PROMPT';

export interface Player {
  id: string;
  name: string;
  score: number;
  isAlive: boolean;
  role: 'normal' | 'farsante' | null;
}

export interface GameConfig {
  timerDuration: number;
  selectedCategories: string[];
  farsantesCount: number;
  penaltyOnFail: boolean;
  scoreLimit: number | null;
  blindTimer: boolean;
}

export interface RoundData {
  word: string;
  category: string;
  farsanteIds: string[];
  remainingTime: number;
  accusedId: string | null;
  currentPlayerIndex: number;
  startingPlayerId: string | null;
}

export interface GameState {
  players: Player[];
  currentPhase: Phase;
  config: GameConfig;
  round: RoundData;
}

const initialState: GameState = {
  players: [],
  currentPhase: 'HOME',
  config: {
    timerDuration: 300,
    selectedCategories: ['animales'],
    farsantesCount: 1,
    penaltyOnFail: false,
    scoreLimit: null,
    blindTimer: false,
  },
  round: {
    word: '',
    category: '',
    farsanteIds: [],
    remainingTime: 300,
    accusedId: null,
    currentPlayerIndex: 0,
    startingPlayerId: null,
  }
};

type Action =
  | { type: 'START_GAME'; payload: { players: Player[], config: GameConfig, round: RoundData } }
  | { type: 'NEXT_PHASE'; payload: Phase }
  | { type: 'NEXT_PLAYER' }
  | { type: 'UPDATE_ROUND'; payload: Partial<RoundData> }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        players: action.payload.players,
        config: action.payload.config,
        round: action.payload.round,
        currentPhase: 'REPARTO'
      };
    case 'NEXT_PHASE':
      return { ...state, currentPhase: action.payload };
    case 'NEXT_PLAYER':
      return { 
        ...state, 
        round: { ...state.round, currentPlayerIndex: state.round.currentPlayerIndex + 1 }
      };
    case 'UPDATE_ROUND':
      return {
        ...state,
        round: { ...state.round, ...action.payload }
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload
      };
    case 'RESET_GAME':
      return { ...initialState, players: state.players.map(p => ({ ...p, score: 0, isAlive: true, role: null })) };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const GameStateContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function initGameState(initial: GameState): GameState {
  if (typeof window === 'undefined') return initial; // Para SSR/tests si aplica
  try {
    const savedState = localStorage.getItem('elfarsante_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed && parsed.currentPhase) {
        if (parsed.currentPhase !== 'HOME' && parsed.currentPhase !== 'PUNTUACIONES' && parsed.currentPhase !== 'RESTORE_PROMPT') {
          return { ...parsed, currentPhase: 'RESTORE_PROMPT' };
        } else if (parsed.currentPhase === 'PUNTUACIONES') {
          return parsed;
        } else {
          return { ...initial, players: parsed.players || [], config: parsed.config || initial.config };
        }
      }
    }
  } catch (e) {
    console.error("Failed to parse saved state", e);
  }
  return initial;
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, initGameState);

  useEffect(() => {
    if (state.currentPhase !== 'RESTORE_PROMPT') {
      localStorage.setItem('elfarsante_state', JSON.stringify(state));
    }
  }, [state]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
