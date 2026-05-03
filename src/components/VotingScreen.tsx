import { useGameState } from '../context/GameStateContext'

export function VotingScreen() {
  const { state, dispatch } = useGameState()
  const alivePlayers = state.players.filter((p) => p.isAlive)

  const handleVote = (playerId: string) => {
    dispatch({ type: 'UPDATE_ROUND', payload: { accusedId: playerId } })
    dispatch({ type: 'NEXT_PHASE', payload: 'RESULTADO' })
  }

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-md mx-auto flex-grow">
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md w-full pt-8 pb-6 px-container-padding border-b border-outline-variant/30 flex flex-col items-center">
        <h2 className="font-h1 text-h1 text-on-surface text-center uppercase tracking-widest text-primary-fixed-dim drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
          ¿Quién es el Farsante?
        </h2>
        <p className="font-body-md text-body-md text-outline mt-2 text-center">
          Selecciona al jugador acusado
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 p-container-padding pb-8">
        {alivePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => handleVote(player.id)}
            className="w-full p-6 border-2 border-outline-variant rounded-xl text-center font-body-lg text-body-lg hover:border-primary-container hover:bg-primary-container/10 hover:text-primary-container hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all active:scale-95"
          >
            {player.name}
          </button>
        ))}
      </div>
    </div>
  )
}
