import { useState, useEffect, useRef } from 'react'
import { CyberInput } from './ui/CyberInput'
import { PillTag } from './ui/PillTag'
import { NeonButton } from './ui/NeonButton'
import { NeonModal } from './ui/NeonModal'
import { useGameState } from '../context/GameStateContext'
import { CATEGORY_LABELS, AVAILABLE_CATEGORIES } from '../data/dictionary'
import { generateNewRound } from '../utils/gameLogic'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

function loadDraftConfig() {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem('elfarsante_draft_config')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

export function HomeScreen() {
  const { state, dispatch } = useGameState()
  const { showToast } = useToast()
  const { activeUid } = useAuth()
  const lastStateUpdateRef = useRef(state.updatedAt)
  const lastUidRef = useRef(activeUid)

  const [players, setPlayers] = useState<{ id: string; name: string }[]>(() => {
    const createPlayer = (name: string) => ({
      id: Math.random().toString(36).substring(2, 9),
      name,
    })
    const saved = localStorage.getItem('elfarsante_draft_players')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) =>
            typeof p === 'string' ? createPlayer(p) : { ...p, id: p.id || createPlayer(p.name).id },
          )
        }
      } catch {
        // Silent fail for invalid JSON
      }
    }
    if (state.players && state.players.length > 0) {
      return state.players.map((p) => createPlayer(p.name))
    }
    return []
  })

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const draft = loadDraftConfig()
    return draft?.selectedCategories ?? state.config.selectedCategories
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showTournamentWarning, setShowTournamentWarning] = useState(false)
  const [timerDuration, setTimerDuration] = useState(() => {
    const draft = loadDraftConfig()
    return draft?.timerDuration ?? state.config.timerDuration
  })
  const [farsantesCount, setFarsantesCount] = useState(() => {
    const draft = loadDraftConfig()
    return draft?.farsantesCount ?? state.config.farsantesCount
  })
  const [penaltyOnFail, setPenaltyOnFail] = useState(() => {
    const draft = loadDraftConfig()
    return draft?.penaltyOnFail ?? state.config.penaltyOnFail
  })
  const [scoreLimit, setScoreLimit] = useState<number | null>(() => {
    const draft = loadDraftConfig()
    return draft?.scoreLimit !== undefined ? draft.scoreLimit : state.config.scoreLimit
  })
  const [blindTimer, setBlindTimer] = useState(() => {
    const draft = loadDraftConfig()
    return draft?.blindTimer ?? state.config.blindTimer
  })

  useEffect(() => {
    localStorage.setItem(
      'elfarsante_draft_config',
      JSON.stringify({
        selectedCategories,
        timerDuration,
        farsantesCount,
        penaltyOnFail,
        scoreLimit,
        blindTimer,
      }),
    )
  }, [selectedCategories, timerDuration, farsantesCount, penaltyOnFail, scoreLimit, blindTimer])

  useEffect(() => {
    localStorage.setItem('elfarsante_draft_players', JSON.stringify(players.map((p) => p.name)))
  }, [players])

  // Detect when the state has been updated from the cloud (typically after a link/unlink or external change)
  // to refresh the local draft fields.
  useEffect(() => {
    const isNewCloudState = state.updatedAt > lastStateUpdateRef.current
    const isFirstLoadAfterLink = lastUidRef.current !== activeUid

    if (isNewCloudState || isFirstLoadAfterLink) {
      lastStateUpdateRef.current = state.updatedAt
      lastUidRef.current = activeUid

      // Only override if the new state has actual player data to avoid wiping current draft with a fresh state
      if (state.players && state.players.length > 0) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setPlayers(
          state.players.map((p) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: p.name,
          })),
        )
        setSelectedCategories(state.config.selectedCategories)
        setTimerDuration(state.config.timerDuration)
        setFarsantesCount(state.config.farsantesCount)
        setPenaltyOnFail(state.config.penaltyOnFail)
        setScoreLimit(state.config.scoreLimit)
        setBlindTimer(state.config.blindTimer)
        /* eslint-enable react-hooks/set-state-in-effect */

        // Clear local storage drafts so they don't override on next cold boot if they were stale
        localStorage.removeItem('elfarsante_draft_players')
        localStorage.removeItem('elfarsante_draft_config')
      }
    }
  }, [state, activeUid])

  const handleAddPlayer = () => {
    setPlayers([...players, { id: Math.random().toString(36).substring(2, 9), name: '' }])
  }

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players]
    newPlayers[index].name = value
    setPlayers(newPlayers)
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const toggleCategory = (category: string) => {
    if (category === 'aleatorio') {
      setSelectedCategories(['aleatorio'])
    } else {
      const newSelected = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories.filter((c) => c !== 'aleatorio'), category]

      if (newSelected.length === 0) {
        setSelectedCategories(['aleatorio'])
      } else {
        setSelectedCategories(newSelected)
      }
    }
  }

  const handleStartGame = (forceReset = false) => {
    const validPlayers = players.filter((p) => p.name.trim() !== '').map((p) => p.name)

    // Evaluate if we are starting a NEW tournament and need to warn the user
    const currentScores = validPlayers.map((name) => {
      const existing = state.players.find((p) => p.name === name)
      return existing ? existing.score : 0
    })
    const hasExistingScores = currentScores.some((score) => score > 0)
    const highestScore = Math.max(0, ...currentScores)

    const prevScoreLimit = state.config.scoreLimit
    const isNewTournament =
      prevScoreLimit === null ||
      scoreLimit !== prevScoreLimit ||
      highestScore >= (prevScoreLimit || 0)

    // Intercept if starting a tournament with existing scores that shouldn't carry over
    if (scoreLimit !== null && hasExistingScores && isNewTournament && !forceReset) {
      setShowTournamentWarning(true)
      return
    }

    // Try to activate fullscreen only on mobile devices
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
      if (isMobile && document.documentElement.requestFullscreen) {
        // We request it regardless of standalone mode as some devices (Xiaomi) ignore manifest settings
        document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})

        // Hint: try to lock orientation, which sometimes forces the OS to hide system bars
        if (screen.orientation && 'lock' in screen.orientation) {
          const lockOrientation = screen.orientation.lock.bind(screen.orientation)
          if (lockOrientation) {
            lockOrientation('portrait' as OrientationLockType).catch(() => {})
          }
        }
      }
    } catch {
      // Silent fallback
    }

    if (validPlayers.length < 3) {
      showToast('Se necesitan al menos 3 jugadores.', 'error')
      return
    }

    const uniquePlayers = new Set(validPlayers)
    if (uniquePlayers.size !== validPlayers.length) {
      showToast('Los nombres de los jugadores deben ser únicos.', 'error')
      return
    }

    if (farsantesCount > 1 && validPlayers.length < 5) {
      showToast('Para jugar con 2 farsantes, se necesitan al menos 5 jugadores.', 'error')
      return
    }

    const { newPlayers, newRound, exhaustedCategory } = generateNewRound({
      currentPlayers: state.players,
      validPlayerNames: validPlayers,
      config: {
        selectedCategories,
        timerDuration,
        farsantesCount,
        penaltyOnFail,
        scoreLimit,
        blindTimer,
      },
      usedWords: state.usedWords,
      forceResetScores: forceReset,
    })

    if (exhaustedCategory) {
      dispatch({ type: 'CLEAR_CATEGORY_WORDS', payload: exhaustedCategory })
      showToast(
        `Palabras de ${CATEGORY_LABELS[exhaustedCategory as keyof typeof CATEGORY_LABELS]} agotadas. Empezando de nuevo.`,
        'info',
      )
    }

    dispatch({
      type: 'START_GAME',
      payload: {
        players: newPlayers,
        config: {
          timerDuration,
          selectedCategories,
          farsantesCount,
          penaltyOnFail,
          scoreLimit,
          blindTimer,
        },
        round: newRound,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-md mx-auto px-container-padding py-section-margin gap-section-margin pb-[120px]">
      {/* Players Panel */}
      <section className="w-full flex flex-col gap-element-gap">
        <div className="flex justify-between items-end mb-2">
          <h2 className="font-h2 text-h2 text-on-surface">Jugadores</h2>
          <button
            onClick={() => dispatch({ type: 'NEXT_PHASE', payload: 'PUNTUACIONES' })}
            className="flex items-center gap-1 text-primary-container text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">emoji_events</span>
            Marcadores
          </button>
        </div>
        <div className="bg-surface-container-high rounded-xl p-container-padding flex flex-col gap-element-gap border border-surface-bright">
          <div className="flex flex-col gap-3">
            {players.map((player, index) => (
              <CyberInput
                key={player.id}
                value={player.name}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                onRemove={() => handleRemovePlayer(index)}
                placeholder="Nombre (máx. 15)"
                maxLength={15}
              />
            ))}
          </div>
          <NeonButton
            variant="ghost"
            onClick={handleAddPlayer}
            className="mt-4 bg-surface-container/50 border border-outline-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Añadir jugador
          </NeonButton>
        </div>
      </section>

      {/* Game Mode Panel */}
      <section className="w-full flex flex-col gap-element-gap">
        <h2 className="font-h2 text-h2 text-on-surface mb-2">Modo de Juego</h2>
        <div className="grid grid-cols-2 gap-3">
          <NeonButton
            variant={scoreLimit === null ? 'primary' : 'ghost'}
            onClick={() => setScoreLimit(null)}
            className={scoreLimit === null ? '' : 'bg-surface-container/50 border-outline-variant'}
          >
            PARTIDA LIBRE
          </NeonButton>
          <NeonButton
            variant={scoreLimit !== null ? 'primary' : 'ghost'}
            onClick={() => {
              if (scoreLimit === null) setScoreLimit(5)
            }}
            className={scoreLimit !== null ? '' : 'bg-surface-container/50 border-outline-variant'}
          >
            MODO TORNEO
          </NeonButton>
        </div>

        {scoreLimit !== null && (
          <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant mt-2">
            <label className="flex flex-col gap-2 font-body-md text-on-surface">
              <span className="font-semibold text-primary-container text-xs uppercase tracking-wider">
                Meta de Puntos:
              </span>
              <select
                value={scoreLimit}
                onChange={(e) => setScoreLimit(Number(e.target.value))}
                className="bg-surface-container-high border border-outline-variant text-on-surface p-3 rounded-lg focus:border-primary-container focus:ring-0 outline-none w-full"
              >
                <option value={5}>A 5 Puntos</option>
                <option value={10}>A 10 Puntos</option>
                <option value={15}>A 15 Puntos</option>
                <option value={20}>A 20 Puntos</option>
              </select>
            </label>
            <p className="text-[10px] text-outline italic">
              El primer jugador en alcanzar esta puntuación ganará el torneo.
            </p>
          </div>
        )}
      </section>

      {/* Categories Panel */}
      <section className="w-full flex flex-col gap-element-gap">
        <h2 className="font-h2 text-h2 text-on-surface mb-2">Categorías</h2>
        <div className="flex flex-wrap gap-3">
          {AVAILABLE_CATEGORIES.map((category) => {
            const icons: Record<string, string> = {
              aleatorio: 'shuffle',
              profesiones: 'work',
              comida_bebida: 'restaurant',
              animales: 'pets',
              deportes: 'sports_soccer',
              lugares: 'public',
              objetos_casa: 'chair',
              summer: 'sunny',
              fashion: 'checkroom',
              christmas: 'park',
            }
            return (
              <PillTag
                key={category}
                active={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
                icon={icons[category]}
                className={
                  category === 'aleatorio'
                    ? selectedCategories.includes('aleatorio')
                      ? '!bg-primary-container !text-background border-white'
                      : 'border-white/50 text-white/70'
                    : ''
                }
              >
                {CATEGORY_LABELS[category]}
              </PillTag>
            )
          })}
        </div>
      </section>
      <div className="w-full flex flex-col items-center mt-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-outline hover:text-primary-container transition-colors text-sm font-medium tracking-wide flex items-center justify-center gap-1 mx-auto"
        >
          Opciones de Partida
          <span
            className={`material-symbols-outlined text-xs transition-transform ${showSettings ? 'rotate-180' : ''}`}
          >
            arrow_drop_down
          </span>
        </button>

        {showSettings && (
          <div className="mt-4 p-6 w-full bg-surface-container rounded-xl border border-outline-variant animate-in fade-in slide-in-from-top-2 flex flex-col gap-6">
            {/* Setting 1: Tiempo */}
            <label className="flex flex-col gap-2 font-body-md text-on-surface">
              <span className="font-semibold text-primary-container">Tiempo por ronda:</span>
              <select
                value={timerDuration / 60}
                onChange={(e) => setTimerDuration(Number(e.target.value) * 60)}
                className="bg-surface-container-high border border-outline-variant text-on-surface p-3 rounded-lg focus:border-primary-container focus:ring-0 outline-none w-full"
              >
                <option value={3}>3 minutos</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
              </select>
            </label>

            {/* Setting 2: Farsantes */}
            <label className="flex flex-col gap-2 font-body-md text-on-surface">
              <span className="font-semibold text-primary-container">Nº de Farsantes:</span>
              <select
                value={farsantesCount}
                onChange={(e) => setFarsantesCount(Number(e.target.value))}
                className="bg-surface-container-high border border-outline-variant text-on-surface p-3 rounded-lg focus:border-primary-container focus:ring-0 outline-none w-full"
              >
                <option value={1}>1 Farsante</option>
                <option value={2}>2 Farsantes (Requiere 5+ jug.)</option>
              </select>
            </label>

            {/* Setting 4: Penalización y Ciego */}
            <div className="flex flex-col gap-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${penaltyOnFail ? 'bg-primary-container border-primary-container' : 'border-outline-variant group-hover:border-primary-container'}`}
                >
                  {penaltyOnFail && (
                    <span
                      className="material-symbols-outlined text-[16px] text-on-primary-fixed"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={penaltyOnFail}
                  onChange={() => setPenaltyOnFail(!penaltyOnFail)}
                  className="hidden"
                />
                <span className="font-body-md text-on-surface">
                  Penalización de tiempo (-60s por error)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${blindTimer ? 'bg-primary-container border-primary-container' : 'border-outline-variant group-hover:border-primary-container'}`}
                >
                  {blindTimer && (
                    <span
                      className="material-symbols-outlined text-[16px] text-on-primary-fixed"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={blindTimer}
                  onChange={() => setBlindTimer(!blindTimer)}
                  className="hidden"
                />
                <span className="font-body-md text-on-surface">
                  Cronómetro Oculto (Modo Hardcore)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Warning Modal */}
      <NeonModal
        isOpen={showTournamentWarning}
        onClose={() => setShowTournamentWarning(false)}
        title="NUEVO TORNEO"
      >
        <div className="flex flex-col gap-6">
          <p className="text-on-surface-variant">
            Vas a iniciar un <span className="text-primary-container font-bold">Torneo</span>. Los
            marcadores actuales se reiniciarán a cero.
          </p>
          <p className="text-on-surface-variant font-bold">¿Quieres continuar?</p>
          <div className="flex flex-col gap-3">
            <NeonButton
              variant="primary"
              fullWidth
              onClick={() => {
                setShowTournamentWarning(false)
                handleStartGame(true)
              }}
            >
              SÍ, REINICIAR Y JUGAR
            </NeonButton>
            <NeonButton variant="ghost" fullWidth onClick={() => setShowTournamentWarning(false)}>
              CANCELAR
            </NeonButton>
          </div>
        </div>
      </NeonModal>

      {/* Fixed bottom full-width button */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-container-padding bg-gradient-to-t from-background via-background to-transparent pt-12 pointer-events-none">
        <NeonButton fullWidth onClick={() => handleStartGame()}>
          ¡JUGAR!
        </NeonButton>
      </div>
    </div>
  )
}
