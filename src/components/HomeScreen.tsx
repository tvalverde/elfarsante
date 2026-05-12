import { useState, useEffect } from 'react'
import { CyberInput } from './ui/CyberInput'
import { PillTag } from './ui/PillTag'
import { NeonButton } from './ui/NeonButton'
import { NeonModal } from './ui/NeonModal'
import { useGameState, type Player } from '../context/GameStateContext'
import { WORD_LISTS, CATEGORY_LABELS } from '../data/dictionary'
import { useToast } from '../context/ToastContext'

const AVAILABLE_CATEGORIES = [
  'aleatorio',
  'comida_bebida',
  'animales',
  'deportes',
  'lugares',
  'objetos_casa',
  'summer',
  'fashion',
  'christmas',
  'profesiones',
]

export function HomeScreen() {
  const { state, dispatch } = useGameState()
  const { showToast } = useToast()
  const [players, setPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem('elfarsante_draft_players')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        // Silent fail for invalid JSON
      }
    }
    // Pre-load names if returning from a previous game (even finished) and no draft exists
    if (state.players && state.players.length > 0) {
      return state.players.map((p) => p.name)
    }
    return []
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.selectedCategories) return parsed.selectedCategories
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.selectedCategories
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showHardResetModal, setShowHardResetModal] = useState(false)
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.timerDuration) return parsed.timerDuration
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.timerDuration
  })
  const [farsantesCount, setFarsantesCount] = useState(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.farsantesCount) return parsed.farsantesCount
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.farsantesCount
  })
  const [penaltyOnFail, setPenaltyOnFail] = useState(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.penaltyOnFail !== undefined) return parsed.penaltyOnFail
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.penaltyOnFail
  })
  const [scoreLimit, setScoreLimit] = useState<number | null>(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.scoreLimit !== undefined) return parsed.scoreLimit
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.scoreLimit
  })
  const [blindTimer, setBlindTimer] = useState(() => {
    const saved = localStorage.getItem('elfarsante_draft_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.blindTimer !== undefined) return parsed.blindTimer
      } catch {
        // Silent fail for invalid JSON
      }
    }
    return state.config.blindTimer
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
    localStorage.setItem('elfarsante_draft_players', JSON.stringify(players))
  }, [players])

  const handleAddPlayer = () => {
    setPlayers([...players, ''])
  }

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players]
    newPlayers[index] = value
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

  const handleStartGame = () => {
    // Intentar activar pantalla completa solo en dispositivos móviles
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
      if (isMobile && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } catch {
      // Silencioso
    }

    const validPlayers = players.filter((p) => p.trim() !== '')
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

    // Role selection logic
    const farsanteIndices: number[] = []
    const allIndices = validPlayers.map((_, i) => i)

    if (validPlayers.length === 3 && farsantesCount === 1) {
      // Weighted randomness for 3 players to reduce (but not eliminate) consecutive repeats
      const previousFarsanteNames = state.players
        .filter((p) => p.role === 'farsante')
        .map((p) => p.name)

      const ticketPool: number[] = []
      allIndices.forEach((idx) => {
        const isPrevious = previousFarsanteNames.includes(validPlayers[idx])
        const tickets = isPrevious ? 1 : 4 // 1 ticket for the repeater, 4 for the fresh ones
        for (let i = 0; i < tickets; i++) ticketPool.push(idx)
      })

      const selectedIdx = ticketPool[Math.floor(Math.random() * ticketPool.length)]
      farsanteIndices.push(selectedIdx)
    } else {
      // Pure randomness for > 3 players or multiple farsantes
      while (farsanteIndices.length < farsantesCount) {
        const idx = Math.floor(Math.random() * validPlayers.length)
        if (!farsanteIndices.includes(idx)) {
          farsanteIndices.push(idx)
        }
      }
    }

    const gamePlayers: Player[] = validPlayers.map((name, index) => {
      const existingPlayer = state.players.find((p) => p.name === name)
      const isFarsante = farsanteIndices.includes(index)
      return {
        id: existingPlayer ? existingPlayer.id : `p-${index}-${Date.now()}`,
        name,
        score: existingPlayer ? existingPlayer.score : 0,
        farsanteCount: (existingPlayer ? existingPlayer.farsanteCount : 0) + (isFarsante ? 1 : 0),
        wronglyEliminatedCount: existingPlayer ? existingPlayer.wronglyEliminatedCount : 0,
        roundsSurvivedCount: existingPlayer ? existingPlayer.roundsSurvivedCount : 0,
        farsanteWinsCount: existingPlayer ? existingPlayer.farsanteWinsCount : 0,
        isAlive: true,
        role: isFarsante ? 'farsante' : 'normal',
      }
    })

    // Select random word based on selected categories
    let chosenCat: string
    if (selectedCategories.includes('aleatorio')) {
      const realCategories = AVAILABLE_CATEGORIES.filter((c) => c !== 'aleatorio')
      chosenCat = realCategories[Math.floor(Math.random() * realCategories.length)]
    } else {
      chosenCat = selectedCategories[Math.floor(Math.random() * selectedCategories.length)]
    }

    const fullWordList = WORD_LISTS[chosenCat] || []
    const usedWords = state.usedWords[chosenCat] || []
    let filteredWords = fullWordList.filter((w) => !usedWords.includes(w))

    if (filteredWords.length === 0 && fullWordList.length > 0) {
      // Agotadas: Resetear historial de esa categoría y avisar
      dispatch({ type: 'CLEAR_CATEGORY_WORDS', payload: chosenCat })
      showToast(`Palabras de ${CATEGORY_LABELS[chosenCat]} agotadas. Empezando de nuevo.`, 'info')
      filteredWords = fullWordList
    }

    let chosenWord: string
    if (filteredWords.length > 0) {
      chosenWord = filteredWords[Math.floor(Math.random() * filteredWords.length)]
    } else {
      // Fallback extremo si por algún motivo la lista está vacía
      chosenCat = 'animales'
      chosenWord = 'León'
    }

    const startingPlayerId = gamePlayers[Math.floor(Math.random() * gamePlayers.length)].id

    dispatch({
      type: 'START_GAME',
      payload: {
        players: gamePlayers,
        config: {
          timerDuration,
          selectedCategories,
          farsantesCount,
          penaltyOnFail,
          scoreLimit,
          blindTimer,
        },
        round: {
          word: chosenWord,
          category: chosenCat,
          farsanteIds: gamePlayers.filter((p) => p.role === 'farsante').map((p) => p.id),
          remainingTime: timerDuration,
          accusedId: null,
          currentPlayerIndex: 0,
          startingPlayerId,
          hasShownStartNotice: false,
        },
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
                key={index}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                onRemove={() => handleRemovePlayer(index)}
                placeholder="Nombre del jugador"
              />
            ))}
          </div>
          <NeonButton variant="ghost" onClick={handleAddPlayer} className="mt-4">
            <span className="material-symbols-outlined text-sm">add</span>
            Añadir jugador
          </NeonButton>
        </div>
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
              >
                {CATEGORY_LABELS[category]}
              </PillTag>
            )
          })}
        </div>
      </section>

      {/* Advanced Settings Link */}
      <div className="w-full flex flex-col items-center mt-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-outline hover:text-primary-container transition-colors text-sm font-medium tracking-wide flex items-center justify-center gap-1 mx-auto"
        >
          Ajustes Avanzados
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

            {/* Setting 3: Límite de Puntos */}
            <label className="flex flex-col gap-2 font-body-md text-on-surface">
              <span className="font-semibold text-primary-container">Modo Torneo (Límite):</span>
              <select
                value={scoreLimit || 0}
                onChange={(e) =>
                  setScoreLimit(e.target.value === '0' ? null : Number(e.target.value))
                }
                className="bg-surface-container-high border border-outline-variant text-on-surface p-3 rounded-lg focus:border-primary-container focus:ring-0 outline-none w-full"
              >
                <option value={0}>Partida Libre (Infinito)</option>
                <option value={5}>A 5 Puntos</option>
                <option value={10}>A 10 Puntos</option>
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

            {/* Danger Zone: Hard Reset */}
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => setShowHardResetModal(true)}
                className="w-full py-3 border border-neon-red/30 text-neon-red/60 hover:text-neon-red hover:border-neon-red hover:bg-neon-red/5 transition-all uppercase text-xs font-bold tracking-[0.2em] rounded-full"
              >
                Borrar todos los datos
              </button>
            </div>
          </div>
        )}

        <NeonModal
          isOpen={showHardResetModal}
          onClose={() => setShowHardResetModal(false)}
          title="¿BORRAR TODO?"
        >
          <div className="flex flex-col gap-6">
            <p className="text-on-surface-variant">
              Esta acción es <span className="text-neon-red font-bold">IRREVERSIBLE</span>. Se
              borrarán todos los jugadores, puntuaciones e historial de palabras.
            </p>
            <div className="flex flex-col gap-3">
              <NeonButton
                variant="primary"
                fullWidth
                onClick={() => {
                  dispatch({ type: 'HARD_RESET' })
                  window.location.reload()
                }}
                className="!bg-neon-red/20 !border-neon-red !text-neon-red hover:!bg-neon-red hover:!text-white"
              >
                SÍ, BORRAR TODO
              </NeonButton>
              <NeonButton variant="ghost" fullWidth onClick={() => setShowHardResetModal(false)}>
                CANCELAR
              </NeonButton>
            </div>
          </div>
        </NeonModal>
      </div>

      {/* Fixed bottom full-width button */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-container-padding bg-gradient-to-t from-background via-background to-transparent pt-12 pointer-events-none">
        <NeonButton fullWidth onClick={handleStartGame}>
          ¡JUGAR!
        </NeonButton>
      </div>
    </div>
  )
}
