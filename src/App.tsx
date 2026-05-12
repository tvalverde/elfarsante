import { useState, useEffect } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { DistributionScreen } from './components/DistributionScreen'
import { DebateScreen } from './components/DebateScreen'
import { VotingScreen } from './components/VotingScreen'
import { ResultScreen } from './components/ResultScreen'
import { ScoreScreen } from './components/ScoreScreen'
import { RestorePromptScreen } from './components/RestorePromptScreen'
import { useGameState } from './context/GameStateContext'
import { useWakeLock } from './hooks/useWakeLock'
import { NeonModal } from './components/ui/NeonModal'
import { CyberToast } from './components/ui/CyberToast'

declare const __APP_VERSION__: string

function App() {
  const { state, dispatch } = useGameState()
  const { currentPhase } = state
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Keep screen awake globally
  useWakeLock(true)

  // Scroll to top on phase change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [currentPhase])

  // Return to RESTORE_PROMPT when the app goes to background during an active game
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (
          currentPhase !== 'HOME' &&
          currentPhase !== 'PUNTUACIONES' &&
          currentPhase !== 'RESTORE_PROMPT'
        ) {
          dispatch({ type: 'NEXT_PHASE', payload: 'RESTORE_PROMPT' })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentPhase, dispatch])

  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container bg-background">
      {/* TopAppBar */}
      <header className="docked full-width top-0 border-b border-neutral-800 flat no-shadows bg-neutral-950 flex justify-between items-center px-6 h-16 w-full z-40 sticky shrink-0">
        <div className="w-10"></div> {/* Spacer to keep title centered */}
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)] font-h1 uppercase tracking-widest pointer-events-none leading-none">
            EL FARSANTE
          </h1>
          <span className="text-[10px] text-cyan-800 font-bold tracking-tighter uppercase mt-0.5">
            v{__APP_VERSION__}
          </span>
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="text-neutral-500 hover:text-cyan-300 transition-colors active:scale-95 duration-150 p-2 -mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container"
        >
          <span className="material-symbols-outlined text-2xl">help_outline</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-start w-full relative z-0 h-full">
        {state.currentPhase === 'RESTORE_PROMPT' && <RestorePromptScreen />}
        {state.currentPhase === 'HOME' && <HomeScreen />}
        {state.currentPhase === 'REPARTO' && <DistributionScreen />}
        {state.currentPhase === 'DEBATE' && <DebateScreen />}
        {state.currentPhase === 'VOTACION' && <VotingScreen />}
        {state.currentPhase === 'RESULTADO' && <ResultScreen />}
        {state.currentPhase === 'PUNTUACIONES' && <ScoreScreen />}
      </main>

      {/* Modals & Toasts */}
      <NeonModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Instrucciones">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2">
              Objetivo
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>
                <span className="text-white font-semibold">Inocentes:</span> Encontrar al Farsante
                antes de ser superados en número.
              </li>
              <li>
                <span className="text-white font-semibold">Farsante:</span> Pasar desapercibido y
                deducir la palabra secreta.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2">
              Reglas
            </h3>
            <ol className="list-decimal list-inside space-y-2 opacity-90">
              <li>Todos reciben la palabra secreta excepto el Farsante.</li>
              <li>
                Por turnos, decid{' '}
                <span className="text-white font-semibold underline decoration-primary-container">
                  UNA SOLA PALABRA
                </span>{' '}
                relacionada con el secreto.
              </li>
              <li>Tras el debate, votad al sospechoso.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2">
              Sistema de Puntos
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <span className="text-primary-container">✅</span>
                <p>
                  <span className="text-white font-semibold">Inocentes:</span> +1 pt por descubrir
                  al Farsante.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-neon-red">💔</span>
                <p>
                  <span className="text-white font-semibold">Error:</span> +1 pt de consolación si
                  eres eliminado siendo inocente.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-container">🎭</span>
                <p>
                  <span className="text-white font-semibold">Farsante Audaz:</span> +1 pt si eres
                  descubierto pero adivinas la palabra.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-container">🏆</span>
                <p>
                  <span className="text-white font-semibold">Victoria Farsante:</span> +2 pts si
                  sobrevives hasta el final.
                </p>
              </div>
            </div>
          </section>

          <p className="text-[10px] text-outline text-center uppercase tracking-widest mt-4">
            v{__APP_VERSION__} • Diseñado para la infamia
          </p>
        </div>
      </NeonModal>

      <CyberToast />
    </div>
  )
}

export default App
