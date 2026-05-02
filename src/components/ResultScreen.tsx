import { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';

export function ResultScreen() {
  const { state, dispatch } = useGameState();
  const [isProcessing, setIsProcessing] = useState(true);

  const accused = state.players.find(p => p.id === state.round.accusedId);
  const isFarsante = state.round.farsanteIds.includes(accused?.id || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
      
      const aliveInnocentsCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role !== 'farsante').length;
      const aliveFarsantesCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role === 'farsante').length;
      
      // El farsante gana si logra igualar en número a los inocentes (descarte matemático sin salvación)
      const farsanteWins = !isFarsante && (aliveFarsantesCount >= aliveInnocentsCount);

      const updatedPlayers = state.players.map(p => {
        if (isFarsante) {
          // Si atraparon a UN farsante. Note: for multiple, game might need to continue, 
          // but for MVP standard: Catching any farsante ends the round in victory for the village.
          if (p.role !== 'farsante' && p.isAlive) {
            return { ...p, score: p.score + 1 };
          }
        } else {
          // Si acusaron a un inocente, este muere pero gana un punto.
          if (p.id === accused?.id) {
            return { ...p, isAlive: false, score: p.score + 1 };
          }
          // Si los Farsantes ganan por descarte matemático, reciben +2 puntos.
          if (farsanteWins && p.role === 'farsante') {
            return { ...p, score: p.score + 2 };
          }
        }
        return p;
      });

      dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });

      // Apply Penalty on time if fail
      if (!isFarsante && state.config.penaltyOnFail && !farsanteWins) {
        dispatch({ type: 'UPDATE_ROUND', payload: { remainingTime: Math.max(0, state.round.remainingTime - 60) } });
      }

    }, 3000);

    return () => clearTimeout(timer);
  }, [accused?.id, dispatch, isFarsante, state.players, state.config.penaltyOnFail, state.round.remainingTime]);

  const handleNext = () => {
    if (isFarsante) {
      dispatch({ type: 'NEXT_PHASE', payload: 'PUNTUACIONES' });
    } else {
      const aliveInnocentsCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role !== 'farsante').length;
      const aliveFarsantesCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role === 'farsante').length;
      
      if (aliveFarsantesCount >= aliveInnocentsCount) {
        dispatch({ type: 'NEXT_PHASE', payload: 'PUNTUACIONES' });
      } else {
        dispatch({ type: 'NEXT_PHASE', payload: 'DEBATE' });
      }
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        <h2 className="font-h1 text-[40px] animate-pulse text-primary-container drop-shadow-[0_0_15px_rgba(0,229,255,0.6)] uppercase tracking-widest text-center px-4">
          Analizando...
        </h2>
      </div>
    );
  }

  const textColor = isFarsante ? 'text-[#00FF88]' : 'text-neon-red';
  const glowClass = isFarsante ? 'drop-shadow-[0_0_20px_rgba(0,255,136,0.6)]' : 'drop-shadow-[0_0_20px_rgba(255,42,95,0.6)]';
  const icon = isFarsante ? 'check_circle' : 'cancel';

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-container-padding max-w-2xl mx-auto text-center w-full relative z-10">
      <div className="mb-element-gap relative">
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${isFarsante ? 'bg-[#00FF88]' : 'bg-neon-red'}`}></div>
        <span className={`material-symbols-outlined text-[100px] relative z-10 ${textColor} ${glowClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      
      <h2 className={`font-h1 text-[36px] mb-unit uppercase leading-tight ${textColor} ${glowClass}`}>
        {isFarsante ? `¡${accused?.name} ERA EL FARSANTE!` : `¡${accused?.name} ERA INOCENTE!`}
      </h2>
      
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-4">
        {isFarsante ? 'El grupo ha deducido correctamente. Fin de la ronda.' : 'Se ha eliminado a un inocente. La tensión aumenta.'}
      </p>

      <button 
        onClick={handleNext}
        className="w-full max-w-sm mt-12 py-4 border border-outline-variant text-on-surface font-label-pill text-label-pill rounded-lg hover:border-primary-container hover:text-primary-container hover:bg-primary-container/5 transition-all uppercase tracking-wider active:scale-95"
      >
        Continuar
      </button>
    </div>
  );
}
