import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameStateProvider } from './context/GameStateContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GameStateProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </GameStateProvider>
    </AuthProvider>
  </StrictMode>,
)
