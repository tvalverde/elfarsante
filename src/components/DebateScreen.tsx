import { useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useTimer } from '../hooks/useTimer';
import { CATEGORY_LABELS } from '../data/dictionary';

export function DebateScreen() {
  const { state, dispatch } = useGameState();
  
  const handleTimeUp = () => {
    alert("¡TIEMPO AGOTADO! Votación forzada.");
    dispatch({ type: 'UPDATE_ROUND', payload: { remainingTime: 0 } });
    dispatch({ type: 'NEXT_PHASE', payload: 'VOTACION' });
  };

  const timer = useTimer(state.round.remainingTime, handleTimeUp);

  // Sync timer seconds with global state to persist on refresh
  useEffect(() => {
    if (timer.isActive && timer.seconds !== state.round.remainingTime) {
      dispatch({ type: 'UPDATE_ROUND', payload: { remainingTime: timer.seconds } });
    }
  }, [timer.seconds, timer.isActive, dispatch, state.round.remainingTime]);

  const handleAcusar = () => {
    timer.pause();
    dispatch({ type: 'UPDATE_ROUND', payload: { remainingTime: timer.seconds } });
    dispatch({ type: 'NEXT_PHASE', payload: 'VOTACION' });
  };

  const isUrgent = timer.seconds <= 30;

  return (
    <div className="flex flex-col items-center justify-start p-container-padding w-full max-w-3xl mx-auto gap-section-margin flex-grow mt-8">
      {/* Category Header */}
      <section className="flex flex-col items-center gap-unit w-full">
        <p className="font-body-md text-body-md text-on-surface-variant">Categorías activas:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {state.config.selectedCategories.map(cat => (
            <div key={cat} className="px-4 py-2 border border-primary-container rounded-full bg-primary-container/10 flex items-center gap-2 neon-glow-cyan">
              <span className="font-label-pill text-label-pill text-on-background">{CATEGORY_LABELS[cat] || cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Giant Timer */}
      <section className="w-full flex justify-center items-center py-4">
        <div className={`font-h1 text-[80px] leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-colors duration-300 ${isUrgent ? 'text-neon-red drop-shadow-[0_0_20px_rgba(255,42,95,0.6)] animate-pulse' : 'text-on-background'}`}>
          {state.config.blindTimer && timer.seconds > 30 ? (
             <span className="animate-pulse">?:??</span>
          ) : (
            timer.formattedTime
          )}
        </div>
      </section>

      {/* Action Button */}
      <section className="w-full">
        <button 
          onClick={handleAcusar}
          className="w-full bg-neon-red text-white font-h2 text-h2 py-6 rounded-xl flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all active:scale-95 neon-glow-red uppercase tracking-wide"
        >
          <span>DETENER Y ACUSAR</span>
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
        </button>
      </section>

      {/* Players List */}
      <section className="w-full bg-cyber-noir-surface rounded-xl border border-outline-variant p-element-gap flex flex-col gap-unit mb-8">
        {state.players.map((player) => (
          <div 
            key={player.id} 
            className={`flex items-center justify-between p-4 rounded-lg bg-surface-container-low border ${player.isAlive ? 'border-outline/20' : 'border-error-container/30 opacity-40 grayscale blur-[0.5px]'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${player.isAlive ? 'bg-surface-container-high border-primary-container/30' : 'bg-surface-container-high border-outline/30'}`}>
                {player.isAlive ? (
                  <span className="material-symbols-outlined text-primary-container">person</span>
                ) : (
                  <span className="material-symbols-outlined text-outline">skull</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-body-lg text-body-lg leading-tight ${player.isAlive ? 'text-on-background font-medium' : 'text-outline line-through'}`}>
                  {player.name}
                </span>
                {state.round.startingPlayerId === player.id && player.isAlive && (
                  <span className="text-[10px] text-primary-container font-label-pill uppercase tracking-widest">¡Empieza!</span>
                )}
              </div>
            </div>
            <div className={`font-label-pill text-label-pill px-3 py-1 rounded-full ${player.isAlive ? 'text-primary-container bg-primary-container/10' : 'text-outline border border-outline/30'}`}>
              {player.score} pts
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}