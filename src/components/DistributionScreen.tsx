import { useState, useRef } from 'react'
import { useGameState } from '../context/GameStateContext'
import { useSFX } from '../hooks/useSFX'

export function DistributionScreen() {
  const { state, dispatch } = useGameState()
  const { playTick } = useSFX()
  const [isRevealed, setIsRevealed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentPlayer = state.players[state.round.currentPlayerIndex]
  const isLastPlayer = state.round.currentPlayerIndex === state.players.length - 1

  const handleStartReveal = () => {
    setIsRevealed(true)
  }

  const handleEndReveal = () => {
    setIsRevealed(false)
  }

  const handleNext = () => {
    playTick()
    if (isLastPlayer) {
      dispatch({ type: 'NEXT_PHASE', payload: 'DEBATE' })
    } else {
      dispatch({ type: 'NEXT_PLAYER' })
    }
  }

  if (!currentPlayer) return null

  return (
    <div className="flex flex-col items-center justify-start px-container-padding py-2 relative z-0 flex-grow w-full max-w-md mx-auto overflow-y-auto pb-[120px]">
      {/* Top Text Content */}
      <div className="text-center w-full flex flex-col gap-1 items-center mt-2">
        <h2 className="font-h1 text-[32px] font-black text-primary-container drop-shadow-[0_0_15px_rgba(0,229,255,0.6)] uppercase tracking-wider leading-tight">
          Turno de <br />
          <span className="text-white">{currentPlayer.name}</span>
        </h2>
        <p className="font-body-md text-secondary max-w-xs mx-auto text-xs opacity-80">
          Asegúrate de que nadie más mire la pantalla
        </p>
      </div>

      {/* Central Interactive Area */}
      <div
        ref={containerRef}
        className={`w-full max-w-[260px] aspect-[3/4] bg-[#1A1A24] border border-primary-container rounded-xl flex flex-col items-center justify-center p-4 gap-4 shadow-[0_0_15px_rgba(0,229,255,0.1)] relative overflow-hidden group select-none touch-none cursor-pointer transition-colors duration-300 mt-8 mb-8 ${isRevealed ? 'bg-primary-container/10 border-primary shadow-[0_0_30px_rgba(0,229,255,0.3)]' : ''}`}
        onPointerDown={handleStartReveal}
        onPointerUp={handleEndReveal}
        onPointerLeave={handleEndReveal}
        onPointerCancel={handleEndReveal}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className={`absolute inset-0 bg-primary-container opacity-0 transition-opacity duration-300 pointer-events-none rounded-xl ${isRevealed ? 'opacity-10' : 'group-active:opacity-10'}`}
        ></div>

        {isRevealed ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <h3 className="font-h2 text-h2 text-primary-container">Tu rol:</h3>
            <p className="font-h1 text-[36px] font-black text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.8)] text-center leading-tight">
              {currentPlayer.role === 'farsante' ? 'ERES EL FARSANTE' : state.round.word}
            </p>
            <p className="font-body-md text-on-surface-variant text-center mt-2">
              {currentPlayer.role === 'farsante'
                ? 'Intenta pasar desapercibido.'
                : `Categoría: ${state.round.category}`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-subtle-pulse">
            <div className="w-32 h-32 rounded-full border border-primary-container/30 flex items-center justify-center relative">
              <span
                className="material-symbols-outlined text-primary-container text-[80px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                fingerprint
              </span>
              <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.2)] pointer-events-none"></div>
            </div>
            <span
              className="material-symbols-outlined text-primary-container text-2xl animate-bounce"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              keyboard_double_arrow_up
            </span>
            <p className="font-body-md text-body-md text-on-surface text-center px-4 leading-tight">
              Mantén presionado para revelar
            </p>
          </div>
        )}

        <div
          className={`absolute top-0 left-0 w-full h-1 bg-primary-container/50 shadow-[0_0_10px_rgba(0,229,255,0.8)] opacity-0 transition-opacity ${isRevealed ? 'opacity-100' : ''}`}
          style={{ transform: isRevealed ? 'translateY(100%)' : 'translateY(0)' }}
        ></div>
      </div>

      {/* Fixed bottom Action */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-container-padding bg-gradient-to-t from-background via-background to-transparent pt-12 pointer-events-none">
        <div className="w-full max-w-sm mx-auto pointer-events-auto">
          <button
            onClick={handleNext}
            className="w-full py-4 border-2 border-primary-container text-primary-container font-label-pill text-label-pill rounded-lg hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:bg-primary-container/10 transition-all duration-300 uppercase tracking-wider active:scale-[0.98]"
          >
            {isLastPlayer ? 'Empezar Debate' : 'Siguiente Jugador'}
          </button>
        </div>
      </div>
    </div>
  )
}
