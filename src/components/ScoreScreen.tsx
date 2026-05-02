import { useGameState } from '../context/GameStateContext';
import { NeonButton } from './ui/NeonButton';

export function ScoreScreen() {
  const { state, dispatch } = useGameState();
  
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const highestScore = sortedPlayers[0]?.score || 0;
  const isTournamentOver = state.config.scoreLimit !== null && highestScore >= state.config.scoreLimit;

  const handleNextRound = () => {
    if (isTournamentOver) {
      dispatch({ type: 'RESET_GAME' });
    } else {
      dispatch({ type: 'NEXT_PHASE', payload: 'HOME' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-container-padding w-full max-w-md mx-auto gap-section-margin flex-grow mt-8">
      <section className="flex flex-col items-center justify-center mb-4 w-full text-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary-container drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h2 className="font-h1 text-[32px] text-primary-container tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
            {isTournamentOver ? '¡CAMPEÓN!' : 'PUNTUACIONES'}
          </h2>
        </div>
        <p className="font-body-md text-body-md text-outline mt-2 text-center">
          {isTournamentOver ? 'La partida ha finalizado' : 'Clasificación Actual'}
        </p>
      </section>

      <section className="w-full bg-surface-container-high rounded-xl border border-outline-variant p-2 flex flex-col gap-2 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container rounded-full blur-[60px] opacity-10 pointer-events-none"></div>
        
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="flex justify-between items-center bg-surface-container p-4 rounded-lg border border-outline-variant z-10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary-container/30 text-primary-container font-label-pill">
                {index + 1}
              </div>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">{player.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-pill text-label-pill text-primary-container text-lg">{player.score} pts</span>
              {index === 0 && <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
            </div>
          </div>
        ))}
      </section>

      <div className="w-full mt-auto mb-8">
        <NeonButton fullWidth onClick={handleNextRound}>
          {isTournamentOver ? 'FINALIZAR PARTIDA' : 'SIGUIENTE RONDA'}
        </NeonButton>
      </div>
    </div>
  );
}
