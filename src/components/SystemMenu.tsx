import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGameState } from '../context/GameStateContext'
import { useToast } from '../context/ToastContext'
import { NeonButton } from './ui/NeonButton'
import { NeonModal } from './ui/NeonModal'

declare const __APP_VERSION__: string

type SystemView = 'menu' | 'instructions' | 'sync'

export function SystemMenu() {
  const { dispatch, syncStatus } = useGameState()
  const { showToast } = useToast()
  const { syncCode, linkDevice, unlinkDevice, syncUid } = useAuth()

  const [activeView, setActiveView] = useState<SystemView>('menu')
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

  const renderBackButton = (title: string) => (
    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
      <button
        onClick={() => setActiveView('menu')}
        className="flex items-center justify-center p-2 -ml-2 rounded-full text-outline hover:bg-surface-container hover:text-cyan-300 transition-colors active:scale-95"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <h2 className="text-primary-container font-black uppercase tracking-[0.2em] text-xs m-0 mt-0.5">
        {title}
      </h2>
    </div>
  )

  if (activeView === 'instructions') {
    return (
      <div className="flex flex-col pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderBackButton('Instrucciones')}

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
      </div>
    )
  }

  if (activeView === 'sync') {
    return (
      <div className="flex flex-col pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderBackButton('Sincronización')}

        <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-left border-b border-outline-variant/30 pb-3">
            <span className="text-[10px] text-outline uppercase font-bold tracking-tighter leading-tight">
              Tu código en este dispositivo:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-h1 text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] whitespace-nowrap tracking-widest">
                {syncCode || '...'}
              </span>
              {syncStatus === 'synced' && (
                <span className="material-symbols-outlined text-primary-container text-xl animate-in fade-in zoom-in duration-300">
                  cloud_done
                </span>
              )}
              {syncStatus === 'pending' && (
                <span className="material-symbols-outlined text-orange-400 text-xl animate-pulse">
                  cloud_sync
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="material-symbols-outlined text-neon-red text-xl animate-bounce">
                  cloud_off
                </span>
              )}
            </div>
          </div>

          {syncUid ? (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2 bg-primary-container/10 p-3 rounded text-primary-container border border-primary-container/20">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span className="text-xs font-bold uppercase tracking-wide">
                  Dispositivo Vinculado
                </span>
              </div>
              <button
                onClick={unlinkDevice}
                className="text-[10px] text-neon-red hover:text-white hover:bg-neon-red/20 transition-colors p-2 rounded text-center uppercase font-black tracking-widest border border-transparent hover:border-neon-red/50"
              >
                Desvincular perfil
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para recuperar tu historial o compartir partida con otro dispositivo, introduce su
                código:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={syncInput}
                  onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC-123"
                  className="bg-background border border-outline-variant text-white text-sm p-3 rounded-lg flex-grow outline-none focus:border-primary-container min-w-0 font-mono text-center tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
                  maxLength={7}
                />
              </div>
              <NeonButton
                variant="primary"
                fullWidth
                onClick={() => setShowLinkModal(true)}
                disabled={isLinking || syncInput.length < 3}
                className="py-3 text-sm mt-1"
              >
                {isLinking ? 'VINCULANDO...' : 'VINCULAR AHORA'}
              </NeonButton>
            </div>
          )}
        </div>

        <NeonModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          title="¿VINCULAR DISPOSITIVO?"
        >
          <div className="flex flex-col gap-6">
            <p className="text-on-surface-variant">
              Al vincularte a otro código, se{' '}
              <span className="text-primary-container font-bold">REEMPLAZARÁ</span> tu progreso
              actual en este dispositivo.
            </p>
            <p className="text-on-surface-variant text-sm border-l-2 border-primary-container pl-3 py-1 bg-primary-container/5">
              Asegúrate de tener apuntado tu código actual{' '}
              <span className="text-white font-bold">{syncCode}</span> si quieres volver a él más
              adelante.
            </p>
            <div className="flex flex-col gap-3">
              <NeonButton
                variant="primary"
                fullWidth
                onClick={handleLinkDevice}
                disabled={isLinking}
              >
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

  // Main Menu View
  return (
    <div className="flex flex-col gap-2 pb-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <button
        onClick={() => setActiveView('instructions')}
        className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-primary-container/50 hover:bg-surface-container-high transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">menu_book</span>
          <span className="font-bold text-sm tracking-wider uppercase text-white group-hover:text-primary-container transition-colors">
            Instrucciones
          </span>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">
          chevron_right
        </span>
      </button>

      <button
        onClick={() => setActiveView('sync')}
        className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-container border border-outline-variant/30 hover:border-primary-container/50 hover:bg-surface-container-high transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">cloud_sync</span>
          <span className="font-bold text-sm tracking-wider uppercase text-white group-hover:text-primary-container transition-colors">
            Sincronización en la Nube
          </span>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">
          chevron_right
        </span>
      </button>

      <button
        onClick={() => setShowHardResetModal(true)}
        className="flex items-center justify-between w-full p-4 rounded-xl bg-neon-red/5 border border-neon-red/20 hover:border-neon-red/60 hover:bg-neon-red/10 transition-all group mt-6"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-neon-red">delete_forever</span>
          <span className="font-bold text-sm tracking-wider uppercase text-neon-red group-hover:text-red-400 transition-colors">
            Borrar todos los datos
          </span>
        </div>
      </button>

      <div className="mt-8 text-center flex flex-col gap-1">
        <p className="text-[10px] text-outline uppercase tracking-[0.3em]">
          EL FARSANTE v{__APP_VERSION__}
        </p>
        <p className="text-[10px] text-outline/50 uppercase tracking-widest">
          Diseñado para la infamia
        </p>
      </div>

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
    </div>
  )
}
