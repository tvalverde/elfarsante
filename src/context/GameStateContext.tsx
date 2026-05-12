import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

export type Phase =
  | 'HOME'
  | 'REPARTO'
  | 'DEBATE'
  | 'VOTACION'
  | 'RESULTADO'
  | 'PUNTUACIONES'
  | 'RESTORE_PROMPT'

export interface Player {
  id: string
  name: string
  score: number
  farsanteCount: number
  wronglyEliminatedCount: number
  roundsSurvivedCount: number
  farsanteWinsCount: number
  isAlive: boolean
  role: 'normal' | 'farsante' | null
}

export interface GameConfig {
  timerDuration: number
  selectedCategories: string[]
  farsantesCount: number
  penaltyOnFail: boolean
  scoreLimit: number | null
  blindTimer: boolean
}

export interface RoundData {
  word: string
  category: string
  farsanteIds: string[]
  remainingTime: number
  accusedId: string | null
  currentPlayerIndex: number
  startingPlayerId: string | null
  hasShownStartNotice: boolean
}

export interface GameState {
  players: Player[]
  currentPhase: Phase
  config: GameConfig
  round: RoundData
  usedWords: Record<string, string[]>
  updatedAt: number
}

export type SyncStatus = 'synced' | 'pending' | 'error'

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
    hasShownStartNotice: false,
  },
  usedWords: {},
  updatedAt: 0,
}

type Action =
  | { type: 'START_GAME'; payload: { players: Player[]; config: GameConfig; round: RoundData } }
  | { type: 'NEXT_PHASE'; payload: Phase }
  | { type: 'NEXT_PLAYER' }
  | { type: 'UPDATE_ROUND'; payload: Partial<RoundData> }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'RESET_GAME' }
  | { type: 'HARD_RESET' }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'CLEAR_CATEGORY_WORDS'; payload: string }

// eslint-disable-next-line react-refresh/only-export-components
export function gameReducer(state: GameState, action: Action): GameState {
  // If loading from cloud, we accept it as is without updating the timestamp
  if (action.type === 'LOAD_STATE') {
    return action.payload
  }

  let newState: GameState

  switch (action.type) {
    case 'START_GAME':
      newState = {
        ...state,
        players: action.payload.players,
        config: action.payload.config,
        round: action.payload.round,
        currentPhase: 'REPARTO',
      }
      break
    case 'NEXT_PHASE': {
      newState = { ...state, currentPhase: action.payload }
      // If we move to PUNTUACIONES, the round is over, save the word
      if (action.payload === 'PUNTUACIONES') {
        const cat = state.round.category
        const word = state.round.word
        const currentUsed = state.usedWords[cat] || []
        if (!currentUsed.includes(word)) {
          newState.usedWords = {
            ...state.usedWords,
            [cat]: [...currentUsed, word],
          }
        }
      }
      break
    }
    case 'NEXT_PLAYER':
      newState = {
        ...state,
        round: { ...state.round, currentPlayerIndex: state.round.currentPlayerIndex + 1 },
      }
      break
    case 'UPDATE_ROUND':
      newState = {
        ...state,
        round: { ...state.round, ...action.payload },
      }
      break
    case 'UPDATE_PLAYERS':
      newState = {
        ...state,
        players: action.payload,
      }
      break
    case 'RESET_GAME':
      newState = {
        ...state,
        currentPhase: 'HOME',
        players: state.players.map((p) => ({
          ...p,
          score: 0,
          isAlive: true,
          role: null,
        })),
      }
      break
    case 'HARD_RESET':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('elfarsante_state')
        localStorage.removeItem('elfarsante_draft_players')
        localStorage.removeItem('elfarsante_draft_config')
        localStorage.removeItem('elfarsante_sync_uid')
      }
      return initialState
    case 'CLEAR_CATEGORY_WORDS':
      newState = {
        ...state,
        usedWords: {
          ...state.usedWords,
          [action.payload]: [],
        },
      }
      break
    default:
      return state
  }

  // If state hasn't changed, don't update timestamp to avoid redundant triggers
  if (newState === state) return state

  // For any local action that changed the state, update the timestamp
  return { ...newState, updatedAt: Date.now() }
}

const GameStateContext = createContext<
  { state: GameState; dispatch: React.Dispatch<Action>; syncStatus: SyncStatus } | undefined
>(undefined)

function initGameState(initial: GameState): GameState {
  if (typeof window === 'undefined') return initial // For SSR/tests if applicable
  try {
    const savedState = localStorage.getItem('elfarsante_state')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      if (parsed && parsed.currentPhase) {
        // Ensure all players have the new stats fields if they come from an older version
        if (parsed.players) {
          parsed.players = parsed.players.map((p: Player) => ({
            ...p,
            farsanteCount: p.farsanteCount ?? 0,
            wronglyEliminatedCount: p.wronglyEliminatedCount ?? 0,
            roundsSurvivedCount: p.roundsSurvivedCount ?? 0,
            farsanteWinsCount: p.farsanteWinsCount ?? 0,
          }))
        }
        const stateToReturn = {
          ...parsed,
          usedWords: parsed.usedWords || {},
          updatedAt: parsed.updatedAt || 0,
        }
        if (
          parsed.currentPhase !== 'HOME' &&
          parsed.currentPhase !== 'PUNTUACIONES' &&
          parsed.currentPhase !== 'RESTORE_PROMPT'
        ) {
          stateToReturn.currentPhase = 'RESTORE_PROMPT'
        }
        return stateToReturn
      }
    }
  } catch (e) {
    console.error('Failed to parse saved state', e)
  }
  return initial
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, initGameState)
  const { activeUid } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const lastActiveUidRef = useRef<string | null>(activeUid)
  const stateRef = useRef<GameState>(state)
  const lastPushedUpdateRef = useRef<number>(state.updatedAt)

  // Keep stateRef up to date for listeners
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Cloud Listener: Update local state when Cloud changes (from other devices)
  useEffect(() => {
    if (!activeUid) return

    const docRef = doc(db, 'users', activeUid)
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists() && !snap.metadata.hasPendingWrites) {
        const cloudState = snap.data() as GameState
        const currentState = stateRef.current

        // Only accept if cloud is newer than local. Resolves race conditions and echo loops.
        if (
          cloudState.updatedAt > currentState.updatedAt &&
          currentState.currentPhase !== 'RESTORE_PROMPT'
        ) {
          // Update our tracker so we don't echo this back
          lastPushedUpdateRef.current = cloudState.updatedAt
          dispatch({ type: 'LOAD_STATE', payload: cloudState })
          setSyncStatus('synced')
        }
      }
    })

    return unsubscribe
  }, [activeUid]) // Remove currentPhase from deps to prevent re-subscriptions on phase change

  // Network listener to handle offline status
  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced')
    const handleOffline = () => setSyncStatus('pending')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Local & Cloud Persister: Update LocalStorage and Cloud when state changes locally
  useEffect(() => {
    if (state.currentPhase !== 'RESTORE_PROMPT') {
      // 1. Sync to LocalStorage (Immediate fallback)
      localStorage.setItem('elfarsante_state', JSON.stringify(state))

      // 2. Sync to Cloud (If authenticated)
      if (activeUid) {
        // If the UID has changed (linking/unlinking), don't push local state immediately
        // Wait for the onSnapshot listener to pull the remote state first
        if (lastActiveUidRef.current !== activeUid) {
          lastActiveUidRef.current = activeUid
          return
        }

        // Only push if this state version is newer than what we last pushed/received.
        // Prevents the "Echo Loop" where Device B receives A's write and writes it back.
        if (state.updatedAt > lastPushedUpdateRef.current) {
          lastPushedUpdateRef.current = state.updatedAt

          // Defer pending status to avoid cascading render warning in effect
          setTimeout(() => setSyncStatus((prev) => (prev !== 'pending' ? 'pending' : prev)), 0)

          const docRef = doc(db, 'users', activeUid)
          setDoc(docRef, state, { merge: true })
            .then(() => {
              setSyncStatus((prev) => (prev !== 'synced' ? 'synced' : prev))
            })
            .catch((err) => {
              console.error('Failed to sync to Cloud:', err)
              setSyncStatus('error')
            })
        }
      }
    }
  }, [state, activeUid])

  return (
    <GameStateContext.Provider value={{ state, dispatch, syncStatus }}>
      {children}
    </GameStateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameState() {
  const context = useContext(GameStateContext)
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider')
  }
  return context
}
