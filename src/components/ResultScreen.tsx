import { useState, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';

export function ResultScreen() {
  const { state, dispatch } = useGameState();
  const [isProcessing, setIsProcessing] = useState(true);

  const accused = state.players.find(p => p.id === state.round.accusedId);
  const isFarsante = state.round.farsanteIds.includes(accused?.id || '');

  // Calcular si los farsantes ganan por número en esta pantalla
  const aliveInnocentsCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role !== 'farsante').length;
  const aliveFarsantesCount = state.players.filter(p => p.id !== accused?.id && p.isAlive && p.role === 'farsante').length;
  const isGameOverByNumber = !isFarsante && (aliveFarsantesCount >= aliveInnocentsCount);

  useEffect(() => {
    if (!isProcessing) return;

    const timer = setTimeout(() => {
      const updatedPlayers = state.players.map(p => {
        let newPlayer = { ...p };

        // Incrementar supervivencia si el jugador termina la ronda vivo
        if (newPlayer.isAlive) {
          newPlayer.roundsSurvivedCount += 1;
        }

        if (isFarsante) {
          if (newPlayer.role !== 'farsante' && newPlayer.isAlive) {
            newPlayer.score += 1;
          }
        } else {
          if (newPlayer.id === accused?.id) {
            newPlayer.isAlive = false;
            newPlayer.score += 1;
            // Registrar eliminación injusta (Cara de culpable)
            newPlayer.wronglyEliminatedCount += 1;
          }
          if (isGameOverByNumber && newPlayer.role === 'farsante') {
            newPlayer.score += 2;
            // Registrar victoria del farsante (Maestro del engaño)
            newPlayer.farsanteWinsCount += 1;
          }
        }
        return newPlayer;
      });

      dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });

      if (!isFarsante && state.config.penaltyOnFail && !isGameOverByNumber) {
        dispatch({ type: 'UPDATE_ROUND', payload: { remainingTime: Math.max(0, state.round.remainingTime - 60) } });
      }

      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [accused?.id, isFarsante, state.config.penaltyOnFail, isProcessing, isGameOverByNumber, state.players, dispatch]);

  const handleFinishRound = (farsanteGuessed: boolean) => {
    if (farsanteGuessed) {
      const updatedPlayers = state.players.map(p => 
        p.id === accused?.id ? { ...p, score: p.score + 1, farsanteWinsCount: p.farsanteWinsCount + 1 } : p
      );
      dispatch({ type: 'UPDATE_PLAYERS', payload: updatedPlayers });
    }
    dispatch({ type: 'NEXT_PHASE', payload: 'PUNTUACIONES' });
  };

  const handleNext = () => {
    if (isFarsante) {
      // Handled by handleFinishRound
    } else {
      if (isGameOverByNumber) {
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

  let resultMessage = '';
  if (isFarsante) {
    resultMessage = 'El grupo ha deducido correctamente. Pero espera...';
  } else if (isGameOverByNumber) {
    resultMessage = '¡Victoria de los Farsantes! Han logrado superar en número a los inocentes.';
  } else {
    resultMessage = 'Se ha eliminado a un inocente. La tensión aumenta.';
  }

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
        {resultMessage}
      </p>

      {isFarsante ? (
        <div className="w-full max-w-sm mt-12 flex flex-col gap-4">
          <p className="text-primary-container font-bold uppercase tracking-widest text-sm mb-2">¿Ha adivinado la palabra secreta?</p>
          <button 
            onClick={() => handleFinishRound(true)}
            className="w-full py-4 bg-primary-container/10 border-2 border-primary-container text-primary-container font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-fixed transition-all uppercase tracking-wider active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          >
            SÍ, LA HA ADIVINADO (+1pt)
          </button>
          <button 
            onClick={() => handleFinishRound(false)}
            className="w-full py-4 border border-outline-variant text-outline hover:text-on-surface hover:border-on-surface transition-all uppercase tracking-wider active:scale-95"
          >
            NO, HA FALLADO
          </button>
        </div>
      ) : (
        <button 
          onClick={handleNext}
          className="w-full max-w-sm mt-12 py-4 border border-outline-variant text-on-surface font-label-pill text-label-pill rounded-lg hover:border-primary-container hover:text-primary-container hover:bg-primary-container/5 transition-all uppercase tracking-wider active:scale-95"
        >
          {isGameOverByNumber ? 'Ver Puntuaciones' : 'Continuar'}
        </button>
      )}
    </div>
  );
}
