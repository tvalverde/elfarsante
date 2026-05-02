import { useGameState } from '../context/GameStateContext';

export function VotingScreen() {
  const { state, dispatch } = useGameState();
  const alivePlayers = state.players.filter(p => p.isAlive);

  const handleVote = (playerId: string) => {
    dispatch({ type: 'UPDATE_ROUND', payload: { accusedId: playerId } });
    dispatch({ type: 'NEXT_PHASE', payload: 'RESULTADO' });
  };

  return (
    <div className="flex flex-col items-center justify-start p-container-padding w-full max-w-md mx-auto gap-section-margin flex-grow mt-8">
      <h2 className="font-h1 text-h1 text-on-surface text-center mb-8 uppercase tracking-widest text-primary-fixed-dim drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
        ¿Quién es el Farsante?
      </h2>
      
      <p className="font-body-md text-body-md text-outline mt-2 text-center mb-4">Selecciona al jugador acusado</p>

      <div className="w-full flex flex-col gap-4">
        {alivePlayers.map(player => (
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
  );
}
