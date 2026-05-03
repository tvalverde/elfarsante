import { HomeScreen } from './components/HomeScreen';
import { DistributionScreen } from './components/DistributionScreen';
import { DebateScreen } from './components/DebateScreen';
import { VotingScreen } from './components/VotingScreen';
import { ResultScreen } from './components/ResultScreen';
import { ScoreScreen } from './components/ScoreScreen';
import { RestorePromptScreen } from './components/RestorePromptScreen';
import { useGameState } from './context/GameStateContext';
import { useWakeLock } from './hooks/useWakeLock';

function App() {
  const { state } = useGameState();

  // Keep screen awake only during the DEBATE phase
  useWakeLock(state.currentPhase === 'DEBATE');

  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container bg-background">
      {/* TopAppBar */}
      <header className="docked full-width top-0 border-b border-neutral-800 flat no-shadows bg-neutral-950 flex justify-between items-center px-6 h-16 w-full z-40 sticky shrink-0">
        <div className="w-10"></div> {/* Spacer to keep title centered */}
        <h1 className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)] font-h1 uppercase tracking-widest pointer-events-none">EL FARSANTE</h1>
        <button 
          onClick={() => alert(
            "🕵️ BIENVENIDO A EL FARSANTE\n\n" +
            "OBJETIVO:\n" +
            "• Inocentes: Encontrar al Farsante antes de ser superados en número.\n" +
            "• Farsante: Pasar desapercibido y deducir la palabra secreta.\n\n" +
            "REGLAS:\n" +
            "1. Todos reciben la palabra secreta excepto el Farsante.\n" +
            "2. Por turnos, decid UNA SOLA PALABRA relacionada.\n" +
            "3. Tras el debate, votad al sospechoso.\n\n" +
            "SISTEMA DE PUNTOS:\n" +
            "✅ Inocentes: +1 pt por descubrir al Farsante.\n" +
            "💔 Inocente eliminado por error: +1 pt (consolación).\n" +
            "🎭 Farsante descubierto: +1 pt si adivina la palabra secreta.\n" +
            "🏆 Victoria Farsante: +2 pts si sobrevive o iguala en número a los inocentes."
          )}
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
    </div>
  );
}

export default App;
