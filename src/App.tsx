import { HomeScreen } from './components/HomeScreen';
import { DistributionScreen } from './components/DistributionScreen';
import { DebateScreen } from './components/DebateScreen';
import { VotingScreen } from './components/VotingScreen';
import { ResultScreen } from './components/ResultScreen';
import { ScoreScreen } from './components/ScoreScreen';
import { RestorePromptScreen } from './components/RestorePromptScreen';
import { useGameState } from './context/GameStateContext';

function App() {
  const { state } = useGameState();

  return (
    <div className="min-h-screen flex flex-col font-body-md text-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container bg-background">
      {/* TopAppBar */}
      <header className="docked full-width top-0 border-b border-neutral-800 flat no-shadows bg-neutral-950 flex justify-between items-center px-6 h-16 w-full z-40 sticky shrink-0">
        <button className="text-neutral-500 hover:text-cyan-300 transition-colors active:scale-95 duration-150 p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <h1 className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)] font-h1 uppercase tracking-widest pointer-events-none">EL FARSANTE</h1>
        <button className="text-neutral-500 hover:text-cyan-300 transition-colors active:scale-95 duration-150 p-2 -mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-container">
          <span className="material-symbols-outlined text-2xl">account_circle</span>
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
