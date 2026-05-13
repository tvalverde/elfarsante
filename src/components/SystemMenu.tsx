import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGameState } from '../context/GameStateContext'
import { useToast } from '../context/ToastContext'
import { NeonButton } from './ui/NeonButton'
import { NeonModal } from './ui/NeonModal'

declare const __APP_VERSION__: string

export function SystemMenu() {
  const { dispatch, syncStatus } = useGameState()
  const { showToast } = useToast()
  const { syncCode, linkDevice, unlinkDevice, syncUid } = useAuth()

  const [syncInput, setSyncCodeInput] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [showHardResetModal, setShowHardResetModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const handleLinkDevice = async () => {
    if (!syncInput) return
    setIsLinking(true)
    const success = await linkDevice(syncInput)
    setIsLinking(false)
    if (success) {
      showToast('¡Dispositivo vinculado con éxito!', 'success')
      setSyncCodeInput('')
      setShowLinkModal(false)
    } else {
      showToast('Código de vinculación inválido.', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* 1. Instrucciones */}
      <section className="flex flex-col gap-4">
        <h2 className="text-primary-container font-black uppercase tracking-[0.2em] text-xs border-b border-primary-container/20 pb-2">
          Instrucciones de Juego
        </h2>

        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2 text-sm">
              Objetivo
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-90 text-sm">
              <li>
                <span className="text-white font-semibold">Inocentes:</span> Encontrar al Farsante
                antes de ser superados en número.
              </li>
              <li>
                <span className="text-white font-semibold">Farsante:</span> Pasar desapercibido y
                deducir la palabra secreta.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2 text-sm">
              Reglas
            </h3>
            <ol className="list-decimal list-inside space-y-2 opacity-90 text-sm">
              <li>Todos reciben la palabra secreta excepto el Farsante.</li>
              <li>
                Por turnos, decid{' '}
                <span className="text-white font-semibold underline decoration-primary-container">
                  UNA SOLA PALABRA
                </span>{' '}
                relacionada con el secreto.
              </li>
              <li>Tras el debate, votad al sospechoso.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-primary-container font-bold uppercase tracking-wider mb-2 text-sm">
              Sistema de Puntos
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-primary-container">✅</span>
                <p>
                  <span className="text-white font-semibold">Inocentes:</span> +1 pt por descubrir
                  al Farsante.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-neon-red">💔</span>
                <p>
                  <span className="text-white font-semibold">Error:</span> +1 pt de consolación si
                  eres eliminado siendo inocente.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-container">🎭</span>
                <p>
                  <span className="text-white font-semibold">Farsante Audaz:</span> +1 pt si eres
                  descubierto pero adivinas la palabra.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary-container">🏆</span>
                <p>
                  <span className="text-white font-semibold">Victoria Farsante:</span> +2 pts si
                  sobrevives hasta el final.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* 2. Sincronización en la Nube */}
      <section className="flex flex-col gap-4">
        <h2 className="text-primary-container font-black uppercase tracking-[0.2em] text-xs border-b border-primary-container/20 pb-2">
          Sincronización en la Nube
        </h2>

        <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant flex flex-col gap-3">
          <div className="flex justify-between items-center text-left">
            <span className="text-[10px] text-outline uppercase font-bold tracking-tighter leading-tight pr-4">
              Tu código de este dispositivo:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-h1 text-lg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] whitespace-nowrap">
                {syncCode || '...'}
              </span>
              {syncStatus === 'synced' && (
                <span className="material-symbols-outlined text-primary-container text-lg animate-in fade-in zoom-in duration-300">
                  cloud_done
                </span>
              )}
              {syncStatus === 'pending' && (
                <span className="material-symbols-outlined text-orange-400 text-lg animate-pulse">
                  cloud_sync
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="material-symbols-outlined text-neon-red text-lg animate-bounce">
                  cloud_off
                </span>
              )}
            </div>
          </div>

          {syncUid ? (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-outline-variant/20">
              <p className="text-[10px] text-primary-container font-bold uppercase">
                ✓ Dispositivo Vinculado
              </p>
              <button
                onClick={unlinkDevice}
                className="text-[10px] text-neon-red hover:underline text-left uppercase font-black"
              >
                Desvincular y usar perfil local
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-on-surface-variant leading-tight">
                Usa el código de otro dispositivo para sincronizar tus partidas e historial.
              </p>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={syncInput}
                  onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO (ABC-123)"
                  className="bg-surface-container-high border border-outline-variant text-white text-xs p-2 rounded flex-grow outline-none focus:border-primary-container min-w-0"
                  maxLength={7}
                />
                <button
                  onClick={() => setShowLinkModal(true)}
                  disabled={isLinking}
                  className="bg-primary-container text-background px-3 py-2 rounded text-[10px] font-black uppercase disabled:opacity-50 whitespace-nowrap"
                >
                  {isLinking ? '...' : 'VINCULAR'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Zona de Peligro */}
      <section className="flex flex-col gap-4">
        <h2 className="text-neon-red font-black uppercase tracking-[0.2em] text-xs border-b border-neon-red/20 pb-2">
          Zona de Peligro
        </h2>
        <button
          onClick={() => setShowHardResetModal(true)}
          className="w-full py-3 border border-neon-red/30 text-neon-red/60 hover:text-neon-red hover:border-neon-red hover:bg-neon-red/5 transition-all uppercase text-xs font-bold tracking-[0.2em] rounded-full"
        >
          Borrar todos los datos
        </button>
      </section>

      <p className="text-[10px] text-outline text-center uppercase tracking-widest mt-4">
        v{__APP_VERSION__} • Diseñado para la infamia
      </p>

      {/* Modals Internos */}
      <NeonModal
        isOpen={showHardResetModal}
        onClose={() => setShowHardResetModal(false)}
        title="¿BORRAR TODO?"
      >
        <div className="flex flex-col gap-6">
          <p className="text-on-surface-variant">
            Esta acción es <span className="text-neon-red font-bold">IRREVERSIBLE</span>. Se
            borrarán todos los jugadores, puntuaciones e historial de palabras.
          </p>
          <div className="flex flex-col gap-3">
            <NeonButton
              variant="primary"
              fullWidth
              onClick={() => {
                dispatch({ type: 'HARD_RESET' })
                window.location.reload()
              }}
              className="!bg-neon-red/20 !border-neon-red !text-neon-red hover:!bg-neon-red hover:!text-white"
            >
              SÍ, BORRAR TODO
            </NeonButton>
            <NeonButton variant="ghost" fullWidth onClick={() => setShowHardResetModal(false)}>
              CANCELAR
            </NeonButton>
          </div>
        </div>
      </NeonModal>

      <NeonModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="¿VINCULAR DISPOSITIVO?"
      >
        <div className="flex flex-col gap-6">
          <p className="text-on-surface-variant">
            Al vincularte a otro código, se{' '}
            <span className="text-primary-container font-bold">REEMPLAZARÁ</span> tu progreso actual
            en este dispositivo.
          </p>
          <p className="text-on-surface-variant text-sm border-l-2 border-primary-container pl-3 py-1 bg-primary-container/5">
            Asegúrate de tener apuntado tu código actual{' '}
            <span className="text-white font-bold">{syncCode}</span> si quieres volver a él más
            adelante.
          </p>
          <div className="flex flex-col gap-3">
            <NeonButton variant="primary" fullWidth onClick={handleLinkDevice} disabled={isLinking}>
              {isLinking ? 'VINCULANDO...' : 'SÍ, VINCULAR'}
            </NeonButton>
            <NeonButton variant="ghost" fullWidth onClick={() => setShowLinkModal(false)}>
              CANCELAR
            </NeonButton>
          </div>
        </div>
      </NeonModal>
    </div>
  )
}
